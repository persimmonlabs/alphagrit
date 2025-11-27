import unittest
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.notification import EmailLog, EmailStatus

class TestEmailLogEntity(unittest.TestCase):
    def test_email_log_creation_valid(self):
        log = EmailLog(recipient_email="test@example.com", subject="Test Subject")
        self.assertIsNotNone(log.id)
        self.assertEqual(log.recipient_email, "test@example.com")
        self.assertEqual(log.subject, "Test Subject")
        self.assertEqual(log.status, EmailStatus.PENDING)
        self.assertLessEqual(datetime.now() - log.created_at, timedelta(seconds=1))

    def test_email_log_creation_empty_recipient_raises_error(self):
        with self.assertRaises(ValueError, msg="Recipient email cannot be empty"):
            EmailLog(recipient_email="", subject="Subject")

    def test_email_log_creation_empty_subject_raises_error(self):
        with self.assertRaises(ValueError, msg="Email subject cannot be empty"):
            EmailLog(recipient_email="test@example.com", subject="")

    def test_email_log_creation_invalid_email_format_raises_error(self):
        with self.assertRaises(ValueError, msg="Invalid recipient email format"):
            EmailLog(recipient_email="invalid-email", subject="Subject")

    def test_mark_sent(self):
        log = EmailLog(recipient_email="test@example.com", subject="Subject")
        self.assertEqual(log.status, EmailStatus.PENDING)
        
        log.mark_sent(provider="Resend", provider_message_id="msg_123")
        
        self.assertEqual(log.status, EmailStatus.SENT)
        self.assertEqual(log.provider, "Resend")
        self.assertEqual(log.provider_message_id, "msg_123")

    def test_mark_failed(self):
        log = EmailLog(recipient_email="test@example.com", subject="Subject")
        self.assertEqual(log.status, EmailStatus.PENDING)
        
        log.mark_failed(error_message="Connection error", provider="Resend")
        
        self.assertEqual(log.status, EmailStatus.FAILED)
        self.assertEqual(log.error_message, "Connection error")
        self.assertEqual(log.provider, "Resend")
