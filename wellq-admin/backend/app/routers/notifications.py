"""
routers/notifications.py — Endpoints de Notificaciones
=======================================================
Envío de notificaciones in-app o email a clínicas, y consulta
del historial de notificaciones enviadas.
"""

from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from google.cloud.firestore import Client
from datetime import datetime, timezone
import uuid

from app.auth.dependencies import require_admin, CurrentUser
from app.db.firestore import get_db, Collections
from app.models.notification import (
    SendNotificationRequest, NotificationRecord,
    NotificationListResponse, NotificationStatus
)

router = APIRouter(prefix="/api/notifications", tags=["Notificaciones"])


@router.post(
    "",
    summary="Enviar notificación a una o varias clínicas",
    description="""
    Envía una notificación in-app o por email a las clínicas especificadas.
    Si `scheduledFor` está presente, la notificación se programa para ese momento.
    Para enviar a todas las clínicas, incluye "all" en `recipientClinicIds`.
    """,
    response_model=dict,
    status_code=status.HTTP_202_ACCEPTED,
)
async def send_notification(
    body: SendNotificationRequest,
    current_user: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> dict:
    """
    Crea registros de notificación en Firestore (uno por clínica destinataria).
    Si el canal es email, en producción esto encolaría un job a BullMQ/Cloud Tasks.
    """
    now = datetime.now(timezone.utc)
    created_ids = []

    # Si "all" está en la lista, obtener todas las clínicas activas
    recipient_ids = body.recipient_clinic_ids
    if "all" in recipient_ids:
        clinics_ref = db.collection(Collections.CLINICS).stream()
        recipient_ids = [doc.id for doc in clinics_ref]

    # Crear un registro de notificación por cada clínica destinataria
    for clinic_id in recipient_ids:
        notif_id = str(uuid.uuid4())
        db.collection(Collections.NOTIFICATIONS).document(notif_id).set({
            "id": notif_id,
            "title": body.title,
            "message": body.message,
            "channel": body.channel.value,
            "status": NotificationStatus.PENDING.value,
            "recipientClinicId": clinic_id,
            "sentBy": current_user.sub,
            "createdAt": now,
            "sentAt": None,
            "scheduledFor": body.scheduled_for,
            "senderName": body.sender_name or current_user.name,
        })
        created_ids.append(notif_id)

    return {
        "message": f"Notificación encolada para {len(created_ids)} clínica(s).",
        "notificationIds": created_ids,
        "channel": body.channel.value,
    }


@router.get(
    "",
    summary="Historial de notificaciones",
    description="""
    Lista paginada de todas las notificaciones enviadas.
    Se puede filtrar por clínica, canal o estado.
    """,
    response_model=NotificationListResponse,
)
async def list_notifications(
    clinic_id: str | None = Query(None, alias="clinicId"),
    channel: str | None = None,
    notif_status: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100, alias="pageSize"),
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> NotificationListResponse:
    """
    Lee notificaciones de Firestore aplicando los filtros disponibles.
    """
    from google.cloud.firestore_v1.base_query import FieldFilter

    query = db.collection(Collections.NOTIFICATIONS)

    if clinic_id:
        query = query.where(filter=FieldFilter("recipientClinicId", "==", clinic_id))
    if channel:
        query = query.where(filter=FieldFilter("channel", "==", channel))
    if notif_status:
        query = query.where(filter=FieldFilter("status", "==", notif_status))

    query = query.order_by("createdAt", direction="DESCENDING")

    docs = list(query.stream())
    total = len(docs)

    # Paginación en memoria
    start = (page - 1) * page_size
    end = start + page_size
    page_docs = docs[start:end]

    notifications = [
        NotificationRecord(**{**doc.to_dict(), "id": doc.id})
        for doc in page_docs
    ]

    return NotificationListResponse(
        data=notifications,
        total=total,
        page=page,
        hasNext=end < total,
    )


@router.get(
    "/{notification_id}",
    summary="Detalle de una notificación",
    response_model=NotificationRecord,
)
async def get_notification(
    notification_id: str = Path(..., description="ID de la notificación"),
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> NotificationRecord:
    """Obtiene el detalle de una notificación específica por su ID."""
    doc = db.collection(Collections.NOTIFICATIONS).document(notification_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Notificación no encontrada.")
    return NotificationRecord(**{**doc.to_dict(), "id": doc.id})
