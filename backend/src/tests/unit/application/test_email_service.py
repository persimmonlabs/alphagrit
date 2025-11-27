import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.notification import EmailLog, EmailStatus
from src.domain.repositories.notification_repository import AbstractEmailLogRepository
from src.application.services.email_service import EmailService, AbstractEmailSender

class TestEmailService(unittest.TestCase):
    def setUp(self):
        self.mock_email_log_repo: AbstractEmailLogRepository = Mock(spec=AbstractEmailLogRepository)
        self.mock_email_sender: AbstractEmailSender = Mock(spec=AbstractEmailSender)
        
        self.service = EmailService(
            self.mock_email_log_repo,
            self.mock_email_sender
        )

        self.test_log_id = str(uuid4())
        self.test_recipient = "recipient@example.com"
        self.test_subject = "Test Subject"
        self.test_email_log = EmailLog(
            id=self.test_log_id, recipient_email=self.test_recipient, subject=self.test_subject,
            status=EmailStatus.PENDING
        )
        self.mock_email_log_repo.get_by_id.return_value = self.test_email_log

    def test_send_and_log_email_success(self):
        self.mock_email_sender.send_email.return_value = "msg-123" # Mock successful send

        logged_email = self.service.send_and_log_email(
            recipient_email=self.test_recipient,
            subject=self.test_subject,
            body="Test Body",
            provider="Resend"
        )
        
        self.assertIsInstance(logged_email, EmailLog)
        self.assertEqual(logged_email.status, EmailStatus.SENT)
        self.assertEqual(logged_email.provider, "Resend")
        self.assertEqual(logged_email.provider_message_id, "msg-123")
        self.assertEqual(self.mock_email_log_repo.save.call_count, 2) # Initial save (pending) + final save (sent)
        self.mock_email_sender.send_email.assert_called_once_with(
            recipient_email=self.test_recipient, subject=self.test_subject, body="Test Body", html_body=None
        )

    def test_send_and_log_email_failure(self):
        self.mock_email_sender.send_email.side_effect = Exception("Network error") # Mock send failure

        # Call the service, expect an exception
        with self.assertRaises(Exception) as cm:
            self.service.send_and_log_email(
                recipient_email=self.test_recipient,
                subject=self.test_subject,
                body="Test Body",
                provider="Resend"
            )
        self.assertIn("Network error", str(cm.exception))

        # Verify email sender was called once
        self.mock_email_sender.send_email.assert_called_once_with(
            recipient_email=self.test_recipient, subject=self.test_subject, body="Test Body", html_body=None
        )
        
        # Verify email log repo save was called twice (PENDING -> FAILED)
        self.assertEqual(self.mock_email_log_repo.save.call_count, 2)
        
        # Inspect the last log entry passed to save to ensure it's FAILED
        last_save_call_args = self.mock_email_log_repo.save.call_args_list[-1].args[0]
        self.assertEqual(last_save_call_args.status, EmailStatus.FAILED)
        self.assertIn("Network error", last_save_call_args.error_message)
        self.assertEqual(self.mock_email_log_repo.save.call_count, 2) # Initial PENDING + final FAILED

    def test_get_email_log_by_id_success(self):
        log = self.service.get_email_log_by_id(self.test_log_id)
        self.assertEqual(log, self.test_email_log)
        self.mock_email_log_repo.get_by_id.assert_called_once_with(self.test_log_id)

    def test_list_email_logs_all(self):
        self.mock_email_log_repo.get_all.return_value = [self.test_email_log]
        logs = self.service.list_email_logs()
        self.assertEqual(len(logs), 1)
        self.mock_email_log_repo.get_all.assert_called_once_with(
            recipient_email=None, status=None, order_id=None, user_id=None
        )

    def test_delete_email_log_success(self):
        self.service.delete_email_log(self.test_log_id)
        self.mock_email_log_repo.delete.assert_called_once_with(self.test_log_id)

    def test_delete_email_log_not_found_raises_error(self):
        self.mock_email_log_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Email log with ID not found."):
            self.service.delete_email_log(str(uuid4()))
        self.mock_email_log_repo.delete.assert_not_called()
