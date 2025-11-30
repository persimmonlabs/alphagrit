# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js)
```bash
npm run dev          # Start frontend dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check (tsc --noEmit)
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt              # Install dependencies
uvicorn src.main:app --reload --port 8000    # Start backend (http://localhost:8000)
pytest                                        # Run all tests
pytest src/tests/unit                         # Run unit tests only
pytest src/tests/integration                  # Run integration tests only
pytest src/tests/api                          # Run API tests only
pytest -k "test_product"                      # Run tests matching pattern
```

## Architecture Overview

Alpha Grit is a **full-stack e-commerce platform** with a Next.js frontend and FastAPI backend.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod)
- **Database**: Railway PostgreSQL
- **Payments**: Stripe (Mercado Pago prepared but disabled)
- **Emails**: Resend + React Email

---

## Frontend Architecture

### Routing Structure

The app uses **locale-based routing** with middleware redirect:
- All public routes are under `/app/[lang]/` (e.g., `/en/products`, `/pt/cart`)
- Admin routes are at `/app/admin/` (not localized)
- API routes are at `/app/api/`

The middleware (`middleware.ts`) automatically redirects requests without a locale prefix to the user's preferred language (English or Portuguese).

### Key Directories

```
/app
  /[lang]              # Localized public routes (en, pt)
    /products          # Product catalog and detail pages
    /cart, /checkout   # Shopping flow
    /dashboard         # User account area
    /blog              # Blog listing and posts
  /admin               # Admin panel (products, blog, settings)
  /api                 # API routes (webhooks, submissions)

/components
  /ui                  # shadcn/ui components
  /organisms           # Complex components (Hero, Footer, Navigation)
  /templates           # Page templates (ProductCatalog, Checkout, etc.)

/lib
  /api-client.ts       # API client for FastAPI backend
  /api-client-server.ts # Server-side API client
  /dictionary.ts       # i18n dictionary loader

/content
  /en.ts, /pt.ts       # Translation files
```

### Frontend Data Patterns

**API Client:**
- `lib/api-client.ts` - Wraps fetch, connects to FastAPI backend at `localhost:8000/api/v1`, falls back to mock data for unimplemented endpoints

**Path Aliases:** Use `@/*` to import from project root

---

## Backend Architecture (Clean Architecture / DDD)

The backend follows **Clean Architecture** with clear separation of concerns:

```
/backend
  /src
    /domain            # Business logic (no framework dependencies)
      /entities        # Domain models (dataclasses with validation)
      /repositories    # Abstract repository interfaces
      /services        # Domain services (payment gateway interfaces)

    /application       # Use cases / application services
      /services        # ProductManagementService, OrderManagementService, etc.

    /infrastructure    # External concerns
      /repositories    # SQLAlchemy implementations
      /payment_gateways # Mock Stripe/MercadoPago gateways
      /database.py     # SQLAlchemy engine/session setup

    /api               # FastAPI layer
      /v1
        /endpoints     # Route handlers (products, orders, users, etc.)
        /schemas.py    # Pydantic request/response models
        /dependencies.py # Dependency injection setup

    /tests
      /unit            # Domain and application layer tests
      /integration     # Repository tests with DB
      /api             # API endpoint tests
```

### Key Domain Entities
- `Product`, `Category` - E-book catalog
- `Order`, `Cart`, `DownloadLink` - Purchase flow
- `User`, `Profile` - Customer accounts
- `Review`, `Refund` - Feedback and returns
- `BlogPost`, `Faq`, `SiteConfig` - Content management

### Dependency Injection
All dependencies are wired in `api/v1/dependencies.py`:
- Repository deps: `get_product_repo()`, `get_order_repo()`, etc.
- Service deps: `get_product_management_service()`, `get_order_management_service()`, etc.
- Services receive abstract repositories, implementations are injected at runtime

### API Endpoints
Base URL: `/api/v1`
- `/products` - Product CRUD
- `/orders` - Order management
- `/users` - User profiles
- `/content` - Blog, FAQ, site config
- `/reviews` - Product reviews
- `/refunds` - Refund requests
- `/auth` - Authentication (stub)
- `/admin` - Admin dashboard (stub)
- `/uploads` - File uploads (stub)

### Testing Pattern
Tests use in-memory repositories for unit tests and SQLite for integration tests. Pytest fixtures handle DB setup/teardown.

---

## Database

### Railway PostgreSQL
- Connection via `DATABASE_URL` environment variable
- Schema defined in `/database/schema.sql`
- Run migrations: `psql $DATABASE_URL < database/schema.sql`

### Key Tables
- `profiles`, `products`, `categories`, `orders`, `order_items`
- `download_links`, `cart_items`, `reviews`, `refund_requests`
- `blog_posts`, `faqs`, `site_config`, `feature_flags`, `email_logs`

---

## Design System

- Primary: Orange (#f97316)
- Accent: Red (#ef4444)
- Dark mode enabled by default
- CSS variables for theming (see `tailwind.config.ts`)
