from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.infrastructure.database import SessionLocal
from src.api.v1.api import api_router # This will be created later

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events for the FastAPI application.
    """
    print("Application startup.")
    # Database initialization is now handled in the test fixtures or separate migration scripts.
    # No direct call to init_db() here to avoid issues with test setup.
    yield
    print("Application shutdown.")

app = FastAPI(
    title="Alpha Grit Backend API",
    version="1.0.0",
    description="API for managing Alpha Grit e-commerce operations (Products, Orders, Users, Content, Reviews, Refunds)",
    lifespan=lifespan
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",  # Allow all origins for development (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Alpha Grit Backend API. Access /api/v1/docs for API documentation."}

# You can run this file using: uvicorn main:app --reload --port 8000
# From the src/ directory
