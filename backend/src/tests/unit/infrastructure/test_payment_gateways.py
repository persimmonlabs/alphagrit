"""
Unit tests for payment gateway implementations.
"""
import unittest
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

from src.infrastructure.payment_gateways.stripe_gateway import StripeGateway
from src.infrastructure.payment_gateways.mercado_pago_gateway import MercadoPagoGateway


class TestStripeGateway(unittest.TestCase):
    """Tests for StripeGateway class."""

    def setUp(self):
        self.secret_key = "sk_test_fake_key"
        self.webhook_secret = "whsec_test_secret"

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_create_payment_intent_success(self, mock_stripe):
        """Test successful payment intent creation."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.client_secret = "pi_test_123_secret_456"
        mock_intent.status = "requires_payment_method"
        mock_stripe.PaymentIntent.create.return_value = mock_intent

        gateway = StripeGateway(self.secret_key, self.webhook_secret)
        result = gateway.create_payment_intent(
            amount=19.00,
            currency="usd",
            description="Test payment",
            metadata={"order_id": "123"}
        )

        self.assertEqual(result["payment_intent_id"], "pi_test_123")
        self.assertEqual(result["client_secret"], "pi_test_123_secret_456")
        self.assertEqual(result["status"], "requires_payment_method")
        self.assertEqual(result["amount"], 19.00)
        self.assertEqual(result["amount_cents"], 1900)
        mock_stripe.PaymentIntent.create.assert_called_once()

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_create_payment_intent_negative_amount_raises(self, mock_stripe):
        """Test that negative amount raises ValueError."""
        gateway = StripeGateway(self.secret_key)

        with self.assertRaises(ValueError) as ctx:
            gateway.create_payment_intent(amount=-10, currency="usd")

        self.assertIn("Amount must be positive", str(ctx.exception))

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_create_payment_intent_invalid_currency_raises(self, mock_stripe):
        """Test that unsupported currency raises ValueError."""
        gateway = StripeGateway(self.secret_key)

        with self.assertRaises(ValueError) as ctx:
            gateway.create_payment_intent(amount=10, currency="eur")

        self.assertIn("Unsupported currency", str(ctx.exception))

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_confirm_payment_success(self, mock_stripe):
        """Test successful payment confirmation/retrieval."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.status = "succeeded"
        mock_intent.amount_received = 1900
        mock_intent.currency = "usd"
        mock_intent.payment_method = "pm_card_visa"
        mock_intent.charges = MagicMock()
        mock_intent.charges.data = []
        mock_stripe.PaymentIntent.retrieve.return_value = mock_intent

        gateway = StripeGateway(self.secret_key)
        result = gateway.confirm_payment("pi_test_123")

        self.assertEqual(result["payment_intent_id"], "pi_test_123")
        self.assertEqual(result["status"], "succeeded")
        self.assertEqual(result["amount_received"], 19.00)

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_refund_payment_success(self, mock_stripe):
        """Test successful refund creation."""
        mock_refund = MagicMock()
        mock_refund.id = "re_test_456"
        mock_refund.status = "succeeded"
        mock_refund.amount = 1900
        mock_refund.currency = "usd"
        mock_stripe.Refund.create.return_value = mock_refund

        gateway = StripeGateway(self.secret_key)
        result = gateway.refund_payment("pi_test_123", amount=19.00, reason="requested")

        self.assertEqual(result["refund_id"], "re_test_456")
        self.assertEqual(result["status"], "succeeded")
        self.assertEqual(result["amount"], 19.00)
        mock_stripe.Refund.create.assert_called_once()

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_get_payment_status_success(self, mock_stripe):
        """Test getting payment status."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.status = "succeeded"
        mock_intent.amount = 1900
        mock_intent.amount_received = 1900
        mock_intent.currency = "usd"
        mock_intent.created = 1234567890
        mock_intent.metadata = {"order_id": "123"}
        mock_stripe.PaymentIntent.retrieve.return_value = mock_intent

        gateway = StripeGateway(self.secret_key)
        result = gateway.get_payment_status("pi_test_123")

        self.assertEqual(result["payment_id"], "pi_test_123")
        self.assertEqual(result["status"], "succeeded")
        self.assertEqual(result["amount"], 19.00)

    def test_verify_webhook_no_secret_raises(self):
        """Test that webhook verification fails without secret."""
        gateway = StripeGateway(self.secret_key, webhook_secret=None)

        with self.assertRaises(ValueError) as ctx:
            gateway.verify_webhook_signature(b"payload", "sig_test")

        self.assertIn("Webhook secret not configured", str(ctx.exception))

    @patch('src.infrastructure.payment_gateways.stripe_gateway.stripe')
    def test_create_checkout_session_success(self, mock_stripe):
        """Test successful checkout session creation."""
        mock_session = MagicMock()
        mock_session.id = "cs_test_123"
        mock_session.url = "https://checkout.stripe.com/pay/cs_test_123"
        mock_session.expires_at = 1234567890
        mock_session.payment_intent = "pi_test_123"
        mock_stripe.checkout.Session.create.return_value = mock_session

        gateway = StripeGateway(self.secret_key)
        result = gateway.create_checkout_session(
            line_items=[{"price_data": {"unit_amount": 1900}}],
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
            customer_email="test@example.com"
        )

        self.assertEqual(result["session_id"], "cs_test_123")
        self.assertIn("checkout.stripe.com", result["checkout_url"])


class TestMercadoPagoGateway(unittest.TestCase):
    """Tests for MercadoPagoGateway class."""

    def setUp(self):
        self.access_token = "TEST-fake-access-token"
        self.webhook_secret = "test-webhook-secret"

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_create_payment_intent_success(self, mock_sdk_class):
        """Test successful preference creation."""
        mock_sdk = MagicMock()
        mock_preference = MagicMock()
        mock_preference.create.return_value = {
            "status": 201,
            "response": {
                "id": "pref_test_123",
                "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_test_123",
                "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_test_123"
            }
        }
        mock_sdk.preference.return_value = mock_preference
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.create_payment_intent(
            amount=97.00,
            currency="BRL",
            description="Alpha Grit E-book"
        )

        self.assertEqual(result["payment_intent_id"], "pref_test_123")
        self.assertEqual(result["status"], "pending")
        self.assertEqual(result["amount"], 97.00)
        self.assertIn("mercadopago", result["checkout_url"])

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_create_payment_intent_negative_amount_raises(self, mock_sdk_class):
        """Test that negative amount raises ValueError."""
        mock_sdk = MagicMock()
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)

        with self.assertRaises(ValueError) as ctx:
            gateway.create_payment_intent(amount=-10, currency="BRL")

        self.assertIn("Amount must be positive", str(ctx.exception))

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_create_payment_intent_invalid_currency_raises(self, mock_sdk_class):
        """Test that unsupported currency raises ValueError."""
        mock_sdk = MagicMock()
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)

        with self.assertRaises(ValueError) as ctx:
            gateway.create_payment_intent(amount=10, currency="EUR")

        self.assertIn("Unsupported currency", str(ctx.exception))

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_confirm_payment_success(self, mock_sdk_class):
        """Test successful payment status retrieval."""
        mock_sdk = MagicMock()
        mock_payment = MagicMock()
        mock_payment.get.return_value = {
            "status": 200,
            "response": {
                "id": 12345,
                "status": "approved",
                "status_detail": "accredited",
                "transaction_amount": 97.00,
                "currency_id": "BRL",
                "payer": {"email": "test@example.com"},
                "payment_method_id": "pix"
            }
        }
        mock_sdk.payment.return_value = mock_payment
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.confirm_payment("12345")

        self.assertEqual(result["payment_id"], "12345")
        self.assertEqual(result["status"], "approved")
        self.assertEqual(result["amount"], 97.00)

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_confirm_payment_not_found(self, mock_sdk_class):
        """Test payment not found returns error status."""
        mock_sdk = MagicMock()
        mock_payment = MagicMock()
        mock_payment.get.return_value = {"status": 404}
        mock_sdk.payment.return_value = mock_payment
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.confirm_payment("99999")

        self.assertEqual(result["status"], "not_found")

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_refund_payment_success(self, mock_sdk_class):
        """Test successful refund creation."""
        mock_sdk = MagicMock()
        mock_refund = MagicMock()
        mock_refund.create.return_value = {
            "status": 201,
            "response": {
                "id": 789,
                "status": "approved",
                "amount": 97.00
            }
        }
        mock_sdk.refund.return_value = mock_refund
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.refund_payment("12345", amount=97.00)

        self.assertEqual(result["refund_id"], "789")
        self.assertEqual(result["status"], "approved")

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_get_payment_status_success(self, mock_sdk_class):
        """Test getting payment status."""
        mock_sdk = MagicMock()
        mock_payment = MagicMock()
        mock_payment.get.return_value = {
            "status": 200,
            "response": {
                "id": 12345,
                "status": "approved",
                "status_detail": "accredited",
                "transaction_amount": 97.00,
                "transaction_details": {"net_received_amount": 92.00},
                "currency_id": "BRL",
                "date_created": "2024-11-29T10:00:00Z",
                "date_approved": "2024-11-29T10:01:00Z",
                "payer": {"email": "test@example.com"},
                "metadata": {}
            }
        }
        mock_sdk.payment.return_value = mock_payment
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.get_payment_status("12345")

        self.assertEqual(result["payment_id"], "12345")
        self.assertEqual(result["status"], "approved")
        self.assertEqual(result["net_amount"], 92.00)

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_verify_webhook_signature_valid(self, mock_sdk_class):
        """Test valid webhook signature verification."""
        mock_sdk = MagicMock()
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token, webhook_secret="secret123")

        # Build a valid signature
        import hmac
        import hashlib
        data_id = "12345"
        request_id = "req_abc"
        ts = "1234567890"
        manifest = f"id:{data_id};request-id:{request_id};ts:{ts};"
        v1 = hmac.new(b"secret123", manifest.encode(), hashlib.sha256).hexdigest()
        x_signature = f"ts={ts},v1={v1}"

        result = gateway.verify_webhook_signature(x_signature, request_id, data_id)

        self.assertTrue(result)

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_verify_webhook_signature_invalid(self, mock_sdk_class):
        """Test invalid webhook signature verification."""
        mock_sdk = MagicMock()
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token, webhook_secret="secret123")

        result = gateway.verify_webhook_signature(
            "ts=123,v1=invalid_hash",
            "req_abc",
            "12345"
        )

        self.assertFalse(result)

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_verify_webhook_no_secret_returns_true(self, mock_sdk_class):
        """Test webhook verification without secret configured returns True."""
        mock_sdk = MagicMock()
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token, webhook_secret=None)

        result = gateway.verify_webhook_signature("any", "any", "any")

        self.assertTrue(result)

    @patch('src.infrastructure.payment_gateways.mercado_pago_gateway.mercadopago.SDK')
    def test_process_ipn_payment_notification(self, mock_sdk_class):
        """Test processing IPN payment notification."""
        mock_sdk = MagicMock()
        mock_payment = MagicMock()
        mock_payment.get.return_value = {
            "status": 200,
            "response": {
                "id": 12345,
                "status": "approved",
                "status_detail": "accredited",
                "transaction_amount": 97.00,
                "external_reference": "order_123",
                "payer": {"email": "test@example.com"}
            }
        }
        mock_sdk.payment.return_value = mock_payment
        mock_sdk_class.return_value = mock_sdk

        gateway = MercadoPagoGateway(self.access_token)
        result = gateway.process_ipn_notification("payment", "12345")

        self.assertEqual(result["type"], "payment")
        self.assertEqual(result["id"], "12345")
        self.assertEqual(result["status"], "approved")


if __name__ == "__main__":
    unittest.main()
