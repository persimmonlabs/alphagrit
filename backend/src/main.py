"""
Alpha Grit Backend API

FastAPI application entry point with production-ready configuration.
"""
import logging
import time
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from src.settings import get_settings
from src.infrastructure.database import SessionLocal, engine
from src.infrastructure.base import Base
from src.api.v1.api import api_router

# Import all models to register them with Base.metadata
from src.infrastructure.repositories.sqlalchemy_product_repository import ProductORM, CategoryORM
from src.infrastructure.repositories.sqlalchemy_order_repository import CartItemORM, OrderORM, OrderItemORM, DownloadLinkORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM
from src.infrastructure.repositories.sqlalchemy_content_repository import BlogPostORM, FaqORM, SiteConfigSettingORM, FeatureFlagORM
from src.infrastructure.repositories.sqlalchemy_review_repository import ReviewORM
from src.infrastructure.repositories.sqlalchemy_refund_repository import RefundRequestORM
from src.infrastructure.repositories.sqlalchemy_notification_repository import EmailLogORM
from src.infrastructure.repositories.sqlalchemy_ebook_repository import EbookORM, EbookChapterORM, EbookSectionORM, EbookContentBlockORM, EbookReadingProgressORM, EbookAccessORM

# Configure logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.

    Handles startup and shutdown events.
    """
    logger.info(f"Starting Alpha Grit API ({settings.ENVIRONMENT})")

    # Startup: verify database connection and create tables
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection verified")

        # Create all tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database setup failed: {e}")
        # Don't fail startup, let health check handle it

    yield

    logger.info("Shutting down Alpha Grit API")


# Create FastAPI application
app = FastAPI(
    title="Alpha Grit Backend API",
    version="1.0.0",
    description="""
    API for Alpha Grit e-commerce platform.

    ## Features
    - **Products**: E-book catalog management
    - **Orders**: Cart and checkout processing
    - **Users**: Profile and authentication
    - **Content**: Blog, FAQ, site configuration
    - **Reviews**: Customer feedback system
    - **Payments**: Stripe and Mercado Pago integration
    - **Storage**: R2 file uploads

    ## Authentication
    Most endpoints require JWT authentication. Use `/api/v1/auth/login` to get tokens.
    Include the access token in the Authorization header: `Bearer <token>`
    """,
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production() else None,
    redoc_url="/redoc" if not settings.is_production() else "/docs",
    openapi_url="/openapi.json" if not settings.is_production() else None
)


# ===========================================
# Middleware
# ===========================================

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list if settings.allowed_origins_list else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    """Log all requests with timing."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )

    # Add timing header
    response.headers["X-Process-Time"] = str(process_time)
    return response


# ===========================================
# Exception Handlers
# ===========================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with structured response."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),  # Skip "body"
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled error: {exc}", exc_info=True)

    # Don't expose internal errors in production
    if settings.is_production():
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )


# ===========================================
# Health Check Endpoints
# ===========================================

@app.get("/health", tags=["health"])
async def health_check():
    """
    Basic health check.

    Returns 200 if the API is running.
    """
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


@app.get("/health/ready", tags=["health"])
async def readiness_check():
    """
    Readiness check with dependency verification.

    Checks database connectivity and returns detailed status.
    """
    checks = {
        "database": False,
        "stripe": settings.has_stripe_config(),
        "mercado_pago": settings.has_mercado_pago_config(),
        "r2_storage": settings.has_r2_config()
    }

    # Check database
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        checks["database"] = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    # Determine overall status
    is_ready = checks["database"]  # Database is required

    if not is_ready:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "checks": checks
            }
        )

    return {
        "status": "ready",
        "checks": checks
    }


@app.get("/health/live", tags=["health"])
async def liveness_check():
    """
    Liveness check.

    Returns 200 if the process is alive.
    Used by orchestrators to determine if the container needs restart.
    """
    return {"status": "alive"}


# ===========================================
# Root Endpoint
# ===========================================

@app.get("/", tags=["root"])
async def root():
    """
    API root endpoint.

    Returns basic API information and documentation links.
    """
    return {
        "message": "Welcome to Alpha Grit Backend API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if not settings.is_production() else "/redoc",
        "api": "/api/v1"
    }


# ===========================================
# Include API Router
# ===========================================

app.include_router(api_router, prefix="/api/v1")


# ===========================================
# Run with uvicorn (for development)
# ===========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
