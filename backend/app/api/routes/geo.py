from typing import Any

from fastapi import APIRouter

from app.services.geo_service import get_geo_data

router = APIRouter()


@router.get("/geo")
async def get_geo() -> Any:
    return get_geo_data()
