from typing import Dict, Any, Optional
from src.domain.services.payment_gateway import AbstractPaymentGateway
from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.entities.order import Order # For order details
from src.domain.repositories.order_repository import AbstractOrderRepository # To get order details


class RefundExecutionService:
    def __init__(self, payment_gateway: AbstractPaymentGateway, order_repo: AbstractOrderRepository):
        self.payment_gateway = payment_gateway
        self.order_repo = order_repo # To fetch order details, particularly payment_intent_id

    def execute_refund(self, refund_request: RefundRequest, admin_notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a refund for a given refund request through the payment gateway.
        Returns provider-specific refund details.
        """
        if refund_request.status != RefundStatus.APPROVED:
            raise ValueError(f"Cannot execute refund for a request with status {refund_request.status.value}")

        order = self.order_repo.get_by_id(refund_request.order_id)
        if not order:
            raise ValueError(f"Associated Order with ID {refund_request.order_id} not found for refund request {refund_request.id}.")

        # Determine which payment ID to use based on the order's payment method
        payment_id_to_refund: Optional[str] = None
        if order.payment_method == order.payment_method.STRIPE:
            payment_id_to_refund = order.payment_intent_id # Or stripe_charge_id
        elif order.payment_method == order.payment_method.MERCADO_PAGO:
            payment_id_to_refund = order.mercado_pago_id
        
        if not payment_id_to_refund:
            raise ValueError(f"No payment ID found for order {order.id} to process refund.")

        # Amount to refund: For now, assume full refund of order.total
        # In a real system, partial refunds would be an option.
        amount_to_refund = order.total
        currency = order.currency.value.lower()
        
        # Initiate the refund with the payment gateway
        refund_details = self.payment_gateway.refund_payment(
            payment_id=payment_id_to_refund,
            amount=amount_to_refund,
            reason=admin_notes # Pass admin notes as reason to gateway
        )
        return refund_details
