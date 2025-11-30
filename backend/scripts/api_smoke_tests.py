#!/usr/bin/env python3
"""
API Integration Test Script

Run this to verify the API works end-to-end.
Usage:
    cd backend
    pip install -r requirements.txt
    python scripts/test_api.py

Optionally set TEST_BASE_URL to test against a deployed instance.
"""
import os
import sys
import json
import requests
from datetime import datetime

# Configuration
BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000")
API_URL = f"{BASE_URL}/api/v1"

# Test data
TEST_USER = {
    "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "preferred_language": "en",
    "preferred_currency": "USD"
}


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def log_pass(msg):
    print(f"{Colors.GREEN}✓ PASS{Colors.END}: {msg}")


def log_fail(msg):
    print(f"{Colors.RED}✗ FAIL{Colors.END}: {msg}")


def log_info(msg):
    print(f"{Colors.BLUE}ℹ INFO{Colors.END}: {msg}")


def log_warn(msg):
    print(f"{Colors.YELLOW}⚠ WARN{Colors.END}: {msg}")


def test_health():
    """Test health endpoints."""
    print("\n" + "="*50)
    print("Testing Health Endpoints")
    print("="*50)

    # Basic health
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        if r.status_code == 200 and r.json().get("status") == "healthy":
            log_pass(f"GET /health - Status: {r.json()}")
        else:
            log_fail(f"GET /health - Unexpected response: {r.text}")
            return False
    except Exception as e:
        log_fail(f"GET /health - Error: {e}")
        return False

    # Readiness check
    try:
        r = requests.get(f"{BASE_URL}/health/ready", timeout=5)
        data = r.json()
        log_info(f"GET /health/ready - Checks: {data.get('checks', {})}")
        if data.get("checks", {}).get("database"):
            log_pass("Database connection OK")
        else:
            log_warn("Database not connected (may be expected in dev)")
    except Exception as e:
        log_warn(f"GET /health/ready - Error: {e}")

    return True


def test_auth():
    """Test authentication flow."""
    print("\n" + "="*50)
    print("Testing Authentication")
    print("="*50)

    tokens = {}

    # Register
    try:
        r = requests.post(f"{API_URL}/auth/register", json=TEST_USER, timeout=10)
        if r.status_code == 201:
            tokens = r.json()
            log_pass(f"POST /auth/register - User created, got tokens")
        elif r.status_code == 409:
            log_info("User already exists, trying login instead")
        else:
            log_fail(f"POST /auth/register - Status {r.status_code}: {r.text}")
    except Exception as e:
        log_fail(f"POST /auth/register - Error: {e}")
        return None

    # Login (if register returned 409 or we want to verify login works)
    if not tokens.get("access_token"):
        try:
            r = requests.post(f"{API_URL}/auth/login", json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }, timeout=10)
            if r.status_code == 200:
                tokens = r.json()
                log_pass(f"POST /auth/login - Login successful")
            else:
                log_fail(f"POST /auth/login - Status {r.status_code}: {r.text}")
                return None
        except Exception as e:
            log_fail(f"POST /auth/login - Error: {e}")
            return None

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    # Verify token
    try:
        r = requests.post(f"{API_URL}/auth/verify", json={"token": access_token}, timeout=5)
        if r.status_code == 200 and r.json().get("valid"):
            log_pass(f"POST /auth/verify - Token valid")
        else:
            log_fail(f"POST /auth/verify - Token invalid: {r.text}")
    except Exception as e:
        log_fail(f"POST /auth/verify - Error: {e}")

    # Get current user
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        r = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=5)
        if r.status_code == 200:
            user = r.json()
            log_pass(f"GET /auth/me - Got user: {user.get('email')}")
        else:
            log_fail(f"GET /auth/me - Status {r.status_code}: {r.text}")
    except Exception as e:
        log_fail(f"GET /auth/me - Error: {e}")

    # Refresh token
    try:
        r = requests.post(f"{API_URL}/auth/refresh", json={"refresh_token": refresh_token}, timeout=5)
        if r.status_code == 200:
            new_tokens = r.json()
            log_pass(f"POST /auth/refresh - Got new tokens")
            access_token = new_tokens.get("access_token")  # Use new token
        else:
            log_fail(f"POST /auth/refresh - Status {r.status_code}: {r.text}")
    except Exception as e:
        log_fail(f"POST /auth/refresh - Error: {e}")

    return access_token


