from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Any
from src.api.v1.schemas import (
    BlogPostResponse, BlogPostCreate, BlogPostUpdate,
    FaqResponse, FaqCreate, FaqUpdate,
    SiteConfigSettingResponse, SiteConfigSettingUpdate,
    FeatureFlagResponse, FeatureFlagUpdate,
    SendEmailRequest, EmailLogResponse
)
from src.api.v1.dependencies import get_content_management_service, get_email_service
from src.application.services.content_management_service import ContentManagementService
from src.application.services.email_service import EmailService
from src.domain.entities.content import PostStatus

router = APIRouter()

# --- Blog Post Endpoints ---
@router.post("/blog-posts/", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_blog_post(
    post_data: BlogPostCreate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        post = service.create_blog_post(**post_data.model_dump())
        return BlogPostResponse.model_validate(post)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/blog-posts/", response_model=List[BlogPostResponse])
def list_blog_posts(
    status: Optional[str] = None, # Expecting string, convert to Enum in service
    service: ContentManagementService = Depends(get_content_management_service)
):
    post_status_enum = PostStatus(status) if status else None
    posts = service.list_blog_posts(status=post_status_enum)
    return [BlogPostResponse.model_validate(p) for p in posts]

@router.get("/blog-posts/{post_id}", response_model=BlogPostResponse)
def get_blog_post(
    post_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    post = service.get_blog_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return BlogPostResponse.model_validate(post)

@router.patch("/blog-posts/{post_id}", response_model=BlogPostResponse)
def update_blog_post(
    post_id: str,
    post_data: BlogPostUpdate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        update_data = {k: v for k, v in post_data.model_dump(exclude_unset=True).items()}
        post = service.update_blog_post(post_id, **update_data)
        return BlogPostResponse.model_validate(post)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

@router.put("/blog-posts/{post_id}/publish", response_model=BlogPostResponse)
def publish_blog_post(
    post_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        post = service.publish_blog_post(post_id)
        return BlogPostResponse.model_validate(post)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

@router.put("/blog-posts/{post_id}/archive", response_model=BlogPostResponse)
def archive_blog_post(
    post_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        post = service.archive_blog_post(post_id)
        return BlogPostResponse.model_validate(post)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

@router.delete("/blog-posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_post(
    post_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        service.delete_blog_post(post_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")


# --- FAQ Endpoints ---
@router.post("/faqs/", response_model=FaqResponse, status_code=status.HTTP_201_CREATED)
def create_faq(
    faq_data: FaqCreate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        faq = service.create_faq(**faq_data.model_dump())
        return FaqResponse.model_validate(faq)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/faqs/", response_model=List[FaqResponse])
def list_faqs(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    service: ContentManagementService = Depends(get_content_management_service)
):
    faqs = service.list_faqs(category=category, is_active=is_active)
    return [FaqResponse.model_validate(f) for f in faqs]

@router.get("/faqs/{faq_id}", response_model=FaqResponse)
def get_faq(
    faq_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    faq = service.get_faq_by_id(faq_id)
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    return FaqResponse.model_validate(faq)

@router.patch("/faqs/{faq_id}", response_model=FaqResponse)
def update_faq(
    faq_id: str,
    faq_data: FaqUpdate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        update_data = {k: v for k, v in faq_data.model_dump(exclude_unset=True).items()}
        faq = service.update_faq(faq_id, **update_data)
        return FaqResponse.model_validate(faq)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")

@router.delete("/faqs/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        service.delete_faq(faq_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")


# --- Site Configuration Endpoints ---
@router.get("/site-config/", response_model=List[SiteConfigSettingResponse])
def list_site_settings(
    is_public: Optional[bool] = None,
    service: ContentManagementService = Depends(get_content_management_service)
):
    settings = service.get_all_site_settings(is_public=is_public)
    return [SiteConfigSettingResponse.model_validate(s) for s in settings]

@router.get("/site-config/{key}", response_model=SiteConfigSettingResponse)
def get_site_setting(
    key: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    setting = service.get_site_setting(key)
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site setting not found")
    return SiteConfigSettingResponse.model_validate(setting)

@router.put("/site-config/{key}", response_model=SiteConfigSettingResponse)
def update_site_setting(
    key: str,
    setting_data: SiteConfigSettingUpdate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        setting = service.update_site_setting(
            key=key,
            value=setting_data.value,
            value_type=setting_data.value_type,
            description=setting_data.description,
            is_public=setting_data.is_public
        )
        return SiteConfigSettingResponse.model_validate(setting)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# --- Feature Flag Endpoints ---
@router.get("/feature-flags/", response_model=List[FeatureFlagResponse])
def list_feature_flags(
    service: ContentManagementService = Depends(get_content_management_service)
):
    flags = service.get_all_feature_flags()
    return [FeatureFlagResponse.model_validate(f) for f in flags]

@router.get("/feature-flags/{key}", response_model=FeatureFlagResponse)
def get_feature_flag(
    key: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    flag = service.get_feature_flag(key)
    if not flag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature flag not found")
    return FeatureFlagResponse.model_validate(flag)

@router.put("/feature-flags/{key}", response_model=FeatureFlagResponse)
def update_feature_flag(
    key: str,
    flag_data: FeatureFlagUpdate,
    service: ContentManagementService = Depends(get_content_management_service)
):
    try:
        flag = service.update_feature_flag(
            key=key,
            is_enabled=flag_data.is_enabled,
            description=flag_data.description
        )
        return FeatureFlagResponse.model_validate(flag)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/feature-flags/{key}/is_enabled", response_model=bool)
def is_feature_enabled(
    key: str,
    service: ContentManagementService = Depends(get_content_management_service)
):
    return service.is_feature_enabled(key)


# --- Email Sending Endpoint (part of Notifications domain, but managed via ContentMS for now) ---
# In a full app, this might be a separate "Notifications" API
@router.post("/send-email/", response_model=EmailLogResponse, status_code=status.HTTP_201_CREATED)
def send_email_api(
    email_request: SendEmailRequest,
    email_service: EmailService = Depends(get_email_service)
):
    try:
        email_log = email_service.send_and_log_email(
            recipient_email=email_request.recipient_email,
            subject=email_request.subject,
            body=email_request.body,
            html_body=email_request.html_body,
            template_name=email_request.template_name,
            order_id=email_request.order_id,
            user_id=email_request.user_id,
            provider=email_request.provider
        )
        return EmailLogResponse.model_validate(email_log)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Catch all exceptions during email sending and log them
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send email: {str(e)}")
