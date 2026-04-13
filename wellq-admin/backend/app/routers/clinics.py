"""
routers/clinics.py — Endpoints de Gestión de Clínicas
======================================================
CRUD de clínicas, filtros avanzados, detalle, actualización
e impersonación. Corresponde a la sección Clinic Management del wireframe.
"""

from fastapi import APIRouter, Depends, Path, Body, HTTPException, status
from google.cloud.firestore import Client

from app.auth.dependencies import require_admin, require_super_admin, CurrentUser
from app.db.firestore import get_db
from app.services import clinic_service
from app.models.clinic import (
    ClinicListResponse, ClinicDetail, ClinicFilters,
    UpdateClinicRequest, ImpersonateRequest, ImpersonateResponse
)

router = APIRouter(prefix="/api/clinics", tags=["Gestión de Clínicas"])


@router.get(
    "",
    summary="Listar clínicas con filtros y paginación",
    description="""
    Retorna la lista paginada de clínicas. Soporta filtrado por tier,
    estado y búsqueda de texto libre por nombre.
    Parámetros de paginación: page (defecto 1), pageSize (defecto 20, máx 100).
    """,
    response_model=ClinicListResponse,
)
async def list_clinics(
    # Filtros como query params — FastAPI los parsea automáticamente desde el modelo
    search: str | None = None,
    tier: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "name",
    sort_order: str = "asc",
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> ClinicListResponse:
    """
    Lista clínicas aplicando los filtros recibidos como query parameters.
    El filtrado de texto se realiza en memoria tras la consulta a Firestore.
    """
    filters = ClinicFilters(
        search=search,
        tier=tier,
        status=status,
        page=page,
        pageSize=page_size,
        sortBy=sort_by,
        sortOrder=sort_order,
    )
    return await clinic_service.list_clinics(db, filters)


@router.get(
    "/{clinic_id}",
    summary="Obtener detalle de una clínica",
    description="""
    Retorna toda la información de una clínica: datos base, contacto,
    suscripción, facturas pendientes y notas internas.
    Se muestra en el drawer lateral al hacer clic en una fila de la tabla.
    """,
    response_model=ClinicDetail,
)
async def get_clinic(
    clinic_id: str = Path(..., description="ID único de la clínica en Firestore"),
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> ClinicDetail:
    """Obtiene el detalle completo de una clínica por su ID."""
    try:
        return await clinic_service.get_clinic_by_id(db, clinic_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch(
    "/{clinic_id}",
    summary="Actualizar campos de una clínica",
    description="""
    Actualización parcial (PATCH): solo se actualizan los campos enviados.
    Permite cambiar tier, estado, límite de pacientes o notas internas.
    Requiere rol de administrador. Registra quién hizo el cambio.
    """,
    response_model=ClinicDetail,
)
async def update_clinic(
    clinic_id: str = Path(..., description="ID de la clínica a actualizar"),
    updates: UpdateClinicRequest = Body(...),
    current_user: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> ClinicDetail:
    """Actualiza parcialmente una clínica y retorna el documento actualizado."""
    try:
        return await clinic_service.update_clinic(
            db, clinic_id, updates, updated_by=current_user.sub
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{clinic_id}/impersonate",
    summary="Iniciar sesión de impersonación",
    description="""
    Genera un token temporal para que un super-administrador acceda
    a la clínica como si fuera un usuario de esa clínica.
    Requiere rol 'wellq-super-admin' y un motivo obligatorio para auditoría.
    Todas las sesiones de impersonación quedan registradas en Firestore.
    """,
    response_model=ImpersonateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def impersonate_clinic(
    clinic_id: str = Path(..., description="ID de la clínica a impersonar"),
    body: ImpersonateRequest = Body(...),
    current_user: CurrentUser = Depends(require_super_admin),
    db: Client = Depends(get_db),
) -> ImpersonateResponse:
    """
    Solo super-admins pueden impersonar clínicas.
    El motivo es obligatorio para mantener un rastro de auditoría completo.
    """
    try:
        return await clinic_service.impersonate_clinic(
            db, clinic_id, admin_sub=current_user.sub, reason=body.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
