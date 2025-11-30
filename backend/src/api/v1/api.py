from fastapi import APIRouter
from src.api.v1.endpoints import products
from src.api.v1.endpoints import orders
from src.api.v1.endpoints import users
from src.api.v1.endpoints import content
from src.api.v1.endpoints import reviews
from src.api.v1.endpoints import refunds
from src.api.v1.endpoints import auth
from src.api.v1.endpoints import admin
from src.api.v1.endpoints import uploads
from src.api.v1.endpoints import ebooks
from src.api.v1.endpoints import webhooks

api_router = APIRouter()

# Include all endpoint routers
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
api_router.include_router(webhooks.router)
