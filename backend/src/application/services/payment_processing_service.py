from typing import Dict, Any, Optional
from src.domain.services.payment_gateway import AbstractPaymentGateway
from src.domain.entities.order import Order, OrderStatus, PaymentMethod, CurrencyType # Import Order for context

class PaymentProcessingService:
    def __init__(self, payment_gateway: AbstractPaymentGateway):
        self.payment_gateway = payment_gateway

    def initiate_payment(
        self,
        order: Order,
        payment_method_details: Optional[Dict[str, Any]] = None # Provider-specific payment details (e.g., token, card info)
    ) -> Dict[str, Any]:
        """
        Initiates a payment for a given order using the configured payment gateway.
        Returns provider-specific payment intent details.
        """
        if order.status != OrderStatus.PENDING:
            raise ValueError(f"Cannot initiate payment for an order with status {order.status.value}")

        # Map internal currency to gateway's expected format (e.g., "USD" to "usd")
        currency_str = order.currency.value.lower()
        
        # Amount often needs to be in smallest currency unit (e.g., cents for USD)
        # For simplicity, we'll pass as float, assuming gateway handles conversion or expects specific format.
        amount_to_charge = order.total 

        description = f"Payment for Order {order.order_number or order.id}"
        metadata = {
            "order_id": order.id,
            "user_id": order.user_id,
            "customer_email": order.customer_email
        }
        
        # Create a payment intent with the gateway
        intent_details = self.payment_gateway.create_payment_intent(
            amount=amount_to_charge,
            currency=currency_str,
            description=description,
            metadata=metadata
        )
        return intent_details

    def confirm_payment(self, payment_intent_id: str, payment_method_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Confirms a payment intent that might be awaiting confirmation.
        Returns updated payment status and details.
        """
        # This step is often triggered by a webhook or a client-side action after 3D Secure etc.
        confirmation_details = self.payment_gateway.confirm_payment(
            payment_intent_id=payment_intent_id,
            payment_method_id=payment_method_id
        )
        return confirmation_details

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Retrieves the current status of a payment from the gateway.
        """
        return self.payment_gateway.get_payment_status(payment_id)
