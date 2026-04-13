"""
routers/jobs.py — Endpoints de Jobs Asíncronos
===============================================
Consulta del estado de operaciones de larga duración (exportaciones,
cálculos de reportes, migraciones) ejecutadas en segundo plano.
"""

from fastapi import APIRouter, Depends, Path, HTTPException, status
from google.cloud.firestore import Client
from datetime import datetime, timezone
import uuid

from app.auth.dependencies import require_admin, CurrentUser
from app.db.firestore import get_db, Collections
from app.models.notification import JobRecord, JobStatus

router = APIRouter(prefix="/api/jobs", tags=["Jobs Asíncronos"])


@router.get(
    "/{job_id}",
    summary="Consultar estado de un job asíncrono",
    description="""
    El frontend usa este endpoint para hacer polling sobre el estado de un job
    de larga duración (exportación CSV, cálculo de reporte, etc.).
    Retorna el progreso (0-100%), estado y URL del resultado cuando finaliza.
    """,
    response_model=JobRecord,
)
async def get_job_status(
    job_id: str = Path(..., description="ID del job a consultar"),
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> JobRecord:
    """
    Lee el registro del job desde Firestore.
    El worker que procesa el job actualiza este documento con el progreso.
    """
    doc = db.collection(Collections.JOB_RECORDS).document(job_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' no encontrado."
        )
    return JobRecord(**{**doc.to_dict(), "id": doc.id})


@router.post(
    "/export-clinics",
    summary="Lanzar exportación de datos de clínicas",
    description="""
    Crea un job asíncrono para exportar todas las clínicas a un archivo CSV.
    Retorna el ID del job para hacer polling con GET /api/jobs/{job_id}.
    El CSV estará disponible en `resultUrl` cuando el job complete.
    """,
    response_model=JobRecord,
    status_code=status.HTTP_202_ACCEPTED,
)
async def export_clinics(
    current_user: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> JobRecord:
    """
    Crea el registro del job en Firestore.
    En producción, aquí también se encolaría el job en Cloud Tasks o BullMQ.
    """
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    job_data = {
        "id": job_id,
        "jobType": "export_clinics",
        "status": JobStatus.QUEUED.value,
        "progress": 0,
        "createdBy": current_user.sub,
        "createdAt": now,
        "startedAt": None,
        "completedAt": None,
        "resultUrl": None,
        "error": None,
    }

    db.collection(Collections.JOB_RECORDS).document(job_id).set(job_data)

    return JobRecord(**job_data)
