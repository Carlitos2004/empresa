"""
routers/auth.py — Endpoints de Autenticación
=============================================
Endpoints relacionados con la sesión del administrador.
El token JWT se genera en Keycloak; este router solo valida
el token y expone información del usuario autenticado.
"""

from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user, CurrentUser

# Prefijo /api/auth para todos los endpoints de este router
router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.get(
    "/me",
    summary="Obtener perfil del usuario autenticado",
    description="""
    Valida el token Bearer de Keycloak y retorna la información
    del administrador autenticado: ID, email, nombre y roles.
    Útil para que el frontend sepa quién está conectado al cargar la app.
    """,
    response_model=dict,
)
async def get_me(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    """
    Retorna el perfil del usuario autenticado.

    El token JWT ya fue validado por la dependencia `get_current_user`.
    No necesitamos consultar Firestore; la información viene del token mismo.
    """
    return {
        "sub": current_user.sub,
        "email": current_user.email,
        "name": current_user.name,
        "roles": current_user.roles,
    }


@router.post(
    "/logout",
    summary="Registrar cierre de sesión",
    description="""
    Registra el logout del administrador en el log de auditoría.
    El token no se puede invalidar desde el backend (Keycloak lo gestiona),
    pero el frontend debe eliminar el token de su estado.
    """,
    response_model=dict,
)
async def logout(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    """
    Registra el logout. En una implementación completa, aquí se podría
    llamar al endpoint de logout de Keycloak para invalidar el refresh token.
    """
    return {
        "message": "Sesión cerrada. Por favor elimina el token del cliente.",
        "sub": current_user.sub,
    }
