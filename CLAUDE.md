# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check (tsc --noEmit)
npm test             # Run tests
```

## Architecture Overview

Alpha Grit is a **subscription-based e-book platform** built with Next.js and deployed on Vercel.

### Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (subscription-only)
- **Hosting**: Vercel
- **Emails**: Resend + React Email

### Business Model
- **Blog posts**: Free for everyone
- **E-books**: Subscription-only (Chapter 1 always free preview)
- **Monthly**: $15/month
- **Yearly**: $120/year ($10/month)

---

## Project Structure

```
/app
  /[lang]              # Localized public routes (en, pt)
    /ebooks            # E-book catalog and reader
    /blog              # Blog listing and posts
    /dashboard         # User account and subscription management
    /auth              # Login, signup, password reset
  /admin               # Admin panel (ebooks, blog management)
  /api                 # API routes
    /checkout          # Stripe subscription checkout
    /webhooks/stripe   # Stripe webhook handler
    /subscription      # Subscription portal

/components
  /ui                  # shadcn/ui components
  /organisms           # Complex components (Hero, Footer, Navigation)
  /ebook               # E-book reader components (BuyButton, BlockRenderer)
  /admin               # Admin components (TipTapEditor)

/lib
  /supabase            # Supabase clients and queries
    /client.ts         # Browser client
    /server.ts         # Server client with auth helpers
    /ebooks.ts         # E-book CRUD operations
    /blog.ts           # Blog CRUD operations
  /stripe              # Stripe client and subscription configs
  /ebook               # Access control logic

/database              # SQL schema files for Supabase
```

---

## Data Layer

### Supabase (Primary)
- **Auth**: User authentication via Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: File uploads (ebook covers, blog images)

Key tables: `profiles`, `ebooks`, `chapters`, `subscriptions`, `blog_posts`

Note: `purchases` table exists for legacy compatibility but is no longer used for access control.

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/checkout` | Creates Stripe subscription checkout sessions |
| `/api/webhooks/stripe` | Handles Stripe subscription events |
| `/api/subscription/portal` | Creates Stripe customer portal sessions |

---

## Authentication & Authorization

- **User Auth**: Supabase Auth (email/password)
- **Admin Auth**: Role-based via `profiles.role = 'admin'`
- **Middleware**: `/lib/supabase/middleware.ts` protects admin routes
- **E-book Access**: Checked via active subscription only

---

## Payments (Stripe)

- Subscription checkout sessions created in `/api/checkout`
- Webhooks handle `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Subscriptions tracked in `subscriptions` table
- No individual e-book purchases - subscription-only access

---

## Internationalization

- Locale-based routing: `/en/*`, `/pt/*`
- Middleware redirects to user's preferred language
- Translations in `/content/en.ts`, `/content/pt.ts`

---

## Design System

- Primary: Orange (#f97316)
- Accent: Red (#ef4444)
- Dark mode enabled by default
- CSS variables for theming (see `tailwind.config.ts`)
