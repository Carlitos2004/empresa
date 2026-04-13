"""
routers/dashboard.py — Endpoints del Dashboard Overview
========================================================
Expone los datos de ambas pestañas del dashboard:
  - Business Health: KPIs, gráfico MRR, heatmap de churn, alertas
  - Operational Status: servidores, procesos, uso de la app
"""

from fastapi import APIRouter, Depends, Query
from google.cloud.firestore import Client
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth.dependencies import require_admin, CurrentUser
from app.db.firestore import get_db
from app.db.mongodb import get_mongo_db
from app.services import dashboard_service
from app.models.dashboard import (
    BusinessHealthKPIs, MRRChartResponse,
    NeedsAttentionItem, OperationalStatusResponse
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/health/kpis",
    summary="KPIs de salud del negocio",
    description="""
    Retorna los 6 KPIs de la pestaña Business Health del dashboard:
    MRR Total, Clínicas Activas, Churn Rate, Health Score Promedio,
    Facturas Pendientes y Nuevas Clínicas del mes.
    Combina datos de Firestore y MongoDB.
    """,
    response_model=BusinessHealthKPIs,
)
async def get_health_kpis(
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> BusinessHealthKPIs:
    """
    Calcula los KPIs combinando Firestore (datos operativos)
    y MongoDB (agregaciones históricas de MRR y churn).
    """
    return await dashboard_service.get_business_health_kpis(db, mongo)


@router.get(
    "/health/mrr-chart",
    summary="Datos del gráfico de MRR",
    description="""
    Retorna la serie temporal de MRR de los últimos N meses (defecto: 12).
    Incluye desglose por MRR nuevo, expansión y churn.
    Datos obtenidos de MongoDB (snapshots históricos).
    """,
    response_model=MRRChartResponse,
)
async def get_mrr_chart(
    months: int = Query(12, ge=1, le=24, description="Número de meses a incluir"),
    _: CurrentUser = Depends(require_admin),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> MRRChartResponse:
    """Genera los datos para el gráfico de MRR a partir de snapshots en MongoDB."""
    return await dashboard_service.get_mrr_chart(mongo, months=months)


@router.get(
    "/health/needs-attention",
    summary="Clínicas y eventos que requieren atención",
    description="""
    Lista de hasta 20 items ordenados por severidad (critical → warning → info).
    Incluye clínicas en estado crítico, facturas vencidas, y clínicas
    sin login reciente. Datos de Firestore.
    """,
    response_model=list[NeedsAttentionItem],
)
async def get_needs_attention(
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> list[NeedsAttentionItem]:
    """Consolida alertas y problemas activos que el administrador debe revisar."""
    return await dashboard_service.get_needs_attention(db)


@router.get(
    "/operational",
    summary="Estado operativo de la plataforma",
    description="""
    Estado en tiempo real de servidores, procesos del sistema y
    métricas de uso de la app de clínica.
    Los datos provienen de la colección platform_metrics de Firestore,
    que se actualiza cada minuto por el worker de monitoreo.
    """,
    response_model=OperationalStatusResponse,
)
async def get_operational_status(
    _: CurrentUser = Depends(require_admin),
    db: Client = Depends(get_db),
) -> OperationalStatusResponse:
    """
    Lee el snapshot de métricas operativas más reciente de Firestore.
    Si no hay datos, retorna un objeto con estado desconocido.
    """
    return await dashboard_service.get_operational_status(db)
