"""
Payment gateway implementations.

Imports are lazy to prevent errors if SDKs aren't installed.
"""
from .mock_gateways import MockStripeGateway, MockMercadoPagoGateway

# Lazy imports for real gateways - only imported when accessed
_stripe_gateway = None
_mercadopago_gateway = None


def get_stripe_gateway_class():
    """Get StripeGateway class with lazy import."""
    global _stripe_gateway
    if _stripe_gateway is None:
        from .stripe_gateway import StripeGateway
        _stripe_gateway = StripeGateway
    return _stripe_gateway


def get_mercadopago_gateway_class():
    """Get MercadoPagoGateway class with lazy import."""
    global _mercadopago_gateway
    if _mercadopago_gateway is None:
        from .mercado_pago_gateway import MercadoPagoGateway
        _mercadopago_gateway = MercadoPagoGateway
    return _mercadopago_gateway


# For direct imports, use try/except
try:
    from .stripe_gateway import StripeGateway
except ImportError:
    StripeGateway = None  # type: ignore

try:
    from .mercado_pago_gateway import MercadoPagoGateway
except ImportError:
    MercadoPagoGateway = None  # type: ignore


__all__ = [
    "MockStripeGateway",
    "MockMercadoPagoGateway",
    "StripeGateway",
    "MercadoPagoGateway",
    "get_stripe_gateway_class",
    "get_mercadopago_gateway_class"
]
