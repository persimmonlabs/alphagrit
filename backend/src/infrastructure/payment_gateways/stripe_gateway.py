"""
Stripe payment gateway implementation.
"""
import logging
from typing import Dict, Any, Optional, List
import stripe
from stripe import StripeError

from src.domain.services.payment_gateway import AbstractPaymentGateway

logger = logging.getLogger(__name__)


class StripeGateway(AbstractPaymentGateway):
    """
    Real Stripe payment gateway implementation.

    Handles payment intents, checkout sessions, refunds, and webhooks.
    """

    def __init__(
        self,
        secret_key: str,
        webhook_secret: Optional[str] = None,
        publishable_key: Optional[str] = None
    ):
        """
        Initialize Stripe gateway.

        Args:
            secret_key: Stripe secret API key
            webhook_secret: Stripe webhook signing secret
            publishable_key: Stripe publishable key (for client-side)
        """
        self.secret_key = secret_key
        self.webhook_secret = webhook_secret
        self.publishable_key = publishable_key
        stripe.api_key = secret_key

    def create_payment_intent(
        self,
        amount: float,
        currency: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe PaymentIntent.

        Args:
            amount: Amount in the smallest currency unit (cents for USD, centavos for BRL)
            currency: Three-letter ISO currency code (usd, brl)
            description: Payment description
            metadata: Additional metadata to attach to the payment

        Returns:
            Dictionary with payment_intent_id, client_secret, status, amount, currency
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")

        currency_lower = currency.lower()
        if currency_lower not in ["usd", "brl"]:
            raise ValueError(f"Unsupported currency: {currency}")

        # Convert to cents/centavos
        amount_cents = int(amount * 100)

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency_lower,
                description=description,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True}
            )

            logger.info(f"Created PaymentIntent: {intent.id}")

            return {
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "status": intent.status,
                "amount": amount,
                "amount_cents": amount_cents,
                "currency": currency_lower
            }

        except StripeError as e:
            logger.error(f"Stripe error creating PaymentIntent: {e}")
            raise Exception(f"Stripe error: {e.user_message or str(e)}")

    def confirm_payment(
        self,
        payment_intent_id: str,
        payment_method_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve and return the status of a PaymentIntent.

        Note: In most cases, the client confirms the payment. This method
        retrieves the current status after client-side confirmation.

        Args:
            payment_intent_id: Stripe PaymentIntent ID
            payment_method_id: Optional payment method (usually set on client)

        Returns:
            Dictionary with payment status and details
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount_received": intent.amount_received / 100 if intent.amount_received else 0,
                "currency": intent.currency,
                "payment_method": intent.payment_method,
                "charges": [
                    {
                        "id": charge.id,
                        "amount": charge.amount / 100,
                        "status": charge.status,
                        "receipt_url": charge.receipt_url
                    }
                    for charge in intent.charges.data
                ] if intent.charges else []
            }

        except StripeError as e:
            logger.error(f"Stripe error retrieving PaymentIntent: {e}")
            return {
                "payment_intent_id": payment_intent_id,
                "status": "failed",
                "error": {"message": e.user_message or str(e)}
            }

    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a refund for a payment.

        Args:
            payment_id: Stripe PaymentIntent ID or Charge ID
            amount: Amount to refund (None for full refund)
            reason: Reason for refund (duplicate, fraudulent, requested_by_customer)

        Returns:
            Dictionary with refund details
        """
        try:
            refund_params = {"payment_intent": payment_id}

            if amount is not None:
                refund_params["amount"] = int(amount * 100)

            if reason:
                # Map common reasons to Stripe's expected values
                reason_map = {
                    "duplicate": "duplicate",
                    "fraudulent": "fraudulent",
                    "requested": "requested_by_customer",
                    "requested_by_customer": "requested_by_customer"
                }
                refund_params["reason"] = reason_map.get(reason.lower(), "requested_by_customer")

            refund = stripe.Refund.create(**refund_params)

            logger.info(f"Created refund: {refund.id} for payment: {payment_id}")

            return {
                "refund_id": refund.id,
                "payment_intent_id": payment_id,
                "status": refund.status,
                "amount": refund.amount / 100,
                "currency": refund.currency
            }

        except StripeError as e:
            logger.error(f"Stripe error creating refund: {e}")
            raise Exception(f"Stripe refund error: {e.user_message or str(e)}")

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Get the current status of a payment.

        Args:
            payment_id: Stripe PaymentIntent ID

        Returns:
            Dictionary with payment status and details
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_id)

            return {
                "payment_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,
                "amount_received": intent.amount_received / 100 if intent.amount_received else 0,
                "currency": intent.currency,
                "created": intent.created,
                "metadata": dict(intent.metadata) if intent.metadata else {}
            }

        except StripeError as e:
            logger.error(f"Stripe error getting payment status: {e}")
            raise ValueError(f"Payment not found: {payment_id}")

    # ===========================================
    # Additional Stripe-specific methods
    # ===========================================

    def create_checkout_session(
        self,
        line_items: List[Dict[str, Any]],
        success_url: str,
        cancel_url: str,
        customer_email: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        mode: str = "payment"
    ) -> Dict[str, Any]:
        """
        Create a Stripe Checkout Session for hosted checkout.

        Args:
            line_items: List of items with price_data or price ID
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if customer cancels
            customer_email: Pre-fill customer email
            metadata: Additional metadata
            mode: "payment" for one-time, "subscription" for recurring

        Returns:
            Dictionary with session ID and checkout URL
        """
        try:
            session_params = {
                "line_items": line_items,
                "mode": mode,
                "success_url": success_url,
                "cancel_url": cancel_url,
                "metadata": metadata or {}
            }

            if customer_email:
                session_params["customer_email"] = customer_email

            session = stripe.checkout.Session.create(**session_params)

            logger.info(f"Created Checkout Session: {session.id}")

            return {
                "session_id": session.id,
                "checkout_url": session.url,
                "expires_at": session.expires_at,
                "payment_intent": session.payment_intent
            }

        except StripeError as e:
            logger.error(f"Stripe error creating Checkout Session: {e}")
            raise Exception(f"Stripe checkout error: {e.user_message or str(e)}")

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> Dict[str, Any]:
        """
        Verify and parse a Stripe webhook event.

        Args:
            payload: Raw request body bytes
            signature: Stripe-Signature header value

        Returns:
            Parsed webhook event data

        Raises:
            ValueError: If signature verification fails
        """
        if not self.webhook_secret:
            raise ValueError("Webhook secret not configured")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                self.webhook_secret
            )

            return {
                "id": event.id,
                "type": event.type,
                "data": event.data.object,
                "created": event.created
            }

        except stripe.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise ValueError("Invalid webhook signature")

    def create_product(
        self,
        name: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe Product.

        Args:
            name: Product name
            description: Product description
            metadata: Additional metadata

        Returns:
            Dictionary with product details
        """
        try:
            product = stripe.Product.create(
                name=name,
                description=description,
                metadata=metadata or {}
            )

            return {
                "product_id": product.id,
                "name": product.name,
                "description": product.description
            }

        except StripeError as e:
            logger.error(f"Stripe error creating product: {e}")
            raise Exception(f"Stripe product error: {e.user_message or str(e)}")

    def create_price(
        self,
        product_id: str,
        amount: float,
        currency: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe Price for a product.

        Args:
            product_id: Stripe Product ID
            amount: Price amount
            currency: Currency code (usd, brl)

        Returns:
            Dictionary with price details
        """
        try:
            price = stripe.Price.create(
                product=product_id,
                unit_amount=int(amount * 100),
                currency=currency.lower()
            )

            return {
                "price_id": price.id,
                "product_id": product_id,
                "amount": amount,
                "currency": currency.lower()
            }

        except StripeError as e:
            logger.error(f"Stripe error creating price: {e}")
            raise Exception(f"Stripe price error: {e.user_message or str(e)}")
