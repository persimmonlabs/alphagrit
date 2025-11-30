# Alpha Grit API Documentation

**Version:** 1.0.0
**Base URL:** `https://api.alphagrit.com/api/v1`
**Environment:** Production on Railway

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Orders & Cart](#orders--cart)
4. [Users](#users)
5. [Content](#content)
6. [Reviews](#reviews)
7. [Refunds](#refunds)
8. [Uploads](#uploads)
9. [Webhooks](#webhooks)
10. [E-books](#e-books)
11. [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Register

Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "preferred_language": "en",
  "preferred_currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Login

Authenticate an existing user.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Token

Get a new access token using a refresh token.

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Verify Token

Validate a token and get user info.

```http
POST /auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "preferred_language": "en",
    "preferred_currency": "USD"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Change Password

```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## Products

### List Products

```http
GET /products?status=active&limit=20&offset=0
```

**Query Parameters:**
- `status`: Filter by status (draft, active, archived)
- `category_id`: Filter by category
- `limit`: Results per page (default 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "IMPARÁVEL",
      "slug": "imparavel",
      "description_short": "Transform your mindset...",
      "price_brl": 97.00,
      "price_usd": 19.00,
      "cover_image_url": "https://...",
      "status": "active",
      "rating": 4.8,
      "review_count": 42
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### Get Product

```http
GET /products/{product_id}
```

### Create Product (Admin)

```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New E-Book",
  "slug": "new-ebook",
  "description_short": "Short description",
  "description_full": "Full description...",
  "price_brl": 97.00,
  "price_usd": 19.00,
  "category_id": "uuid",
  "file_url": "https://files.alphagrit.com/ebooks/..."
}
```

### Update Product (Admin)

```http
PATCH /products/{product_id}
Authorization: Bearer <admin_token>
```

### Publish/Archive Product (Admin)

```http
PUT /products/{product_id}/publish
PUT /products/{product_id}/archive
Authorization: Bearer <admin_token>
```

---

## Orders & Cart

### Get Cart

```http
GET /orders/cart/{user_id}
Authorization: Bearer <access_token>
```

### Add to Cart

```http
POST /orders/cart/{user_id}/items
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 1
}
```

### Update Cart Item

```http
PATCH /orders/cart/{user_id}/items/{product_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 2
}
```

### Remove from Cart

```http
DELETE /orders/cart/{user_id}/items/{product_id}
Authorization: Bearer <access_token>
```

### Checkout

Create an order from cart items.

```http
POST /orders/{user_id}/checkout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "payment_method": "stripe",
  "currency": "USD"
}
```

**Response:**
```json
{
  "order_id": "uuid",
  "order_number": "AG-20241129-XXXX",
  "total": 19.00,
  "currency": "USD",
  "status": "pending",
  "payment_intent": {
    "client_secret": "pi_xxx_secret_xxx",
    "payment_intent_id": "pi_xxx"
  }
}
```

### Get Order

```http
GET /orders/{order_id}
Authorization: Bearer <access_token>
```

### List User Orders

```http
GET /orders?user_id={user_id}&status=paid
Authorization: Bearer <access_token>
```

### Mark Order Paid (Admin/Webhook)

```http
PATCH /orders/{order_id}/mark_paid
Authorization: Bearer <admin_token>
```

---

## Download Links

### Get Download Link

```http
GET /orders/downloads/{token}
```

**Response:**
```json
{
  "token": "uuid",
  "product_name": "IMPARÁVEL",
  "file_url": "https://files.alphagrit.com/...",
  "download_count": 2,
  "max_downloads": 5,
  "expires_at": "2024-12-29T00:00:00Z"
}
```

### Track Download

```http
POST /orders/downloads/{token}/track
Content-Type: application/json

{
  "ip_address": "192.168.1.1"
}
```

---

## Users

### List Users (Admin)

```http
GET /users?role=customer
Authorization: Bearer <admin_token>
```

### Get User

```http
GET /users/{user_id}
Authorization: Bearer <access_token>
```

### Update User

```http
PATCH /users/{user_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "preferred_language": "pt"
}
```

---

## Content

### Blog Posts

```http
GET /content/blog?status=published&limit=10
GET /content/blog/{post_id}
POST /content/blog (Admin)
PATCH /content/blog/{post_id} (Admin)
PUT /content/blog/{post_id}/publish (Admin)
DELETE /content/blog/{post_id} (Admin)
```

### FAQs

```http
GET /content/faqs?category=general
GET /content/faqs/{faq_id}
POST /content/faqs (Admin)
PATCH /content/faqs/{faq_id} (Admin)
DELETE /content/faqs/{faq_id} (Admin)
```

### Site Configuration

```http
GET /content/site-config
GET /content/site-config/{key}
PATCH /content/site-config/{key} (Admin)
```

### Feature Flags

```http
GET /content/feature-flags
GET /content/feature-flags/{key}
GET /content/feature-flags/{key}/enabled
PATCH /content/feature-flags/{key} (Admin)
```

---

## Reviews

### List Reviews

```http
GET /reviews?product_id={uuid}&approved=true
```

### Submit Review

```http
POST /reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "product_id": "uuid",
  "rating": 5,
  "title": "Amazing book!",
  "content": "This book changed my life..."
}
```

### Approve/Feature Review (Admin)

```http
PUT /reviews/{review_id}/approve
PUT /reviews/{review_id}/feature
Authorization: Bearer <admin_token>
```

---

## Refunds

### Request Refund

```http
POST /refund-requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "order_id": "uuid",
  "reason": "Not satisfied with the content"
}
```

### List Refund Requests (Admin)

```http
GET /refund-requests?status=pending
Authorization: Bearer <admin_token>
```

### Process Refund (Admin)

```http
PATCH /refund-requests/{request_id}/process
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "admin_notes": "Refund approved as per policy"
}
```

---

## Uploads

### Upload File

```http
POST /uploads?folder=covers
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "file_id": "uuid",
  "filename": "cover.jpg",
  "url": "https://files.alphagrit.com/covers/2024/11/29/uuid.jpg",
  "size": 245678,
  "content_type": "image/jpeg",
  "key": "covers/2024/11/29/uuid.jpg"
}
```

**Allowed folders:** uploads, products, covers, ebooks, content, images

**File limits:**
- Images: 10 MB (.jpg, .jpeg, .png, .gif, .webp, .svg)
- Documents: 100 MB (.pdf, .epub, .mobi)

### Get Presigned Upload URL

For direct client-to-R2 uploads (large files):

```http
POST /uploads/presigned-upload?filename=ebook.pdf&folder=ebooks
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "url": "https://xxx.r2.cloudflarestorage.com/...",
  "expires_in": 3600,
  "key": "ebooks/2024/11/29/uuid.pdf"
}
```

### Get Download URL

```http
GET /uploads/{file_key}/download?expires_in=3600
Authorization: Bearer <access_token>
```

### Delete File (Admin)

```http
DELETE /uploads/{file_key}
Authorization: Bearer <admin_token>
```

---

## Webhooks

### Stripe Webhook

```http
POST /webhooks/stripe
Stripe-Signature: <signature>
Content-Type: application/json

{Stripe event payload}
```

**Handled events:**
- `payment_intent.succeeded` - Marks order as paid
- `payment_intent.payment_failed` - Marks order as cancelled
- `checkout.session.completed` - Marks order as paid
- `charge.refunded` - Updates refund status

### Mercado Pago Webhook

```http
POST /webhooks/mercado-pago
x-signature: <signature>
x-request-id: <request_id>
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "payment_id"
  }
}
```

**Handled topics:**
- `payment` - Updates order status based on payment status
- `merchant_order` - Handles aggregated orders

---

## E-books

### Get E-book

```http
GET /ebooks/{ebook_id}
Authorization: Bearer <access_token>
```

### List Chapters

```http
GET /ebooks/{ebook_id}/chapters
Authorization: Bearer <access_token>
```

### Get Chapter Content

```http
GET /ebooks/{ebook_id}/chapters/{chapter_id}
Authorization: Bearer <access_token>
```

### Get Reading Progress

```http
GET /ebooks/{ebook_id}/progress
Authorization: Bearer <access_token>
```

### Update Reading Progress

```http
PUT /ebooks/{ebook_id}/progress
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_chapter_id": "uuid",
  "current_section_id": "uuid",
  "completion_percentage": 45.5
}
```

### Check Access

```http
GET /ebooks/{ebook_id}/access
Authorization: Bearer <access_token>
```

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no body) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Authentication Errors

```json
{
  "detail": "Invalid or expired token"
}
```

Header: `WWW-Authenticate: Bearer`

---

## Health Checks

### Basic Health

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "environment": "production"
}
```

### Readiness Check

```http
GET /health/ready
```

**Response:**
```json
{
  "status": "ready",
  "checks": {
    "database": true,
    "stripe": true,
    "mercado_pago": true,
    "r2_storage": true
  }
}
```

### Liveness Check

```http
GET /health/live
```

---

## Rate Limits

Currently no rate limiting is enforced. Future versions may implement:
- 60 requests/minute for authenticated users
- 20 requests/minute for unauthenticated endpoints

---

## Pagination

All list endpoints support pagination:

```http
GET /products?limit=20&offset=0
```

**Response includes:**
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

## Currencies

Supported currencies:
- `USD` - US Dollar
- `BRL` - Brazilian Real

Products have prices in both currencies. Orders are charged in the customer's selected currency.

---

## Languages

Supported languages:
- `en` - English
- `pt` - Portuguese (Brazil)

E-book content is available in both languages where translations exist.
