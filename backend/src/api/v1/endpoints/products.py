from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.v1.schemas import ProductResponse, ProductCreate, ProductUpdate, CategoryResponse, CategoryCreate, CategoryUpdate
from src.api.v1.dependencies import get_product_management_service
from src.application.services.product_management_service import ProductManagementService
from src.domain.entities.product import ProductStatus

router = APIRouter()

# --- Product Endpoints ---
@router.post("/products/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        # Only pass the parameters that the service method accepts
        product = service.create_product(
            name=product_data.name,
            slug=product_data.slug,
            category_id=product_data.category_id,
            price_brl=product_data.price_brl,
            price_usd=product_data.price_usd,
            description_short=getattr(product_data, 'description_short', None),
            description_full=getattr(product_data, 'description_full', None),
            file_url=getattr(product_data, 'file_url', None),
            file_format=getattr(product_data, 'file_format', 'pdf'),
            author=getattr(product_data, 'author', None),
            pages=getattr(product_data, 'pages', None)
        )
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/products/", response_model=List[ProductResponse])
def list_products(
    status: Optional[ProductStatus] = None,
    service: ProductManagementService = Depends(get_product_management_service)
):
    products = service.list_products(status=status)
    return [ProductResponse.model_validate(p) for p in products]

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponse.model_validate(product)

@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_data: ProductUpdate,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        # Filter out None values to only update provided fields
        update_data = {k: v for k, v in product_data.model_dump(exclude_unset=True).items()}
        product = service.update_product(product_id, **update_data)
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


@router.put("/products/{product_id}/publish", response_model=ProductResponse)
def publish_product(
    product_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        product = service.publish_product(product_id)
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

@router.put("/products/{product_id}/archive", response_model=ProductResponse)
def archive_product(
    product_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        product = service.archive_product(product_id)
        return ProductResponse.model_validate(product)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        service.delete_product(product_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


# --- Category Endpoints ---
@router.post("/categories/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        # Only pass the parameters that the service method accepts
        category = service.create_category(
            name=category_data.name,
            slug=category_data.slug,
            description=category_data.description
        )
        return CategoryResponse.model_validate(category)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/categories/", response_model=List[CategoryResponse])
def list_categories(
    service: ProductManagementService = Depends(get_product_management_service)
):
    categories = service.list_categories()
    return [CategoryResponse.model_validate(c) for c in categories]

@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    category = service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponse.model_validate(category)

@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        update_data = {k: v for k, v in category_data.model_dump(exclude_unset=True).items()}
        category = service.update_category(category_id, **update_data)
        return CategoryResponse.model_validate(category)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    service: ProductManagementService = Depends(get_product_management_service)
):
    try:
        service.delete_category(category_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
