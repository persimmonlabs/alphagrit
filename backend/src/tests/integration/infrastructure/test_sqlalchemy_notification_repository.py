import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.notification import EmailLog, EmailStatus
from src.domain.entities.order import Order, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.user import Profile, UserRole
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_notification_repository import (
    SQLAlchemyEmailLogRepository,
    EmailLogORM,
)
from src.infrastructure.repositories.sqlalchemy_order_repository import OrderORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM


class TestSQLAlchemyEmailLogRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables for all ORMs
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.email_log_repo = SQLAlchemyEmailLogRepository(self.session)

        self.order_id = str(uuid4())
        self.user_id = str(uuid4())

        # Create dummy order and profile for email log to reference
        self.session.add(OrderORM(
            id=self.order_id, user_id=self.user_id, customer_email="customer@test.com",
            subtotal=10.0, total=10.0, currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE,
            status=OrderStatus.PAID
        ))
        self.session.add(ProfileORM(id=self.user_id, email="user@test.com", full_name="Test User"))
        self.session.commit()

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_email_log(self):
        log = EmailLog(recipient_email="test@log.com", subject="New Log", order_id=self.order_id, user_id=self.user_id)
        self.email_log_repo.save(log)

        retrieved = self.email_log_repo.get_by_id(log.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.recipient_email, "test@log.com")
        self.assertEqual(retrieved.subject, "New Log")
        self.assertEqual(retrieved.status, EmailStatus.PENDING)

    def test_update_existing_email_log(self):
        log = EmailLog(recipient_email="update@log.com", subject="Update Log", status=EmailStatus.PENDING)
        self.email_log_repo.save(log)

        log.status = EmailStatus.SENT
        log.provider = "SendGrid"
        log.provider_message_id = "sg-123"
        self.email_log_repo.save(log)

        updated_log = self.email_log_repo.get_by_id(log.id)
        self.assertEqual(updated_log.status, EmailStatus.SENT)
        self.assertEqual(updated_log.provider, "SendGrid")
        self.assertEqual(updated_log.provider_message_id, "sg-123")

    def test_get_by_id(self):
        log = EmailLog(recipient_email="specific@log.com", subject="Specific Log")
        self.email_log_repo.save(log)

        found_log = self.email_log_repo.get_by_id(log.id)
        self.assertIsNotNone(found_log)
        self.assertEqual(found_log.id, log.id)

    def test_get_all_email_logs(self):
        log1 = EmailLog(recipient_email="a@b.com", subject="S1", status=EmailStatus.SENT, order_id=self.order_id)
        log2 = EmailLog(recipient_email="c@d.com", subject="S2", status=EmailStatus.FAILED, user_id=self.user_id)
        log3 = EmailLog(recipient_email="a@b.com", subject="S3", status=EmailStatus.PENDING)
        self.email_log_repo.save(log1)
        self.email_log_repo.save(log2)
        self.email_log_repo.save(log3)

        all_logs = self.email_log_repo.get_all()
        self.assertEqual(len(all_logs), 3)

        sent_logs = self.email_log_repo.get_all(status=EmailStatus.SENT)
        self.assertEqual(len(sent_logs), 1)
        self.assertEqual(sent_logs[0].recipient_email, "a@b.com")

        recipient_logs = self.email_log_repo.get_all(recipient_email="a@b.com")
        self.assertEqual(len(recipient_logs), 2)

    def test_delete_email_log(self):
        log = EmailLog(recipient_email="delete@log.com", subject="To Delete")
        self.email_log_repo.save(log)
        
        self.email_log_repo.delete(log.id)
        retrieved = self.email_log_repo.get_by_id(log.id)
        self.assertIsNone(retrieved)
