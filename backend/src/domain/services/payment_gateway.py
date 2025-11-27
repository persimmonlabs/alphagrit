from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AbstractPaymentGateway(ABC):
    """
    Abstract interface for interacting with various payment gateway providers.
    """
    @abstractmethod
    def create_payment_intent(self, amount: float, currency: str, description: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Creates a payment intent with the gateway.
        Returns a dictionary containing provider-specific intent details (e.g., client_secret, payment_intent_id).
        """
        pass

    @abstractmethod
    def confirm_payment(self, payment_intent_id: str, payment_method_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Confirms a payment intent.
        Returns a dictionary containing updated payment status and details.
        """
        pass

    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Optional[float] = None, reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiates a refund for a successful payment.
        Returns a dictionary containing refund status and details.
        """
        pass

    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Retrieves the current status and details of a payment.
        """
        pass
