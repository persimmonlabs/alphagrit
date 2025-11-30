# Alpha Grit Backend

Production-ready FastAPI backend for Alpha Grit e-commerce platform.

## Features

- **Authentication**: JWT-based auth with access/refresh tokens, bcrypt password hashing
- **Products**: Full CRUD with categories, publish/archive workflow
- **Orders & Cart**: Complete checkout flow with real payment processing
- **Payments**: Stripe and Mercado Pago integration with webhook handling
- **File Storage**: Cloudflare R2 (S3-compatible) for e-book files and images
- **E-books**: Chapter-based content with reading progress tracking
- **Content CMS**: Blog posts, FAQs, site config, feature flags
- **Reviews**: Product reviews with moderation workflow
- **Refunds**: Request and processing system
- **Health Checks**: `/health`, `/health/ready`, `/health/live` endpoints

## Tech Stack

- **Framework**: FastAPI with Pydantic v2
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Migrations**: Alembic
- **Auth**: python-jose (JWT) + passlib (bcrypt)
- **Payments**: stripe + mercadopago SDKs
- **Storage**: boto3 (S3-compatible for Cloudflare R2)
- **Email**: Resend (prepared)

## Quick Start

### Local Development

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your local settings

# Run database migrations
alembic upgrade head

# Start development server
uvicorn src.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for OpenAPI documentation.

### Running Tests

```bash
cd backend
pytest                           # All tests
pytest src/tests/unit            # Unit tests only
pytest src/tests/integration     # Integration tests only
pytest -v --tb=short             # Verbose with short tracebacks
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | - | Secret key for JWT signing (min 32 chars) |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token TTL |
| `STRIPE_SECRET_KEY` | Prod | - | Stripe API secret key |
| `STRIPE_PUBLISHABLE_KEY` | Prod | - | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Prod | - | Stripe webhook signing secret |
| `MERCADO_PAGO_ACCESS_TOKEN` | Prod | - | Mercado Pago access token |
| `MERCADO_PAGO_PUBLIC_KEY` | Prod | - | Mercado Pago public key |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Prod | - | Mercado Pago webhook secret |
| `R2_ACCOUNT_ID` | Prod | - | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Prod | - | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Prod | - | R2 secret key |
| `R2_BUCKET_NAME` | Prod | - | R2 bucket name |
| `R2_PUBLIC_URL` | Prod | - | Public URL for R2 bucket |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `ENVIRONMENT` | No | `development` | Environment label |

See `.env.example` for a complete template.

## Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create new migration (after model changes)
alembic revision --autogenerate -m "description"

# Rollback one step
alembic downgrade -1

# Show current revision
alembic current
```

## API Documentation

- **OpenAPI (Swagger)**: `/docs`
- **ReDoc**: `/redoc`
- **Detailed Reference**: `docs/API.md`

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | User registration |
| `POST /api/v1/auth/login` | User login (get tokens) |
| `POST /api/v1/auth/refresh` | Refresh access token |
| `GET /api/v1/products` | List products |
| `POST /api/v1/orders/{user_id}/checkout` | Create order |
| `POST /api/v1/webhooks/stripe` | Stripe webhook handler |
| `POST /api/v1/webhooks/mercado-pago` | Mercado Pago IPN handler |
| `POST /api/v1/uploads` | Upload file to R2 |
| `GET /health` | Basic health check |
| `GET /health/ready` | Readiness probe (checks DB, payments, storage) |

## Railway Deployment

### Prerequisites

1. Railway CLI installed: `npm i -g @railway/cli`
2. Railway account with project created
3. PostgreSQL provisioned in Railway

### Deploy Steps

```bash
# Login to Railway
railway login

# Link to project (from repo root)
railway link

# Set environment variables in Railway dashboard:
# - All required variables from .env.example
# - DATABASE_URL (auto-set by Railway Postgres)

# Deploy
railway up
```

The `railway.json` configuration handles:
- Build command: `pip install -r requirements.txt && alembic upgrade head`
- Start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health` endpoint
- Auto-restart on failure

### Environment Variables in Railway

Set these in the Railway dashboard under your backend service:

**Shared Variables** (reference with `${{shared.VAR_NAME}}`):
- `JWT_SECRET_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `CORS_ORIGINS`

**Auto-configured**:
- `DATABASE_URL` - From Railway Postgres service
- `ENVIRONMENT` - Set to `production`

## Webhook Configuration

### Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend.railway.app/api/v1/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Mercado Pago

1. Go to Mercado Pago Developer Portal → Your Applications
2. Set IPN URL: `https://your-backend.railway.app/api/v1/webhooks/mercado-pago`
3. Enable notifications for: `payment`, `merchant_order`
4. Copy webhook secret to `MERCADO_PAGO_WEBHOOK_SECRET`

## Cloudflare R2 Setup

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with R2 permissions
3. (Optional) Set up custom domain for public access
4. Configure environment variables:
   - `R2_ACCOUNT_ID`: Your Cloudflare account ID
   - `R2_ACCESS_KEY_ID`: API token access key
   - `R2_SECRET_ACCESS_KEY`: API token secret
   - `R2_BUCKET_NAME`: Bucket name
   - `R2_PUBLIC_URL`: Custom domain or R2.dev URL

## Architecture

```
backend/
├── src/
│   ├── domain/              # Business logic (entities, repositories)
│   ├── application/         # Use cases (services)
│   ├── infrastructure/      # External concerns
│   │   ├── auth/            # JWT & password handling
│   │   ├── payment_gateways/ # Stripe & Mercado Pago
│   │   ├── storage/         # R2 storage service
│   │   └── repositories/    # SQLAlchemy implementations
│   ├── api/v1/              # FastAPI routes
│   └── main.py              # Application entry point
├── alembic/                 # Database migrations
├── docs/                    # API documentation
├── tests/                   # Test suite
└── requirements.txt         # Python dependencies
```

## Security Notes

- JWT secrets must be at least 32 characters
- Always use HTTPS in production
- Set explicit CORS origins in production
- Webhook signatures are verified for both payment providers
- File uploads are validated for type and size
- Passwords are hashed with bcrypt (configurable rounds)

## Monitoring

- Health endpoints for load balancer probes
- Structured logging with request IDs
- Error responses include correlation IDs in production