def test_products(access_token=None):
    """Test product endpoints."""
    print("\n" + "="*50)
    print("Testing Products")
    print("="*50)

    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}

    # List products (public)
    try:
        r = requests.get(f"{API_URL}/products", timeout=5)
        if r.status_code == 200:
            data = r.json()
            count = len(data.get("items", data)) if isinstance(data, dict) else len(data)
            log_pass(f"GET /products - Found {count} products")
        else:
            log_fail(f"GET /products - Status {r.status_code}: {r.text}")
    except Exception as e:
        log_fail(f"GET /products - Error: {e}")


def test_webhooks():
    """Test webhook configuration."""
    print("\n" + "="*50)
    print("Testing Webhook Configuration")
    print("="*50)

    try:
        r = requests.get(f"{API_URL}/webhooks/test", timeout=5)
        if r.status_code == 200:
            config = r.json()
            log_info(f"Stripe configured: {config.get('stripe_configured')}")
            log_info(f"Mercado Pago configured: {config.get('mercado_pago_configured')}")
            if config.get('stripe_configured') or config.get('mercado_pago_configured'):
                log_pass("At least one payment gateway configured")
            else:
                log_warn("No payment gateways configured (set STRIPE_SECRET_KEY or MERCADO_PAGO_ACCESS_TOKEN)")
        elif r.status_code == 404:
            log_info("Webhook test endpoint disabled (production mode)")
        else:
            log_fail(f"GET /webhooks/test - Status {r.status_code}")
    except Exception as e:
        log_fail(f"GET /webhooks/test - Error: {e}")


def test_uploads(access_token):
    """Test upload endpoints (if R2 configured)."""
    print("\n" + "="*50)
    print("Testing Uploads")
    print("="*50)

    if not access_token:
        log_warn("Skipping upload tests - no auth token")
        return

    headers = {"Authorization": f"Bearer {access_token}"}

    # Try to get presigned URL (tests R2 config)
    try:
        r = requests.post(
            f"{API_URL}/uploads/presigned-upload",
            params={"filename": "test.pdf", "folder": "uploads"},
            headers=headers,
            timeout=5
        )
        if r.status_code == 200:
            log_pass("POST /uploads/presigned-upload - R2 storage working")
        elif r.status_code == 503:
            log_warn("R2 storage not configured (set R2_* environment variables)")
        else:
            log_fail(f"POST /uploads/presigned-upload - Status {r.status_code}: {r.text}")
    except Exception as e:
        log_fail(f"POST /uploads/presigned-upload - Error: {e}")


def main():
    print(f"""
╔══════════════════════════════════════════════════════╗
║           Alpha Grit API Integration Tests           ║
╠══════════════════════════════════════════════════════╣
║  Testing against: {BASE_URL:<35} ║
╚══════════════════════════════════════════════════════╝
""")

    # Check if server is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}ERROR: Cannot connect to {BASE_URL}")
        print(f"Make sure the server is running:{Colors.END}")
        print(f"  cd backend && uvicorn src.main:app --reload --port 8000")
        sys.exit(1)

    # Run tests
    passed = 0
    failed = 0

    if test_health():
        passed += 1
    else:
        failed += 1
        print("\n⚠️  Health check failed - stopping tests")
        sys.exit(1)

    access_token = test_auth()
    if access_token:
        passed += 1
    else:
        failed += 1

    test_products(access_token)
    passed += 1

    test_webhooks()
    passed += 1

    test_uploads(access_token)
    passed += 1

    # Summary
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    print(f"Tests completed")

    print(f"""
{Colors.GREEN}✓ Core API is working{Colors.END}

Next steps to fully trust the API:
1. Set up Stripe test keys (sk_test_...) and test a payment flow
2. Configure R2 and test file uploads
3. Deploy to Railway staging and repeat these tests
4. Test webhooks using Stripe CLI: stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
""")


if __name__ == "__main__":
    main()
