from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.v1.schemas import CartItemResponse, CartItemCreate, CartItemUpdate, OrderResponse, OrderCreate, DownloadLinkResponse
from src.api.v1.dependencies import get_order_management_service
from src.application.services.order_management_service import OrderManagementService
from src.domain.entities.order import OrderStatus  # Needed for status filtering

router = APIRouter()

# --- Cart Endpoints ---
@router.post("/cart/{user_id}/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_item_to_cart(
    user_id: str,
    item_data: CartItemCreate,
    service: OrderManagementService = Depends(get_order_management_service)
):
    try:
        cart_item = service.add_to_cart(user_id, item_data.product_id, item_data.quantity)
        return CartItemResponse.model_validate(cart_item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/cart/{user_id}/items", response_model=List[CartItemResponse])
def get_user_cart(
    user_id: str,
    service: OrderManagementService = Depends(get_order_management_service)
):
    cart_items = service.get_user_cart(user_id)
    return [CartItemResponse.model_validate(item) for item in cart_items]

@router.patch("/cart/{user_id}/items/{cart_item_id}", response_model=CartItemResponse)
def update_cart_item(
    user_id: str,
    cart_item_id: str,
    item_data: CartItemUpdate,
    service: OrderManagementService = Depends(get_order_management_service)
):
    try:
        cart_item = service.update_cart_item_quantity(user_id, cart_item_id, item_data.quantity)
        return CartItemResponse.model_validate(cart_item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

@router.delete("/cart/{user_id}/items/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_cart(
    user_id: str,
    cart_item_id: str,
    service: OrderManagementService = Depends(get_order_management_service)
):
    try:
        service.remove_from_cart(user_id, cart_item_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")


# --- Order Endpoints ---
@router.post("/orders/{user_id}/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout_cart(
    user_id: str,
    order_data: OrderCreate,
    service: OrderManagementService = Depends(get_order_management_service)
):
    try:
        order = service.checkout(
            user_id=user_id,
            customer_email=order_data.customer_email,
            customer_name=order_data.customer_name,
            payment_method=order_data.payment_method,
            currency=order_data.currency,
            ip_address=order_data.ip_address,
            user_agent=order_data.user_agent
        )
        return OrderResponse.model_validate(order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: str,
    service: OrderManagementService = Depends(get_order_management_service)
):
    order = service.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderResponse.model_validate(order)

@router.get("/orders/", response_model=List[OrderResponse])
def list_orders(
    user_id: Optional[str] = None,
    status: Optional[str] = None, # Expecting string, convert to Enum in service
    service: OrderManagementService = Depends(get_order_management_service)
):
    # Convert status string to Enum if provided
    order_status_enum = OrderStatus(status) if status else None
    orders = service.list_orders(user_id=user_id, status=order_status_enum)
    return [OrderResponse.model_validate(o) for o in orders]

@router.patch("/orders/{order_id}/mark_paid", response_model=OrderResponse)
def mark_order_paid(
    order_id: str,
    payment_intent_id: Optional[str] = None,
    stripe_session_id: Optional[str] = None,
    mercado_pago_id: Optional[str] = None,
    service: OrderManagementService = Depends(get_order_management_service)
):
    try:
        order = service.mark_order_paid(order_id, payment_intent_id, stripe_session_id, mercado_pago_id)
        return OrderResponse.model_validate(order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found or payment not confirmed")


# --- Download Link Endpoints ---
@router.get("/downloads/{token}", response_model=DownloadLinkResponse)
def get_download_link(
    token: str,
    service: OrderManagementService = Depends(get_order_management_service)
):
    link = service.get_download_link_by_token(token)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Download link not found")
    return DownloadLinkResponse.model_validate(link)

@router.post("/downloads/{token}/track", response_model=DownloadLinkResponse)
def track_download(
    token: str,
    ip_address: Optional[str] = None, # Assuming IP address can be passed or inferred
    service: OrderManagementService = Depends(get_order_management_service)
):
    if not ip_address:
        # In a real app, you'd get this from request.client.host
        ip_address = "127.0.0.1" 
    try:
        link = service.track_download(token, ip_address)
        return DownloadLinkResponse.model_validate(link)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Download link not found or invalid")
