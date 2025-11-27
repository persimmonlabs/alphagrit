import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.entities.order import Order, OrderStatus, PaymentMethod, CurrencyType, OrderItem
from src.domain.entities.user import Profile, UserRole
from src.domain.repositories.refund_repository import AbstractRefundRequestRepository
from src.domain.repositories.order_repository import AbstractOrderRepository
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.application.services.refund_service import RefundService
from src.application.services.refund_execution_service import RefundExecutionService # NEW IMPORT

class TestRefundService(unittest.TestCase):
    def setUp(self):
        self.mock_refund_repo: AbstractRefundRequestRepository = Mock(spec=AbstractRefundRequestRepository)
        self.mock_order_repo: AbstractOrderRepository = Mock(spec=AbstractOrderRepository)
        self.mock_profile_repo: AbstractProfileRepository = Mock(spec=AbstractProfileRepository)
        self.mock_refund_execution_service: RefundExecutionService = Mock(spec=RefundExecutionService) # NEW MOCK
        
        self.service = RefundService(
            self.mock_refund_repo,
            self.mock_order_repo,
            self.mock_profile_repo,
            self.mock_refund_execution_service # NEW DEPENDENCY
        )

        self.user_id = str(uuid4())
        self.admin_user_id = str(uuid4())
        self.order_id = str(uuid4())
        self.refund_request_id = str(uuid4())

        self.test_order_paid = Order(
            id=self.order_id, user_id=self.user_id, customer_email="test@example.com",
            subtotal=100.0, total=100.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PAID, items=[]
        )
        self.test_order_pending = Order(
            id=str(uuid4()), user_id=self.user_id, customer_email="test@example.com",
            subtotal=50.0, total=50.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PENDING, items=[]
        )
        self.test_admin_profile = Profile(id=self.admin_user_id, email="admin@example.com", role=UserRole.ADMIN)
        self.test_customer_profile = Profile(id=str(uuid4()), email="customer@example.com", role=UserRole.CUSTOMER)
        self.test_pending_refund_request = RefundRequest(
            id=self.refund_request_id, order_id=self.order_id, user_id=self.user_id, reason="Faulty product", updated_at=datetime(2020,1,1)
        )

        self.mock_order_repo.get_by_id.side_effect = \
            lambda oid: self.test_order_paid if oid == self.order_id else self.test_order_pending if oid == self.test_order_pending.id else None
        self.mock_profile_repo.get_by_id.side_effect = \
            lambda pid: self.test_admin_profile if pid == self.admin_user_id else self.test_customer_profile if pid == self.test_customer_profile.id else None
        self.mock_refund_repo.get_by_id.return_value = self.test_pending_refund_request
        self.mock_refund_repo.get_all.return_value = [] # No pending requests by default for submit test

    # --- Submit Refund Request Tests ---
    def test_submit_refund_request_success(self):
        refund_request = self.service.submit_refund_request(
            order_id=self.order_id,
            user_id=self.user_id,
            reason="Changed my mind"
        )
        self.assertIsInstance(refund_request, RefundRequest)
        self.assertEqual(refund_request.order_id, self.order_id)
        self.assertEqual(refund_request.user_id, self.user_id)
        self.assertEqual(refund_request.status, RefundStatus.PENDING)
        self.mock_refund_repo.save.assert_called_once_with(ANY)
        self.mock_order_repo.get_by_id.assert_called_once_with(self.order_id)

    def test_submit_refund_request_order_not_found_raises_error(self):
        self.mock_order_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Order with ID not found for refund request."):
            self.service.submit_refund_request(order_id=str(uuid4()), user_id=self.user_id, reason="No order")
        self.mock_refund_repo.save.assert_not_called()

    def test_submit_refund_request_order_not_paid_raises_error(self):
        self.mock_order_repo.get_by_id.return_value = self.test_order_pending # Pending order
        with self.assertRaises(ValueError, msg="Refund request can only be submitted for PAID orders."):
            self.service.submit_refund_request(order_id=self.test_order_pending.id, user_id=self.user_id, reason="Not paid")
        self.mock_refund_repo.save.assert_not_called()

    def test_submit_refund_request_pending_already_exists_raises_error(self):
        self.mock_refund_repo.get_all.return_value = [self.test_pending_refund_request] # Simulate existing pending
        with self.assertRaises(ValueError, msg="A pending refund request already exists for order ID"):
            self.service.submit_refund_request(order_id=self.order_id, user_id=self.user_id, reason="Duplicate")
        self.mock_refund_repo.save.assert_not_called()

    def test_submit_refund_request_user_mismatch_raises_error(self):
        # Arrange
        different_user_id_for_order = str(uuid4())
        requester_user_id = str(uuid4()) # Explicitly create a new, distinct requester ID
        
        order_with_different_user = Order(
            id=self.order_id, user_id=different_user_id_for_order, customer_email="other@example.com",
            subtotal=100.0, total=100.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PAID, items=[]
        )
        self.mock_order_repo.get_by_id.return_value = order_with_different_user
        
        # Act & Assert
        with self.assertRaises(ValueError, msg="User submitting refund request does not match order owner."):
            self.service.submit_refund_request(order_id=self.order_id, user_id=requester_user_id, reason="Mismatch")
        self.mock_refund_repo.save.assert_not_called()


    # --- Process Refund Request Tests ---
    def test_process_refund_request_approve_success(self):
        original_request = RefundRequest(id=self.refund_request_id, order_id=self.order_id, user_id=self.user_id, status=RefundStatus.PENDING, updated_at=datetime(2020,1,1))
        self.mock_refund_repo.get_by_id.return_value = original_request
        
        old_updated_at = original_request.updated_at
        processed_request = self.service.process_refund_request(
            request_id=self.refund_request_id,
            processed_by_user_id=self.admin_user_id,
            action="approve"
        )
        
        self.assertEqual(processed_request.status, RefundStatus.APPROVED)
        self.assertEqual(processed_request.processed_by, self.admin_user_id)
        self.assertIsNotNone(processed_request.processed_at)
        self.mock_refund_repo.save.assert_called_once_with(original_request)
        self.assertTrue(processed_request.updated_at > old_updated_at)
        self.mock_profile_repo.get_by_id.assert_called_once_with(self.admin_user_id)

    def test_process_refund_request_deny_success(self):
        original_request = RefundRequest(id=self.refund_request_id, order_id=self.order_id, user_id=self.user_id, status=RefundStatus.PENDING, updated_at=datetime(2020,1,1))
        self.mock_refund_repo.get_by_id.return_value = original_request
        
        old_updated_at = original_request.updated_at
        processed_request = self.service.process_refund_request(
            request_id=self.refund_request_id,
            processed_by_user_id=self.admin_user_id,
            action="deny",
            admin_notes="Customer already downloaded product"
        )
        
        self.assertEqual(processed_request.status, RefundStatus.DENIED)
        self.assertEqual(processed_request.admin_notes, "Customer already downloaded product")
        self.mock_refund_repo.save.assert_called_once_with(original_request)
        self.assertTrue(processed_request.updated_at > old_updated_at)

    def test_process_refund_request_not_found_raises_error(self):
        self.mock_refund_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Refund request with ID not found."):
            self.service.process_refund_request(str(uuid4()), self.admin_user_id, "approve")
        self.mock_refund_repo.save.assert_not_called()

    def test_process_refund_request_unauthorized_user_raises_error(self):
        self.mock_profile_repo.get_by_id.return_value = self.test_customer_profile # Not an admin
        with self.assertRaises(ValueError, msg="User is not authorized to process refund requests."):
            self.service.process_refund_request(self.refund_request_id, self.test_customer_profile.id, "approve")
        self.mock_refund_repo.save.assert_not_called()

    def test_process_refund_request_invalid_action_raises_error(self):
        with self.assertRaises(ValueError, msg="Invalid action. Must be 'approve' or 'deny'."):
            self.service.process_refund_request(self.refund_request_id, self.admin_user_id, "invalid_action")
        self.mock_refund_repo.save.assert_not_called()

    # --- Other Tests ---
    def test_get_refund_request_by_id_success(self):
        request = self.service.get_refund_request_by_id(self.refund_request_id)
        self.assertEqual(request, self.test_pending_refund_request)
        self.mock_refund_repo.get_by_id.assert_called_once_with(self.refund_request_id)

    def test_list_refund_requests_all(self):
        self.mock_refund_repo.get_all.return_value = [self.test_pending_refund_request]
        requests = self.service.list_refund_requests(order_id=self.order_id)
        self.assertEqual(len(requests), 1)
        self.mock_refund_repo.get_all.assert_called_once_with(order_id=self.order_id, user_id=None, status=None)

    def test_delete_refund_request_success(self):
        self.service.delete_refund_request(self.refund_request_id)
        self.mock_refund_repo.delete.assert_called_once_with(self.refund_request_id)

    def test_delete_refund_request_not_found_raises_error(self):
        self.mock_refund_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Refund request with ID not found."):
            self.service.delete_refund_request(str(uuid4()))
        self.mock_refund_repo.delete.assert_not_called()