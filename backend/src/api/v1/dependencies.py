from typing import Generator, Optional
from uuid import uuid4
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.settings import get_settings
from src.infrastructure.database import SessionLocal
from src.domain.services.payment_gateway import AbstractPaymentGateway
from src.infrastructure.payment_gateways.mock_gateways import MockStripeGateway, MockMercadoPagoGateway
from src.application.services.email_service import AbstractEmailSender

# Get settings
settings = get_settings()

# Lazy imports for payment gateways to avoid ImportError if SDKs not installed
StripeGateway = None
MercadoPagoGateway = None

def _get_stripe_gateway():
    global StripeGateway
    if StripeGateway is None:
        from src.infrastructure.payment_gateways.stripe_gateway import StripeGateway as SG
        StripeGateway = SG
    return StripeGateway

def _get_mercadopago_gateway():
    global MercadoPagoGateway
    if MercadoPagoGateway is None:
        from src.infrastructure.payment_gateways.mercado_pago_gateway import MercadoPagoGateway as MPG
        MercadoPagoGateway = MPG
    return MercadoPagoGateway

# Abstract Repositories
from src.domain.repositories.product_repository import AbstractProductRepository, AbstractCategoryRepository
from src.domain.repositories.order_repository import AbstractCartRepository, AbstractOrderRepository, AbstractDownloadLinkRepository
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.domain.repositories.content_repository import AbstractBlogPostRepository, AbstractFaqRepository, AbstractSiteConfigRepository, AbstractFeatureFlagRepository
from src.domain.repositories.review_repository import AbstractReviewRepository
from src.domain.repositories.refund_repository import AbstractRefundRequestRepository
from src.domain.repositories.notification_repository import AbstractEmailLogRepository
from src.domain.repositories.ebook_repository import (
    AbstractEbookRepository, AbstractEbookChapterRepository,
    AbstractEbookSectionRepository, AbstractEbookContentBlockRepository,
    AbstractEbookReadingProgressRepository
)

# Concrete SQLAlchemy Repositories
from src.infrastructure.repositories.sqlalchemy_product_repository import SQLAlchemyProductRepository, SQLAlchemyCategoryRepository
from src.infrastructure.repositories.sqlalchemy_order_repository import SQLAlchemyCartRepository, SQLAlchemyOrderRepository, SQLAlchemyDownloadLinkRepository
from src.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyProfileRepository
from src.infrastructure.repositories.sqlalchemy_content_repository import SQLAlchemyBlogPostRepository, SQLAlchemyFaqRepository, SQLAlchemySiteConfigRepository, SQLAlchemyFeatureFlagRepository
from src.infrastructure.repositories.sqlalchemy_review_repository import SQLAlchemyReviewRepository
from src.infrastructure.repositories.sqlalchemy_refund_repository import SQLAlchemyRefundRequestRepository
from src.infrastructure.repositories.sqlalchemy_notification_repository import SQLAlchemyEmailLogRepository
from src.infrastructure.repositories.sqlalchemy_ebook_repository import (
    SQLAlchemyEbookRepository, SQLAlchemyEbookChapterRepository,
    SQLAlchemyEbookSectionRepository, SQLAlchemyEbookContentBlockRepository,
    SQLAlchemyEbookReadingProgressRepository
)

# Application Services
from src.application.services.product_management_service import ProductManagementService
from src.application.services.order_management_service import OrderManagementService
from src.application.services.user_profile_service import UserProfileService
from src.application.services.content_management_service import ContentManagementService
from src.application.services.customer_feedback_service import CustomerFeedbackService
from src.application.services.refund_service import RefundService
from src.application.services.email_service import EmailService
from src.application.services.payment_processing_service import PaymentProcessingService
from src.application.services.refund_execution_service import RefundExecutionService
from src.application.services.ebook_management_service import EbookManagementService


# --- Database Session Dependency ---
def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get a database session.
    Yields a session which is then closed automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Concrete Email Sender Implementation (for now, a mock) ---
class MockEmailSender(AbstractEmailSender):
    def send_email(self, recipient_email: str, subject: str, body: str, html_body: Optional[str] = None) -> str:
        print(f"MOCK EMAIL SENDER: Sending email to {recipient_email} with subject '{subject}'")
        return f"mock-msg-id-{uuid4()}"

