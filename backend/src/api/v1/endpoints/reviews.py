from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.v1.schemas import ReviewResponse, ReviewCreate, ReviewUpdate
from src.api.v1.dependencies import get_customer_feedback_service
from src.application.services.customer_feedback_service import CustomerFeedbackService

router = APIRouter()

# --- Review Endpoints ---
@router.post("/reviews/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    review_data: ReviewCreate,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    try:
        # Only pass the parameters that the service method accepts
        review = service.submit_review(
            product_id=review_data.product_id,
            user_id=review_data.user_id,
            content=review_data.content,
            rating=review_data.rating,
            title=getattr(review_data, 'title', None),
            reviewer_name=getattr(review_data, 'reviewer_name', None),
            reviewer_avatar_url=getattr(review_data, 'reviewer_avatar_url', None),
            is_verified_purchase=getattr(review_data, 'is_verified_purchase', False),
            is_approved=getattr(review_data, 'is_approved', False)
        )
        return ReviewResponse.model_validate(review)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/reviews/", response_model=List[ReviewResponse])
def list_reviews(
    product_id: Optional[str] = None,
    user_id: Optional[str] = None,
    is_approved: Optional[bool] = None,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    reviews = service.list_reviews(product_id=product_id, user_id=user_id, is_approved=is_approved)
    return [ReviewResponse.model_validate(r) for r in reviews]

@router.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: str,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    review = service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return ReviewResponse.model_validate(review)

@router.patch("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    try:
        # Filter out None values to only update provided fields
        update_data = {k: v for k, v in review_data.model_dump(exclude_unset=True).items()}
        review = service.update_review(review_id, **update_data)
        return ReviewResponse.model_validate(review)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

@router.put("/reviews/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: str,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    try:
        review = service.approve_review(review_id)
        return ReviewResponse.model_validate(review)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

@router.put("/reviews/{review_id}/feature", response_model=ReviewResponse)
def feature_review(
    review_id: str,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    try:
        review = service.feature_review(review_id)
        return ReviewResponse.model_validate(review)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: str,
    service: CustomerFeedbackService = Depends(get_customer_feedback_service)
):
    try:
        service.delete_review(review_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
