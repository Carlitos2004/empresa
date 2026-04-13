"""
routers/platform.py — Endpoints de Platform Ops
================================================
Métricas de infraestructura: costos, latencia de modelos IA,
análisis de poses y distribución de versiones de la app móvil.
Corresponde a la sección Platform Ops del wireframe.
"""

from fastapi import APIRouter, Depends, Query
from google.cloud.firestore import Client
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta

from app.auth.dependencies import require_admin, CurrentUser
from app.db.firestore import get_db
from app.db.mongodb import get_mongo_db
from app.models.platform import (
    InfrastructureCostResponse, CostBreakdown,
    ModelLatencyMetric, LatencyPercentiles,
    PoseAnalysisStat, AppVersionBucket, InfraNode
)
from app.db.mongodb import MongoCollections

router = APIRouter(prefix="/api/platform", tags=["Platform Ops"])


@router.get(
    "/costs",
    summary="Costos de infraestructura del mes actual",
    description="""
    Desglose de costos por categoría (Compute, Storage, AI Models, Red, BD)
    y comparación con el mes anterior. Datos de MongoDB.
    """,
    response_model=InfrastructureCostResponse,
)
async def get_infrastructure_costs(
    _: CurrentUser = Depends(require_admin),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> InfrastructureCostResponse:
    """
    Agrega los registros de costos del mes actual en MongoDB y
    calcula el porcentaje de uso del presupuesto.
    """
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Agregar costos por categoría en el mes actual
    pipeline = [
        {"$match": {"date": {"$gte": month_start}}},
        {"$group": {
            "_id": "$category",
            "total": {"$sum": "$amount_usd"},
        }},
        {"$sort": {"total": -1}},
    ]

    cursor = mongo[MongoCollections.COST_METRICS].aggregate(pipeline)
    cost_docs = await cursor.to_list(length=20)

    total_usd = sum(d["total"] for d in cost_docs)
    budget_usd = 8500.0  # TODO: leer de configuración en Firestore

    breakdown = [
        CostBreakdown(
            category=doc["_id"],
            amountUsd=doc["total"],
            percentOfTotal=(doc["total"] / total_usd * 100) if total_usd else 0,
            vsLastMonth=0.0,  # TODO: comparar con mes anterior
        )
        for doc in cost_docs
    ]

    return InfrastructureCostResponse(
        totalUsd=total_usd,
        budgetUsd=budget_usd,
        budgetUsedPercent=(total_usd / budget_usd * 100) if budget_usd else 0,
        breakdown=breakdown,
        period=now.strftime("%B %Y"),
        lastUpdated=now,
    )


@router.get(
    "/latency",
    summary="Métricas de latencia de modelos IA",
    description="""
    Percentiles de latencia (p50, p90, p95, p99) por modelo de IA,
    tasa de requests y tasa de errores. Datos de MongoDB.
    """,
    response_model=list[ModelLatencyMetric],
)
async def get_model_latency(
    hours: int = Query(24, ge=1, le=168, description="Ventana de tiempo en horas"),
    _: CurrentUser = Depends(require_admin),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> list[ModelLatencyMetric]:
    """
    Calcula percentiles de latencia por modelo usando la función percentile
    de la agregación de MongoDB para la ventana de tiempo indicada.
    """
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    pipeline = [
        {"$match": {"timestamp": {"$gte": since}}},
        {"$group": {
            "_id": {"model": "$model_name", "version": "$version", "endpoint": "$endpoint"},
            "latencies": {"$push": "$latency_ms"},
            "errors": {"$sum": {"$cond": [{"$eq": ["$status", "error"]}, 1, 0]}},
            "total": {"$sum": 1},
            "last_seen": {"$max": "$timestamp"},
        }},
    ]

    cursor = mongo[MongoCollections.LATENCY_METRICS].aggregate(pipeline)
    docs = await cursor.to_list(length=20)

    results = []
    for doc in docs:
        latencies = sorted(doc["latencies"])
        n = len(latencies)

        # Calcular percentiles manualmente
        def percentile(arr, p):
            if not arr:
                return 0.0
            idx = int(len(arr) * p / 100)
            return arr[min(idx, len(arr) - 1)]

        results.append(ModelLatencyMetric(
            modelName=doc["_id"]["model"],
            version=doc["_id"]["version"],
            endpoint=doc["_id"]["endpoint"],
            latencyMs=LatencyPercentiles(
                p50=percentile(latencies, 50),
                p90=percentile(latencies, 90),
                p95=percentile(latencies, 95),
                p99=percentile(latencies, 99),
            ),
            requestsPerMin=doc["total"] / (hours * 60),
            errorRate=doc["errors"] / doc["total"] if doc["total"] else 0,
            status="optimal",
        ))

    return results


@router.get(
    "/pose-analysis",
    summary="Estadísticas del análisis de poses",
    description="""
    Rendimiento del motor de análisis de poses: volumen de análisis,
    tiempo de procesamiento promedio, precisión y utilización de GPU.
    """,
    response_model=PoseAnalysisStat,
)
async def get_pose_analysis_stats(
    _: CurrentUser = Depends(require_admin),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> PoseAnalysisStat:
    """
    Calcula estadísticas del motor de poses de los últimos 7 días.
    """
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Contar análisis de hoy
    today_count = await mongo[MongoCollections.POSE_ANALYSIS].count_documents(
        {"timestamp": {"$gte": today_start}}
    )

    # Contar análisis de la semana
    week_count = await mongo[MongoCollections.POSE_ANALYSIS].count_documents(
        {"timestamp": {"$gte": week_ago}}
    )

    # Promediar tiempo de procesamiento y precisión
    pipeline = [
        {"$match": {"timestamp": {"$gte": week_ago}}},
        {"$group": {
            "_id": None,
            "avg_time": {"$avg": "$processing_time_ms"},
            "avg_accuracy": {"$avg": "$accuracy"},
            "avg_gpu": {"$avg": "$gpu_utilization"},
            "models": {"$addToSet": "$model_name"},
        }},
    ]

    cursor = mongo[MongoCollections.POSE_ANALYSIS].aggregate(pipeline)
    agg = await cursor.to_list(1)
    stats = agg[0] if agg else {}

    return PoseAnalysisStat(
        analysesToday=today_count,
        analysesThisWeek=week_count,
        avgProcessingTimeMs=stats.get("avg_time", 0),
        accuracyPercent=stats.get("avg_accuracy", 0) * 100,
        modelsInUse=stats.get("models", []),
        gpuUtilizationPercent=stats.get("avg_gpu", 0),
    )


@router.get(
    "/app-versions",
    summary="Distribución de versiones de la app móvil",
    description="""
    Muestra qué versión de la app usa cada clínica (iOS y Android).
    Útil para identificar clínicas desactualizadas que podrían
    tener problemas de compatibilidad.
    """,
    response_model=list[AppVersionBucket],
)
async def get_app_version_distribution(
    _: CurrentUser = Depends(require_admin),
    mongo: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> list[AppVersionBucket]:
    """
    Agrega la distribución de versiones de la app por clínica y plataforma.
    """
    pipeline = [
        {"$group": {
            "_id": {"version": "$version", "platform": "$platform"},
            "clinic_count": {"$addToSet": "$clinic_id"},
            "user_count": {"$sum": "$user_count"},
            "is_latest": {"$first": "$is_latest"},
            "is_supported": {"$first": "$is_supported"},
        }},
        {"$project": {
            "version": "$_id.version",
            "platform": "$_id.platform",
            "clinic_count": {"$size": "$clinic_count"},
            "user_count": 1,
            "is_latest": 1,
            "is_supported": 1,
        }},
        {"$sort": {"clinic_count": -1}},
    ]

    cursor = mongo[MongoCollections.APP_VERSIONS].aggregate(pipeline)
    docs = await cursor.to_list(length=50)
    total_clinics = sum(d["clinic_count"] for d in docs) or 1

    return [
        AppVersionBucket(
            version=doc["version"],
            platform=doc["platform"],
            clinicCount=doc["clinic_count"],
            userCount=doc.get("user_count", 0),
            percent=doc["clinic_count"] / total_clinics * 100,
            isLatest=doc.get("is_latest", False),
            isSupported=doc.get("is_supported", True),
        )
        for doc in docs
    ]
