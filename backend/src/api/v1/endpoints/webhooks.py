"""
Payment webhook endpoints for Stripe and Mercado Pago.
"""
import logging
from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from typing import Optional
from sqlalchemy.orm import Session

from src.settings import get_settings
from src.infrastructure.database import SessionLocal
from src.infrastructure.payment_gateways.stripe_gateway import StripeGateway
from src.infrastructure.payment_gateways.mercado_pago_gateway import MercadoPagoGateway
from src.domain.repositories.order_repository import AbstractOrderRepository, AbstractDownloadLinkRepository
from src.infrastructure.repositories.sqlalchemy_order_repository import (
    SQLAlchemyOrderRepository,
    SQLAlchemyDownloadLinkRepository
)
from src.domain.entities.order import OrderStatus, DownloadLink

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)
settings = get_settings()


# ===========================================
# Dependencies
# ===========================================

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_order_repo(db: Session = Depends(get_db)) -> AbstractOrderRepository:
    """Get order repository."""
    return SQLAlchemyOrderRepository(db)


def get_download_link_repo(db: Session = Depends(get_db)) -> AbstractDownloadLinkRepository:
    """Get download link repository."""
    return SQLAlchemyDownloadLinkRepository(db)


# ===========================================
# Stripe Webhook
# ===========================================

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    order_repo: AbstractOrderRepository = Depends(get_order_repo),
    download_link_repo: AbstractDownloadLinkRepository = Depends(get_download_link_repo)
):
    """
    Handle Stripe webhook events.

    Processes payment_intent.succeeded, payment_intent.payment_failed,
    checkout.session.completed, and other relevant events.
    """
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook received but Stripe not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe not configured"
        )

    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe-Signature header"
        )

    # Get raw body for signature verification
    payload = await request.body()

    # Initialize Stripe gateway
    stripe_gateway = StripeGateway(
        secret_key=settings.STRIPE_SECRET_KEY,
        webhook_secret=settings.STRIPE_WEBHOOK_SECRET
    )

    # Verify webhook signature and parse event
    try:
        event = stripe_gateway.verify_webhook_signature(payload, stripe_signature)
    except ValueError as e:
        logger.error(f"Invalid Stripe webhook signature: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )

    event_type = event["type"]
    event_data = event["data"]

    logger.info(f"Received Stripe webhook: {event_type}")

    # Handle different event types
    if event_type == "payment_intent.succeeded":
        await handle_stripe_payment_succeeded(event_data, order_repo, download_link_repo)

    elif event_type == "payment_intent.payment_failed":
        await handle_stripe_payment_failed(event_data, order_repo)

    elif event_type == "checkout.session.completed":
        await handle_stripe_checkout_completed(event_data, order_repo, download_link_repo)

    elif event_type == "charge.refunded":
        await handle_stripe_refund(event_data, order_repo)

    else:
        logger.info(f"Unhandled Stripe event type: {event_type}")

    return {"status": "ok", "event_type": event_type}


async def handle_stripe_payment_succeeded(
    payment_data: dict,
    order_repo: AbstractOrderRepository,
    download_link_repo: AbstractDownloadLinkRepository
):
    """Handle successful payment intent."""
    payment_intent_id = payment_data.get("id")
    metadata = payment_data.get("metadata", {})
    order_id = metadata.get("order_id")

    if not order_id:
        logger.warning(f"No order_id in payment metadata: {payment_intent_id}")
        return

    logger.info(f"Payment succeeded for order: {order_id}")

    # Update order status
    order = order_repo.get_by_id(order_id)
    if order:
        order.mark_paid()
        order.stripe_payment_intent_id = payment_intent_id
        order_repo.save(order)

        # Create download links for purchased products
        for item in order.items:
            if item.product_id:
                download_link = DownloadLink(
                    order_id=order.id,
                    product_id=item.product_id,
                    user_id=order.user_id
                )
                download_link_repo.save(download_link)

        logger.info(f"Order {order_id} marked as paid, download links created")


async def handle_stripe_payment_failed(
    payment_data: dict,
    order_repo: AbstractOrderRepository
):
    """Handle failed payment intent."""
    payment_intent_id = payment_data.get("id")
    metadata = payment_data.get("metadata", {})
    order_id = metadata.get("order_id")

    if order_id:
        logger.info(f"Payment failed for order: {order_id}")
        order = order_repo.get_by_id(order_id)
        if order:
            order.status = OrderStatus.CANCELLED
            order_repo.save(order)


async def handle_stripe_checkout_completed(
    session_data: dict,
    order_repo: AbstractOrderRepository,
    download_link_repo: AbstractDownloadLinkRepository
):
    """Handle completed checkout session."""
    payment_intent = session_data.get("payment_intent")
    metadata = session_data.get("metadata", {})
    order_id = metadata.get("order_id")

    if order_id:
        logger.info(f"Checkout completed for order: {order_id}")
        order = order_repo.get_by_id(order_id)
        if order and order.status == OrderStatus.PENDING:
            order.mark_paid()
            order.stripe_payment_intent_id = payment_intent
            order_repo.save(order)

            # Create download links
            for item in order.items:
                if item.product_id:
                    download_link = DownloadLink(
                        order_id=order.id,
                        product_id=item.product_id,
                        user_id=order.user_id
                    )
                    download_link_repo.save(download_link)


async def handle_stripe_refund(
    refund_data: dict,
    order_repo: AbstractOrderRepository
):
    """Handle refund event."""
    payment_intent = refund_data.get("payment_intent")
    # Find order by payment intent and update status
    # This would require adding a search method to the repo
    logger.info(f"Refund processed for payment: {payment_intent}")


# ===========================================
# Mercado Pago Webhook (IPN)
# ===========================================

@router.post("/mercado-pago")
async def mercado_pago_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None, alias="x-signature"),
    x_request_id: Optional[str] = Header(None, alias="x-request-id"),
    order_repo: AbstractOrderRepository = Depends(get_order_repo),
    download_link_repo: AbstractDownloadLinkRepository = Depends(get_download_link_repo)
):
    """
    Handle Mercado Pago IPN (Instant Payment Notification) webhooks.

    Mercado Pago sends notifications for payment updates.
    """
    if not settings.MERCADO_PAGO_ACCESS_TOKEN:
        logger.warning("Mercado Pago webhook received but not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mercado Pago not configured"
        )

    # Parse request body
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )

    # Initialize Mercado Pago gateway
    mp_gateway = MercadoPagoGateway(
        access_token=settings.MERCADO_PAGO_ACCESS_TOKEN,
        webhook_secret=settings.MERCADO_PAGO_WEBHOOK_SECRET
    )

    # Verify webhook signature if configured
    if settings.MERCADO_PAGO_WEBHOOK_SECRET and x_signature and x_request_id:
        data_id = body.get("data", {}).get("id", "")
        if not mp_gateway.verify_webhook_signature(x_signature, x_request_id, str(data_id)):
            logger.warning("Invalid Mercado Pago webhook signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )

    # Get notification details
    topic = body.get("type") or body.get("topic")
    action = body.get("action")
    data = body.get("data", {})
    resource_id = str(data.get("id", ""))

    logger.info(f"Received Mercado Pago webhook: topic={topic}, action={action}, id={resource_id}")

    # Handle different notification types
    if topic == "payment":
        await handle_mercado_pago_payment(resource_id, mp_gateway, order_repo, download_link_repo)

    elif topic == "merchant_order":
        await handle_mercado_pago_merchant_order(resource_id, mp_gateway, order_repo)

    else:
        logger.info(f"Unhandled Mercado Pago topic: {topic}")

    return {"status": "ok", "topic": topic}


async def handle_mercado_pago_payment(
    payment_id: str,
    mp_gateway: MercadoPagoGateway,
    order_repo: AbstractOrderRepository,
    download_link_repo: AbstractDownloadLinkRepository
):
    """Handle Mercado Pago payment notification."""
    if not payment_id:
        return

    # Get payment details from Mercado Pago
    try:
        notification = mp_gateway.process_ipn_notification("payment", payment_id)
    except Exception as e:
        logger.error(f"Error processing Mercado Pago payment notification: {e}")
        return

    payment_status = notification.get("status")
    external_reference = notification.get("external_reference")

    # external_reference should contain order_id
    order_id = external_reference

    if not order_id:
        # Try to parse from JSON if we stored metadata there
        try:
            import json
            ref_data = json.loads(external_reference or "{}")
            order_id = ref_data.get("order_id")
        except Exception:
            pass

    if not order_id:
        logger.warning(f"No order_id found for Mercado Pago payment: {payment_id}")
        return

    logger.info(f"Mercado Pago payment {payment_id} status: {payment_status} for order: {order_id}")

    order = order_repo.get_by_id(order_id)
    if not order:
        logger.warning(f"Order not found: {order_id}")
        return

    # Update order based on payment status
    if payment_status == "approved":
        if order.status == OrderStatus.PENDING:
            order.mark_paid()
            order.mercado_pago_payment_id = payment_id
            order_repo.save(order)

            # Create download links
            for item in order.items:
                if item.product_id:
                    download_link = DownloadLink(
                        order_id=order.id,
                        product_id=item.product_id,
                        user_id=order.user_id
                    )
                    download_link_repo.save(download_link)

            logger.info(f"Order {order_id} marked as paid via Mercado Pago")

    elif payment_status in ["rejected", "cancelled"]:
        order.status = OrderStatus.CANCELLED
        order_repo.save(order)
        logger.info(f"Order {order_id} cancelled due to payment status: {payment_status}")

    elif payment_status == "refunded":
        order.status = OrderStatus.REFUNDED
        order_repo.save(order)
        logger.info(f"Order {order_id} marked as refunded")


async def handle_mercado_pago_merchant_order(
    order_id: str,
    mp_gateway: MercadoPagoGateway,
    order_repo: AbstractOrderRepository
):
    """Handle Mercado Pago merchant order notification."""
    if not order_id:
        return

    try:
        notification = mp_gateway.process_ipn_notification("merchant_order", order_id)
        logger.info(f"Merchant order notification: {notification}")
        # Merchant orders aggregate multiple payments - handle if needed
    except Exception as e:
        logger.error(f"Error processing merchant order notification: {e}")


# ===========================================
# Test endpoint (development only)
# ===========================================

@router.get("/test")
async def test_webhooks():
    """
    Test endpoint to verify webhook configuration.
    Only available in development.
    """
    if settings.is_production():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    return {
        "stripe_configured": settings.has_stripe_config(),
        "mercado_pago_configured": settings.has_mercado_pago_config(),
        "environment": settings.ENVIRONMENT
    }
