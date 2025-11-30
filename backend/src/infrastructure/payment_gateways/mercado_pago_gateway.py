"""
Mercado Pago payment gateway implementation.
"""
import logging
import hmac
import hashlib
from typing import Dict, Any, Optional, List
import mercadopago

from src.domain.services.payment_gateway import AbstractPaymentGateway

logger = logging.getLogger(__name__)


class MercadoPagoGateway(AbstractPaymentGateway):
    """
    Real Mercado Pago payment gateway implementation.

    Handles preferences (checkout), payments, refunds, and IPN webhooks.
    """

    def __init__(
        self,
        access_token: str,
        public_key: Optional[str] = None,
        webhook_secret: Optional[str] = None
    ):
        """
        Initialize Mercado Pago gateway.

        Args:
            access_token: Mercado Pago access token
            public_key: Mercado Pago public key (for client-side)
            webhook_secret: Secret for webhook validation
        """
        self.access_token = access_token
        self.public_key = public_key
        self.webhook_secret = webhook_secret
        self.sdk = mercadopago.SDK(access_token)

    def create_payment_intent(
        self,
        amount: float,
        currency: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Mercado Pago preference (checkout session).

        In Mercado Pago, a "preference" is similar to a payment intent/checkout session.
        It creates a payment link that customers use to complete payment.

        Args:
            amount: Amount in currency units
            currency: Currency code (BRL, USD - limited support)
            description: Payment description
            metadata: Additional metadata (stored in external_reference)

        Returns:
            Dictionary with preference details
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")

        currency_upper = currency.upper()
        if currency_upper not in ["BRL", "USD"]:
            raise ValueError(f"Unsupported currency: {currency}")

        # Build preference data
        preference_data = {
            "items": [
                {
                    "title": description or "Alpha Grit Purchase",
                    "quantity": 1,
                    "unit_price": float(amount),
                    "currency_id": currency_upper
                }
            ],
            "auto_return": "approved",
        }

        # Store metadata in external_reference as JSON string
        if metadata:
            import json
            preference_data["external_reference"] = json.dumps(metadata)

        try:
            preference_response = self.sdk.preference().create(preference_data)

            if preference_response["status"] != 201:
                error_msg = preference_response.get("response", {}).get("message", "Unknown error")
                logger.error(f"Mercado Pago error creating preference: {error_msg}")
                raise Exception(f"Mercado Pago error: {error_msg}")

            preference = preference_response["response"]

            logger.info(f"Created Mercado Pago preference: {preference['id']}")

            return {
                "payment_intent_id": preference["id"],  # preference ID
                "payment_id": preference["id"],
                "status": "pending",
                "amount": amount,
                "currency": currency_upper,
                "init_point": preference.get("init_point"),  # Production checkout URL
                "sandbox_init_point": preference.get("sandbox_init_point"),  # Sandbox URL
                "checkout_url": preference.get("init_point") or preference.get("sandbox_init_point")
            }

        except Exception as e:
            logger.error(f"Mercado Pago error creating preference: {e}")
            raise Exception(f"Mercado Pago error: {str(e)}")

    def confirm_payment(
        self,
        payment_intent_id: str,
        payment_method_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get the status of a payment by its ID.

        In Mercado Pago, payments are confirmed automatically.
        This method retrieves the payment status.

        Args:
            payment_intent_id: Mercado Pago payment ID
            payment_method_id: Not used for Mercado Pago

        Returns:
            Dictionary with payment status
        """
        try:
            payment_response = self.sdk.payment().get(payment_intent_id)

            if payment_response["status"] != 200:
                return {
                    "payment_id": payment_intent_id,
                    "status": "not_found",
                    "error": {"message": "Payment not found"}
                }

            payment = payment_response["response"]

            # Map Mercado Pago status to standard status
            status_map = {
                "approved": "approved",
                "pending": "pending",
                "authorized": "authorized",
                "in_process": "pending",
                "in_mediation": "pending",
                "rejected": "rejected",
                "cancelled": "cancelled",
                "refunded": "refunded",
                "charged_back": "charged_back"
            }

            return {
                "payment_id": str(payment["id"]),
                "status": status_map.get(payment["status"], payment["status"]),
                "status_detail": payment.get("status_detail"),
                "amount": payment.get("transaction_amount", 0),
                "currency": payment.get("currency_id", "BRL"),
                "payer_email": payment.get("payer", {}).get("email"),
                "payment_method": payment.get("payment_method_id"),
                "external_reference": payment.get("external_reference")
            }

        except Exception as e:
            logger.error(f"Mercado Pago error getting payment: {e}")
            return {
                "payment_id": payment_intent_id,
                "status": "error",
                "error": {"message": str(e)}
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
            payment_id: Mercado Pago payment ID
            amount: Amount to refund (None for full refund)
            reason: Reason for refund (not used by MP API directly)

        Returns:
            Dictionary with refund details
        """
        try:
            refund_data = {}
            if amount is not None:
                refund_data["amount"] = float(amount)

            refund_response = self.sdk.refund().create(payment_id, refund_data)

            if refund_response["status"] not in [200, 201]:
                error_msg = refund_response.get("response", {}).get("message", "Refund failed")
                logger.error(f"Mercado Pago refund error: {error_msg}")
                raise Exception(f"Mercado Pago refund error: {error_msg}")

            refund = refund_response["response"]

            logger.info(f"Created Mercado Pago refund: {refund.get('id')} for payment: {payment_id}")

            return {
                "refund_id": str(refund.get("id")),
                "payment_id": payment_id,
                "status": "approved" if refund.get("status") == "approved" else refund.get("status"),
                "amount": refund.get("amount") or amount,
                "currency": "BRL"  # MP refunds are typically in original currency
            }

        except Exception as e:
            logger.error(f"Mercado Pago error creating refund: {e}")
            raise Exception(f"Mercado Pago refund error: {str(e)}")

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Get the current status of a payment.

        Args:
            payment_id: Mercado Pago payment ID

        Returns:
            Dictionary with payment status and details
        """
        try:
            payment_response = self.sdk.payment().get(payment_id)

            if payment_response["status"] != 200:
                raise ValueError(f"Payment not found: {payment_id}")

            payment = payment_response["response"]

            return {
                "payment_id": str(payment["id"]),
                "status": payment["status"],
                "status_detail": payment.get("status_detail"),
                "amount": payment.get("transaction_amount", 0),
                "net_amount": payment.get("transaction_details", {}).get("net_received_amount", 0),
                "currency": payment.get("currency_id", "BRL"),
                "date_created": payment.get("date_created"),
                "date_approved": payment.get("date_approved"),
                "payer": payment.get("payer", {}),
                "metadata": payment.get("metadata", {})
            }

        except Exception as e:
            logger.error(f"Mercado Pago error getting payment status: {e}")
            raise ValueError(f"Payment not found: {payment_id}")

    # ===========================================
    # Additional Mercado Pago-specific methods
    # ===========================================

    def create_checkout_preference(
        self,
        items: List[Dict[str, Any]],
        success_url: str,
        failure_url: str,
        pending_url: Optional[str] = None,
        payer_email: Optional[str] = None,
        external_reference: Optional[str] = None,
        notification_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a full checkout preference with all options.

        Args:
            items: List of items with title, quantity, unit_price, currency_id
            success_url: URL for successful payment redirect
            failure_url: URL for failed payment redirect
            pending_url: URL for pending payment redirect
            payer_email: Pre-fill payer email
            external_reference: Your order ID or reference
            notification_url: IPN webhook URL

        Returns:
            Dictionary with preference details and checkout URLs
        """
        preference_data = {
            "items": items,
            "back_urls": {
                "success": success_url,
                "failure": failure_url,
                "pending": pending_url or success_url
            },
            "auto_return": "approved"
        }

        if payer_email:
            preference_data["payer"] = {"email": payer_email}

        if external_reference:
            preference_data["external_reference"] = external_reference

        if notification_url:
            preference_data["notification_url"] = notification_url

        try:
            preference_response = self.sdk.preference().create(preference_data)

            if preference_response["status"] != 201:
                error_msg = preference_response.get("response", {}).get("message", "Unknown error")
                raise Exception(f"Mercado Pago error: {error_msg}")

            preference = preference_response["response"]

            logger.info(f"Created Mercado Pago preference: {preference['id']}")

            return {
                "preference_id": preference["id"],
                "init_point": preference.get("init_point"),
                "sandbox_init_point": preference.get("sandbox_init_point"),
                "checkout_url": preference.get("init_point") or preference.get("sandbox_init_point"),
                "external_reference": external_reference
            }

        except Exception as e:
            logger.error(f"Mercado Pago error creating preference: {e}")
            raise Exception(f"Mercado Pago error: {str(e)}")

    def process_ipn_notification(
        self,
        topic: str,
        resource_id: str
    ) -> Dict[str, Any]:
        """
        Process an IPN (Instant Payment Notification) webhook.

        Args:
            topic: Notification topic (payment, merchant_order, etc.)
            resource_id: ID of the resource that triggered the notification

        Returns:
            Dictionary with the updated resource data
        """
        try:
            if topic == "payment":
                payment_response = self.sdk.payment().get(resource_id)
                if payment_response["status"] == 200:
                    payment = payment_response["response"]
                    return {
                        "type": "payment",
                        "id": str(payment["id"]),
                        "status": payment["status"],
                        "status_detail": payment.get("status_detail"),
                        "amount": payment.get("transaction_amount"),
                        "external_reference": payment.get("external_reference"),
                        "payer_email": payment.get("payer", {}).get("email")
                    }

            elif topic == "merchant_order":
                # Merchant orders contain multiple payments
                order_response = self.sdk.merchant_order().get(resource_id)
                if order_response["status"] == 200:
                    order = order_response["response"]
                    return {
                        "type": "merchant_order",
                        "id": str(order["id"]),
                        "status": order.get("status"),
                        "external_reference": order.get("external_reference"),
                        "payments": order.get("payments", []),
                        "total_amount": order.get("total_amount")
                    }

            return {"type": topic, "id": resource_id, "status": "unknown"}

        except Exception as e:
            logger.error(f"Error processing IPN notification: {e}")
            raise Exception(f"IPN processing error: {str(e)}")

    def verify_webhook_signature(
        self,
        x_signature: str,
        x_request_id: str,
        data_id: str
    ) -> bool:
        """
        Verify Mercado Pago webhook signature.

        Args:
            x_signature: x-signature header value
            x_request_id: x-request-id header value
            data_id: data.id from the webhook payload

        Returns:
            True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured, skipping verification")
            return True

        try:
            # Parse x-signature header
            # Format: ts=timestamp,v1=hash
            parts = {}
            for part in x_signature.split(","):
                key, value = part.split("=", 1)
                parts[key] = value

            ts = parts.get("ts")
            v1 = parts.get("v1")

            if not ts or not v1:
                return False

            # Build manifest string
            manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"

            # Calculate HMAC
            calculated = hmac.new(
                self.webhook_secret.encode(),
                manifest.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(calculated, v1)

        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            return False

    def search_payments(
        self,
        external_reference: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for payments with filters.

        Args:
            external_reference: Filter by external reference
            status: Filter by payment status
            limit: Maximum results to return

        Returns:
            List of payment summaries
        """
        filters = {"limit": limit}

        if external_reference:
            filters["external_reference"] = external_reference

        if status:
            filters["status"] = status

        try:
            search_response = self.sdk.payment().search(filters)

            if search_response["status"] == 200:
                results = search_response["response"].get("results", [])
                return [
                    {
                        "payment_id": str(p["id"]),
                        "status": p["status"],
                        "amount": p.get("transaction_amount"),
                        "external_reference": p.get("external_reference"),
                        "date_created": p.get("date_created")
                    }
                    for p in results
                ]

            return []

        except Exception as e:
            logger.error(f"Error searching payments: {e}")
            return []
