from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.v1.schemas import RefundRequestResponse, RefundRequestCreate, RefundRequestProcess
from src.api.v1.dependencies import get_refund_service
from src.application.services.refund_service import RefundService
from src.domain.entities.refund import RefundStatus

router = APIRouter()

# --- Refund Request Endpoints ---
@router.post("/refund-requests/", response_model=RefundRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_refund_request(
    refund_data: RefundRequestCreate,
    service: RefundService = Depends(get_refund_service)
):
    try:
        refund_request = service.submit_refund_request(
            order_id=refund_data.order_id,
            user_id=refund_data.user_id,
            reason=refund_data.reason
        )
        return RefundRequestResponse.model_validate(refund_request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/refund-requests/", response_model=List[RefundRequestResponse])
def list_refund_requests(
    order_id: Optional[str] = None,
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None, # Expecting string, convert to Enum in service
    service: RefundService = Depends(get_refund_service)
):
    # Convert status string to Enum if provided
    refund_status_enum = RefundStatus(status_filter) if status_filter else None
    requests = service.list_refund_requests(order_id=order_id, user_id=user_id, status=refund_status_enum)
    return [RefundRequestResponse.model_validate(r) for r in requests]

@router.get("/refund-requests/{request_id}", response_model=RefundRequestResponse)
def get_refund_request(
    request_id: str,
    service: RefundService = Depends(get_refund_service)
):
    request = service.get_refund_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refund request not found")
    return RefundRequestResponse.model_validate(request)

@router.patch("/refund-requests/{request_id}/process", response_model=RefundRequestResponse)
def process_refund_request_api(
    request_id: str,
    process_data: RefundRequestProcess,
    processed_by_user_id: str, # In a real app, this would come from auth context
    service: RefundService = Depends(get_refund_service)
):
    try:
        refund_request = service.process_refund_request(
            request_id=request_id,
            processed_by_user_id=processed_by_user_id,
            action=process_data.action,
            admin_notes=process_data.admin_notes
        )
        return RefundRequestResponse.model_validate(refund_request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refund request not found or unauthorized")

@router.delete("/refund-requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_refund_request(
    request_id: str,
    service: RefundService = Depends(get_refund_service)
):
    try:
        service.delete_refund_request(request_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refund request not found")
