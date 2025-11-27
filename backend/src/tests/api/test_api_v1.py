import sys
import os
from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import pytest
from unittest.mock import Mock

# Add the 'src' directory to sys.path to resolve imports like 'from src.main import app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))


from src.main import app
from src.infrastructure.base import Base # Import Base from the dedicated file
from src.domain.services.payment_gateway import AbstractPaymentGateway
from src.application.services.email_service import AbstractEmailSender

from src.api.v1.dependencies import (
    get_product_management_service,
    get_order_management_service,
    get_user_profile_service,
    get_content_management_service,
    get_customer_feedback_service,
    get_refund_service,
    get_email_service,
    get_email_sender,
    get_stripe_payment_gateway,
    get_payment_processing_service,
    get_refund_execution_service,
    get_mercado_pago_payment_gateway,
    # All Repository Getters
    get_product_repo,
    get_cart_repo,
    get_order_repo,
    get_download_link_repo,
    get_profile_repo,
    get_blog_post_repo,
    get_faq_repo,
    get_site_config_repo,
    get_feature_flag_repo,
    get_review_repo,
    get_refund_repo,
    get_email_log_repo,
    get_db
)
from src.domain.entities.product import Product, Category, ProductStatus
from src.domain.entities.user import Profile, UserRole
from src.domain.entities.order import Order, OrderItem, CartItem, OrderStatus, PaymentMethod, CurrencyType, DownloadLink
from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.entities.review import Review
from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.entities.notification import EmailLog, EmailStatus

# --- Test Database Setup ---
# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency for tests
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db