def get_email_sender() -> AbstractEmailSender:
    return MockEmailSender()


# --- Payment Gateway Dependencies ---
def get_stripe_payment_gateway() -> AbstractPaymentGateway:
    """
    Get Stripe payment gateway.

    Returns real gateway if configured, mock otherwise.
    """
    if settings.has_stripe_config():
        try:
            GatewayClass = _get_stripe_gateway()
            return GatewayClass(
                secret_key=settings.STRIPE_SECRET_KEY,
                webhook_secret=settings.STRIPE_WEBHOOK_SECRET,
                publishable_key=settings.STRIPE_PUBLISHABLE_KEY
            )
        except ImportError:
            pass  # Fall back to mock
    return MockStripeGateway()


def get_mercado_pago_payment_gateway() -> AbstractPaymentGateway:
    """
    Get Mercado Pago payment gateway.

    Returns real gateway if configured, mock otherwise.
    """
    if settings.has_mercado_pago_config():
        try:
            GatewayClass = _get_mercadopago_gateway()
            return GatewayClass(
                access_token=settings.MERCADO_PAGO_ACCESS_TOKEN,
                public_key=settings.MERCADO_PAGO_PUBLIC_KEY,
                webhook_secret=settings.MERCADO_PAGO_WEBHOOK_SECRET
            )
        except ImportError:
            pass  # Fall back to mock
    return MockMercadoPagoGateway()


# --- Repository Dependencies ---
def get_product_repo(db: Session = Depends(get_db)) -> AbstractProductRepository:
    return SQLAlchemyProductRepository(db)

def get_category_repo(db: Session = Depends(get_db)) -> AbstractCategoryRepository:
    return SQLAlchemyCategoryRepository(db)

def get_cart_repo(db: Session = Depends(get_db)) -> AbstractCartRepository:
    return SQLAlchemyCartRepository(db)

def get_order_repo(db: Session = Depends(get_db)) -> AbstractOrderRepository:
    return SQLAlchemyOrderRepository(db)

def get_download_link_repo(db: Session = Depends(get_db)) -> AbstractDownloadLinkRepository:
    return SQLAlchemyDownloadLinkRepository(db)

def get_profile_repo(db: Session = Depends(get_db)) -> AbstractProfileRepository:
    return SQLAlchemyProfileRepository(db)

def get_blog_post_repo(db: Session = Depends(get_db)) -> AbstractBlogPostRepository:
    return SQLAlchemyBlogPostRepository(db)

def get_faq_repo(db: Session = Depends(get_db)) -> AbstractFaqRepository:
    return SQLAlchemyFaqRepository(db)

def get_site_config_repo(db: Session = Depends(get_db)) -> AbstractSiteConfigRepository:
    return SQLAlchemySiteConfigRepository(db)

def get_feature_flag_repo(db: Session = Depends(get_db)) -> AbstractFeatureFlagRepository:
    return SQLAlchemyFeatureFlagRepository(db)

def get_review_repo(db: Session = Depends(get_db)) -> AbstractReviewRepository:
    return SQLAlchemyReviewRepository(db)

def get_refund_repo(db: Session = Depends(get_db)) -> AbstractRefundRequestRepository:
    return SQLAlchemyRefundRequestRepository(db)

def get_email_log_repo(db: Session = Depends(get_db)) -> AbstractEmailLogRepository:
    return SQLAlchemyEmailLogRepository(db)

def get_ebook_repo(db: Session = Depends(get_db)) -> AbstractEbookRepository:
    return SQLAlchemyEbookRepository(db)

def get_ebook_chapter_repo(db: Session = Depends(get_db)) -> AbstractEbookChapterRepository:
    return SQLAlchemyEbookChapterRepository(db)

def get_ebook_section_repo(db: Session = Depends(get_db)) -> AbstractEbookSectionRepository:
    return SQLAlchemyEbookSectionRepository(db)

def get_ebook_content_block_repo(db: Session = Depends(get_db)) -> AbstractEbookContentBlockRepository:
    return SQLAlchemyEbookContentBlockRepository(db)

