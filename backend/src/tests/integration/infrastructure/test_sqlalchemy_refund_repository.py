import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.entities.order import Order, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.user import Profile, UserRole
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_refund_repository import (
    SQLAlchemyRefundRequestRepository,
    RefundRequestORM,
)
from src.infrastructure.repositories.sqlalchemy_order_repository import OrderORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM


class TestSQLAlchemyRefundRequestRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables for all ORMs
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.refund_repo = SQLAlchemyRefundRequestRepository(self.session)

        self.order_id = str(uuid4())
        self.user_id = str(uuid4())
        self.admin_user_id = str(uuid4())

        # Create dummy order and profiles for refund request to reference
        self.session.add(OrderORM(
            id=self.order_id, user_id=self.user_id, customer_email="customer@test.com",
            subtotal=100.0, total=100.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PAID
        ))
        self.session.add(ProfileORM(id=self.user_id, email="requester@test.com", full_name="Refund Requester"))
        self.session.add(ProfileORM(id=self.admin_user_id, email="admin@test.com", full_name="Admin User", role=UserRole.ADMIN))
        self.session.commit()

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_refund_request(self):
        request = RefundRequest(order_id=self.order_id, user_id=self.user_id, reason="Changed mind")
        self.refund_repo.save(request)

        retrieved = self.refund_repo.get_by_id(request.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.order_id, self.order_id)
        self.assertEqual(retrieved.user_id, self.user_id)
        self.assertEqual(retrieved.status, RefundStatus.PENDING)

    def test_update_existing_refund_request(self):
        request = RefundRequest(order_id=self.order_id, user_id=self.user_id, reason="Issue", status=RefundStatus.PENDING)
        self.refund_repo.save(request)

        request.status = RefundStatus.APPROVED
        request.admin_notes = "Approved by admin"
        request.processed_by = self.admin_user_id
        request.processed_at = datetime.now()
        self.refund_repo.save(request)

        updated_request = self.refund_repo.get_by_id(request.id)
        self.assertEqual(updated_request.status, RefundStatus.APPROVED)
        self.assertEqual(updated_request.admin_notes, "Approved by admin")
        self.assertEqual(updated_request.processed_by, self.admin_user_id)

    def test_get_by_id(self):
        request = RefundRequest(order_id=self.order_id, user_id=self.user_id, reason="Specific")
        self.refund_repo.save(request)

        found_request = self.refund_repo.get_by_id(request.id)
        self.assertIsNotNone(found_request)
        self.assertEqual(found_request.id, request.id)

    def test_get_all_refund_requests(self):
        request1 = RefundRequest(order_id=self.order_id, user_id=self.user_id, reason="R1", status=RefundStatus.PENDING)
        request2 = RefundRequest(order_id=str(uuid4()), user_id=self.user_id, reason="R2", status=RefundStatus.APPROVED)
        self.refund_repo.save(request1)
        self.refund_repo.save(request2)

        all_requests = self.refund_repo.get_all()
        self.assertEqual(len(all_requests), 2)

        pending_requests = self.refund_repo.get_all(status=RefundStatus.PENDING)
        self.assertEqual(len(pending_requests), 1)
        self.assertEqual(pending_requests[0].reason, "R1")

    def test_delete_refund_request(self):
        request = RefundRequest(order_id=self.order_id, user_id=self.user_id, reason="To delete")
        self.refund_repo.save(request)
        
        self.refund_repo.delete(request.id)
        retrieved = self.refund_repo.get_by_id(request.id)
        self.assertIsNone(retrieved)
