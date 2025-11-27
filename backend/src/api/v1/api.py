from fastapi import APIRouter
from src.api.v1.endpoints import products # NEW IMPORT
from src.api.v1.endpoints import orders # NEW IMPORT
from src.api.v1.endpoints import users # NEW IMPORT
from src.api.v1.endpoints import content # NEW IMPORT
from src.api.v1.endpoints import reviews # NEW IMPORT
from src.api.v1.endpoints import refunds # NEW IMPORT
from src.api.v1.endpoints import auth # NEW IMPORT
from src.api.v1.endpoints import admin # NEW IMPORT
from src.api.v1.endpoints import uploads # NEW IMPORT
from src.api.v1.endpoints import ebooks # NEW IMPORT

api_router = APIRouter()

# Routers will be imported and included here as they are created
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(refunds.router, prefix="/refunds", tags=["refunds"])
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(uploads.router)
api_router.include_router(ebooks.router, prefix="/ebooks", tags=["ebooks"])
