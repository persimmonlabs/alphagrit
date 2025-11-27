import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.order import Order, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.services.payment_gateway import AbstractPaymentGateway
from src.domain.repositories.order_repository import AbstractOrderRepository
from src.application.services.payment_processing_service import PaymentProcessingService
from src.application.services.refund_execution_service import RefundExecutionService


class TestPaymentProcessingService(unittest.TestCase):
    def setUp(self):
        self.mock_payment_gateway: AbstractPaymentGateway = Mock(spec=AbstractPaymentGateway)
        self.service = PaymentProcessingService(self.mock_payment_gateway)

        self.test_order = Order(
            id=str(uuid4()), order_number="ORD-123", user_id=str(uuid4()),
            customer_email="customer@example.com", subtotal=100.0, total=100.0,
            currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PENDING
        )

    def test_initiate_payment_success(self):
        self.mock_payment_gateway.create_payment_intent.return_value = {
            "payment_intent_id": "pi_new", "client_secret": "cs_new", "status": "requires_action"
        }
        
        intent_details = self.service.initiate_payment(self.test_order)
        
        self.assertIn("payment_intent_id", intent_details)
        self.assertEqual(intent_details["status"], "requires_action")
        self.mock_payment_gateway.create_payment_intent.assert_called_once_with(
            amount=self.test_order.total,
            currency="usd",
            description=ANY, # Check description later if needed
            metadata=ANY
        )

    def test_initiate_payment_non_pending_order_raises_error(self):
        self.test_order.status = OrderStatus.PAID
        with self.assertRaises(ValueError, msg="Cannot initiate payment for an order with status paid"):
            self.service.initiate_payment(self.test_order)
        self.mock_payment_gateway.create_payment_intent.assert_not_called()

    def test_confirm_payment_success(self):
        self.mock_payment_gateway.confirm_payment.return_value = {"status": "succeeded"}
        
        confirmation_details = self.service.confirm_payment("pi_existing")
        
        self.assertEqual(confirmation_details["status"], "succeeded")
        self.mock_payment_gateway.confirm_payment.assert_called_once_with(
            payment_intent_id="pi_existing", payment_method_id=None
        )

    def test_get_payment_status_success(self):
        self.mock_payment_gateway.get_payment_status.return_value = {"status": "succeeded"}
        
        status_details = self.service.get_payment_status("pi_status_check")
        
        self.assertEqual(status_details["status"], "succeeded")
        self.mock_payment_gateway.get_payment_status.assert_called_once_with("pi_status_check") # FIXED: positional argument


class TestRefundExecutionService(unittest.TestCase):
    def setUp(self):
        self.mock_payment_gateway: AbstractPaymentGateway = Mock(spec=AbstractPaymentGateway)
        self.mock_order_repo: AbstractOrderRepository = Mock(spec=AbstractOrderRepository)
        self.service = RefundExecutionService(self.mock_payment_gateway, self.mock_order_repo)

        self.test_order_id = str(uuid4())
        self.test_user_id = str(uuid4())
        self.test_payment_intent_id = "pi_refund_target"

        self.test_order = Order(
            id=self.test_order_id, user_id=self.test_user_id, customer_email="customer@example.com",
            subtotal=100.0, total=100.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PAID, payment_intent_id=self.test_payment_intent_id
        )
        self.test_refund_request = RefundRequest(
            id=str(uuid4()), order_id=self.test_order_id, user_id=self.test_user_id, reason="Changed mind",
            status=RefundStatus.APPROVED
        )

        self.mock_order_repo.get_by_id.return_value = self.test_order
        self.mock_payment_gateway.refund_payment.return_value = {"refund_id": "re_success", "status": "succeeded"}

    def test_execute_refund_success(self):
        refund_details = self.service.execute_refund(self.test_refund_request, admin_notes="Customer requested")
        
        self.assertIn("refund_id", refund_details)
        self.assertEqual(refund_details["status"], "succeeded")
        self.mock_order_repo.get_by_id.assert_called_once_with(self.test_order_id)
        self.mock_payment_gateway.refund_payment.assert_called_once_with(
            payment_id=self.test_payment_intent_id,
            amount=self.test_order.total,
            reason="Customer requested"
        )

    def test_execute_refund_non_approved_request_raises_error(self):
        self.test_refund_request.status = RefundStatus.PENDING # Not approved
        with self.assertRaises(ValueError, msg="Cannot execute refund for a request with status pending"):
            self.service.execute_refund(self.test_refund_request)
        self.mock_payment_gateway.refund_payment.assert_not_called()

    def test_execute_refund_order_not_found_raises_error(self):
        self.mock_order_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Associated Order with ID not found"):
            self.service.execute_refund(self.test_refund_request)
        self.mock_payment_gateway.refund_payment.assert_not_called()

    def test_execute_refund_no_payment_id_raises_error(self):
        self.test_order.payment_intent_id = None # No payment ID
        self.test_order.mercado_pago_id = None
        self.mock_order_repo.get_by_id.return_value = self.test_order
        with self.assertRaises(ValueError, msg="No payment ID found for order"):
            self.service.execute_refund(self.test_refund_request)
        self.mock_payment_gateway.refund_payment.assert_not_called()

    def test_execute_refund_gateway_failure_raises_exception(self):
        self.mock_payment_gateway.refund_payment.side_effect = Exception("Gateway refused refund")
        with self.assertRaises(Exception, msg="Gateway refused refund"):
            self.service.execute_refund(self.test_refund_request)
        self.mock_payment_gateway.refund_payment.assert_called_once()