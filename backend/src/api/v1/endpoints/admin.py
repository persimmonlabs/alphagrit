"""
Admin endpoints - Stub implementation
All endpoints raise NotImplementedError until admin dashboard is implemented.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    featured_orders: list = []
    top_products: list = []


class AnalyticsData(BaseModel):
    period: str
    revenue_by_date: dict
    orders_by_date: dict
    customer_metrics: dict


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    """
    Get dashboard statistics - stub implementation.
    Raises NotImplementedError until admin dashboard is implemented.
    """
    raise NotImplementedError(
        "Admin dashboard not yet implemented. "
        "Expected to return dashboard statistics: revenue, orders, customers, products."
    )


@router.get("/dashboard/analytics", response_model=AnalyticsData)
def get_analytics(period: str = "monthly"):
    """
    Get analytics data - stub implementation.
    Raises NotImplementedError until analytics system is implemented.
    """
    raise NotImplementedError(
        "Analytics system not yet implemented. "
        "Expected to return analytics data for the specified period."
    )