def get_ebook_reading_progress_repo(db: Session = Depends(get_db)) -> AbstractEbookReadingProgressRepository:
    return SQLAlchemyEbookReadingProgressRepository(db)


# --- Application Service Dependencies ---
def get_product_management_service(
    product_repo: AbstractProductRepository = Depends(get_product_repo),
    category_repo: AbstractCategoryRepository = Depends(get_category_repo)
) -> ProductManagementService:
    return ProductManagementService(product_repo, category_repo)

def get_payment_processing_service(
    stripe_gateway: AbstractPaymentGateway = Depends(get_stripe_payment_gateway) # For simplicity, using Stripe as default
) -> PaymentProcessingService:
    return PaymentProcessingService(stripe_gateway) # Can switch based on config/request

def get_order_management_service(
    cart_repo: AbstractCartRepository = Depends(get_cart_repo),
    order_repo: AbstractOrderRepository = Depends(get_order_repo),
    download_link_repo: AbstractDownloadLinkRepository = Depends(get_download_link_repo),
    product_repo: AbstractProductRepository = Depends(get_product_repo),
    payment_processing_service: PaymentProcessingService = Depends(get_payment_processing_service)
) -> OrderManagementService:
    return OrderManagementService(cart_repo, order_repo, download_link_repo, product_repo, payment_processing_service)

def get_user_profile_service(
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
) -> UserProfileService:
    return UserProfileService(profile_repo)

def get_content_management_service(
    blog_post_repo: AbstractBlogPostRepository = Depends(get_blog_post_repo),
    faq_repo: AbstractFaqRepository = Depends(get_faq_repo),
    site_config_repo: AbstractSiteConfigRepository = Depends(get_site_config_repo),
    feature_flag_repo: AbstractFeatureFlagRepository = Depends(get_feature_flag_repo)
) -> ContentManagementService:
    return ContentManagementService(blog_post_repo, faq_repo, site_config_repo, feature_flag_repo)

def get_customer_feedback_service(
    review_repo: AbstractReviewRepository = Depends(get_review_repo),
    product_repo: AbstractProductRepository = Depends(get_product_repo),
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
) -> CustomerFeedbackService:
    return CustomerFeedbackService(review_repo, product_repo, profile_repo)

def get_refund_execution_service(
    stripe_gateway: AbstractPaymentGateway = Depends(get_stripe_payment_gateway), # For simplicity, using Stripe as default
    order_repo: AbstractOrderRepository = Depends(get_order_repo)
) -> RefundExecutionService:
    return RefundExecutionService(stripe_gateway, order_repo) # Can switch based on config/request

def get_refund_service(
    refund_repo: AbstractRefundRequestRepository = Depends(get_refund_repo),
    order_repo: AbstractOrderRepository = Depends(get_order_repo),
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo),
    refund_execution_service: RefundExecutionService = Depends(get_refund_execution_service)
) -> RefundService:
    return RefundService(refund_repo, order_repo, profile_repo, refund_execution_service)

def get_email_service(
    email_log_repo: AbstractEmailLogRepository = Depends(get_email_log_repo),
    email_sender: AbstractEmailSender = Depends(get_email_sender)
) -> EmailService:
    return EmailService(email_log_repo, email_sender)

def get_ebook_management_service(
    ebook_repo: AbstractEbookRepository = Depends(get_ebook_repo),
    chapter_repo: AbstractEbookChapterRepository = Depends(get_ebook_chapter_repo),
    section_repo: AbstractEbookSectionRepository = Depends(get_ebook_section_repo),
    block_repo: AbstractEbookContentBlockRepository = Depends(get_ebook_content_block_repo),
    progress_repo: AbstractEbookReadingProgressRepository = Depends(get_ebook_reading_progress_repo),
    product_repo: AbstractProductRepository = Depends(get_product_repo),
    order_repo: AbstractOrderRepository = Depends(get_order_repo)
) -> EbookManagementService:
    return EbookManagementService(
        ebook_repo, chapter_repo, section_repo, block_repo, progress_repo, product_repo, order_repo
    )
