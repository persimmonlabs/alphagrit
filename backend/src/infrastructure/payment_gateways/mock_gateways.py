from typing import Dict, Any, Optional
import uuid
from src.domain.services.payment_gateway import AbstractPaymentGateway

class MockStripeGateway(AbstractPaymentGateway):
    def create_payment_intent(self, amount: float, currency: str, description: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if amount <= 0:
            raise ValueError("Stripe: Amount must be positive.")
        if currency.upper() not in ["USD", "BRL"]:
            raise ValueError("Stripe: Unsupported currency.")
        
        # Simulate a successful intent creation
        payment_intent_id = f"pi_{str(uuid.uuid4()).replace('-', '')}"
        client_secret = f"{payment_intent_id}_secret_{str(uuid.uuid4())[:8]}"
        return {
            "payment_intent_id": payment_intent_id,
            "client_secret": client_secret,
            "status": "requires_payment_method",
            "amount": amount,
            "currency": currency.lower()
        }

    def confirm_payment(self, payment_intent_id: str, payment_method_id: Optional[str] = None) -> Dict[str, Any]:
        if "fail" in payment_intent_id: # Simulate a failure
            return {"payment_intent_id": payment_intent_id, "status": "failed", "error": {"message": "Payment method declined."}}
        
        # Simulate successful confirmation
        return {
            "payment_intent_id": payment_intent_id,
            "status": "succeeded",
            "amount_received": 100.0, # Example amount
            "currency": "usd"
        }

    def refund_payment(self, payment_id: str, amount: Optional[float] = None, reason: Optional[str] = None) -> Dict[str, Any]:
        if "fail_refund" in payment_id:
            raise Exception("Stripe: Refund failed due to processing error.")
        
        # Simulate successful refund
        refund_id = f"re_{str(uuid.uuid4()).replace('-', '')}"
        return {
            "refund_id": refund_id,
            "payment_intent_id": payment_id,
            "status": "succeeded",
            "amount": amount,
            "currency": "usd"
        }

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        if "not_found" in payment_id:
            raise ValueError("Stripe: Payment not found.")
        
        # Simulate a successful status retrieval
        return {"payment_id": payment_id, "status": "succeeded", "amount": 100.0, "currency": "usd"}


class MockMercadoPagoGateway(AbstractPaymentGateway):
    def create_payment_intent(self, amount: float, currency: str, description: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if amount <= 0:
            raise ValueError("Mercado Pago: Amount must be positive.")
        if currency.upper() not in ["BRL", "USD"]:
            raise ValueError("Mercado Pago: Unsupported currency.")

        payment_id = f"mp_pay_{str(uuid.uuid4()).replace('-', '')}"
        return {
            "payment_id": payment_id,
            "status": "pending",
            "amount": amount,
            "currency": currency.lower()
        }

    def confirm_payment(self, payment_intent_id: str, payment_method_id: Optional[str] = None) -> Dict[str, Any]:
        if "fail" in payment_intent_id:
            return {"payment_id": payment_intent_id, "status": "rejected", "error": {"message": "Insufficient funds."}}

        return {
            "payment_id": payment_intent_id,
            "status": "approved",
            "amount": 100.0, # Example amount
            "currency": "brl"
        }

    def refund_payment(self, payment_id: str, amount: Optional[float] = None, reason: Optional[str] = None) -> Dict[str, Any]:
        if "fail_refund" in payment_id:
            raise Exception("Mercado Pago: Refund process failed.")
        
        refund_id = f"mp_ref_{str(uuid.uuid4()).replace('-', '')}"
        return {
            "refund_id": refund_id,
            "payment_id": payment_id,
            "status": "approved",
            "amount": amount,
            "currency": "brl"
        }

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        if "not_found" in payment_id:
            raise ValueError("Mercado Pago: Payment not found.")
        
        return {"payment_id": payment_id, "status": "approved", "amount": 100.0, "currency": "brl"}
