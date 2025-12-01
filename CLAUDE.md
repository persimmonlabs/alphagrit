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

Alpha Grit is a **full-stack e-commerce platform** for selling e-books, built entirely with Next.js and deployed on Vercel.

### Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **CMS**: Sanity (optional, for blog content)
- **Payments**: Stripe
- **Hosting**: Vercel
- **Emails**: Resend + React Email

---

## Project Structure

```
/app
  /[lang]              # Localized public routes (en, pt)
    /ebooks            # E-book catalog and reader
    /blog              # Blog listing and posts
    /dashboard         # User account, purchases, subscriptions
    /auth              # Login, signup, password reset
  /admin               # Admin panel (ebooks, blog management)
  /api                 # API routes
    /checkout          # Stripe checkout session creation
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
  /sanity              # Sanity CMS client and queries
  /stripe              # Stripe client and price configs
  /ebook               # Access control logic

/database              # SQL schema files for Supabase
```

---

## Data Layer

### Supabase (Primary)
- **Auth**: User authentication via Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: File uploads (ebook covers, blog images)

Key tables: `profiles`, `ebooks`, `chapters`, `purchases`, `subscriptions`, `blog_posts`

### Sanity CMS (Optional)
- Used for some blog content
- Queries in `/lib/sanity/queries.ts`

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/checkout` | Creates Stripe checkout sessions for ebooks/subscriptions |
| `/api/webhooks/stripe` | Handles Stripe events (payment success, subscription updates) |
| `/api/subscription/portal` | Creates Stripe customer portal sessions |

---

## Authentication & Authorization

- **User Auth**: Supabase Auth (email/password)
- **Admin Auth**: Role-based via `profiles.role = 'admin'`
- **Middleware**: `/lib/supabase/middleware.ts` protects admin routes
- **E-book Access**: Checked via purchases table or active subscription

---

## Payments (Stripe)

- Checkout sessions created in `/api/checkout`
- Webhooks handle `checkout.session.completed`, `customer.subscription.*`
- Purchases recorded in `purchases` table
- Subscriptions tracked in `subscriptions` table

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
