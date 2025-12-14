# Alpha Grit - Subscription-Based E-book Platform

A production-ready Next.js 14 subscription platform for e-books, built with modern web technologies.

## Business Model

- **Blog posts**: Free for everyone
- **E-books**: Subscription-only (Chapter 1 always free preview)
- **Monthly**: $15/month
- **Yearly**: $120/year ($10/month)

## Tech Stack

- **Frontend**: Next.js 14.2+ (App Router, TypeScript, Server Actions)
- **Backend**: FastAPI (Python, Clean Architecture)
- **Database**: Railway PostgreSQL
- **Payments**: Stripe (primary), Mercado Pago (prepared, disabled)
- **Emails**: Resend + React Email
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (frontend) + Railway (backend/database)

## What's Been Built

### Core Infrastructure
- [x] Next.js 14 project setup with TypeScript
- [x] FastAPI backend with Clean Architecture (DDD)
- [x] Tailwind CSS with Alpha Grit design system (orange/red/black palette)
- [x] Complete database schema with migrations
- [x] Authentication system (sign in, sign up, middleware protection)
- [x] Basic store layout with header and footer
- [x] Account dashboard page
- [x] Responsive design foundation
- [x] Internationalization (EN/PT)

### Database Schema (Complete)
All tables created with proper indexes and relationships:
- `profiles` - User profiles
- `ebooks` - E-book catalog
- `chapters` - E-book chapters with content
- `subscriptions` - User subscriptions (active/cancelled/expired)
- `blog_posts` - Blog content management
- `purchases` - Legacy table (deprecated - kept for backwards compatibility)

### Security Features
- Row Level Security (RLS) policies on all tables
- Admin role-based access control
- Secure download links with expiry and download limits
- IP address tracking for downloads
- Protected routes with middleware

### Design System
- Custom color palette (primary orange #f97316, accent red #ef4444)
- Dark/light mode ready (theme provider configured)
- Consistent spacing, typography, and component styling
- Mobile-first responsive design

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Railway account (for PostgreSQL)
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone and install frontend dependencies**
   ```bash
   git clone <repository-url>
   cd alphagrit
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the following required variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   RESEND_API_KEY=re_...

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Set up Railway PostgreSQL**
   - Create a new project on Railway
   - Add PostgreSQL service
   - Copy the connection string to `DATABASE_URL`
   - Run the schema: `psql $DATABASE_URL < database/schema.sql`

5. **Create first admin user**
   - Sign up through the app
   - Connect to database and update role:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
     ```

6. **Run development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd backend
   uvicorn src.main:app --reload --port 8000
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
/app
  /(store)              # Public store routes
  /[lang]               # Localized routes (en, pt)
  /account              # User account area
  /admin                # Admin panel
  /api                  # API routes (webhooks)

/backend
  /src
    /domain             # Business logic (entities, repositories)
    /application        # Use cases / services
    /infrastructure     # SQLAlchemy, payment gateways
    /api                # FastAPI endpoints

/components
  /ui                   # shadcn/ui components
  /organisms            # Complex components
  /templates            # Page templates

/lib
  /api-client.ts        # API client for FastAPI backend
  /utils.ts             # Utility functions

/database
  /schema.sql           # PostgreSQL schema
```

## Design System

### Colors
- **Primary**: Orange (#f97316) - main brand color
- **Accent**: Red (#ef4444) - secondary actions
- **Neutral**: Black to white scale for text and backgrounds

### Brand Identity
- **Name**: ALPHA GRIT
- **Tagline**: "Transform your life through discipline, strength, and relentless action"
- **Style**: Masculine, bold, motivational
- **Typography**: Strong, modern sans-serif

## Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Backend
cd backend
uvicorn src.main:app --reload --port 8000    # Start dev server
pytest                                        # Run all tests
pytest src/tests/unit                         # Unit tests only
pytest -k "test_product"                      # Run specific tests
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Railway PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes |
| `MERCADO_PAGO_ACCESS_TOKEN` | Mercado Pago token (optional) | No |
| `MERCADO_PAGO_PUBLIC_KEY` | Mercado Pago public key (optional) | No |

## Deployment

### Vercel (Frontend)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy

### Railway (Backend + Database)
1. Create PostgreSQL service
2. Create Python service for backend
3. Set environment variables
4. Configure Stripe webhooks: `https://your-domain.com/api/webhooks/stripe`

## Support

- **WhatsApp**: +1 (956) 308-2357
- **Email**: support@alphagrit.com

## License

Proprietary - All rights reserved

---

**Built with discipline. Deployed with purpose. Transform with action.**
