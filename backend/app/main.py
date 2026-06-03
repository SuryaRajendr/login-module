from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import api_router
from app.core.config import settings
from app.db.migrations import ensure_user_profile_columns
from app.db.session import Base, engine
from app.services.user_service import ensure_admin_user


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.client_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(StarletteHTTPException)
    def http_exception_handler(_, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": str(exc.detail),
                "data": None,
            },
        )

    @app.exception_handler(RequestValidationError)
    def validation_exception_handler(_, exc: RequestValidationError) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        message = first_error.get("msg", "Invalid request data.")
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": message,
                "data": None,
            },
        )

    @app.on_event("startup")
    def on_startup() -> None:
        Base.metadata.create_all(bind=engine)
        ensure_user_profile_columns()
        ensure_admin_user()

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
