from fastapi import FastAPI

from app.api.routes.geo import router as geo_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Geo API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    app.include_router(geo_router)
    return app


app = create_app()