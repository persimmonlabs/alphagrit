# Alpha Grit - E-commerce Platform for Digital Products

A production-ready Next.js 14 e-commerce platform for selling e-books, built with modern web technologies.

## 🚀 Tech Stack

- **Frontend**: Next.js 14.2+ (App Router, TypeScript, Server Actions)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Payments**: Stripe (primary), Mercado Pago (prepared, disabled)
- **Emails**: Resend + React Email
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel-ready

## 📦 What's Been Built

### ✅ Core Infrastructure
- [x] Next.js 14 project setup with TypeScript
- [x] Tailwind CSS with Alpha Grit design system (orange/red/black palette)
- [x] Complete database schema with migrations
- [x] Supabase client utilities (client-side, server-side, middleware)
- [x] Authentication system (sign in, sign up, Google OAuth, middleware protection)
- [x] Basic store layout with header and footer
- [x] Account dashboard page
- [x] Responsive design foundation

### 📊 Database Schema (Complete)
All tables created with proper indexes, RLS policies, and relationships:
- `profiles` - User profiles extending Supabase auth
- `products` - Unified product catalog (e-books, physical, subscriptions)
- `orders` - Customer orders with payment tracking
- `order_items` - Line items for each order
- `download_links` - Secure, expiring download links (7 days, 5 downloads max)
- `reviews` - Product reviews (admin-managed)
- `blog_posts` - Blog content management
- `faqs` - Frequently asked questions
- `site_config` - Dynamic site configuration (key-value store)
- `feature_flags` - Feature toggles
- `cart_items` - Shopping cart for logged-in users
- `page_views` - Simple analytics tracking

### 🔒 Security Features
- Row Level Security (RLS) policies on all tables
- Admin role-based access control
- Secure download links with expiry and download limits
- IP address tracking for downloads
- Protected routes with middleware

### 🎨 Design System
- Custom color palette (primary orange #f97316, accent red #ef4444)
- Dark/light mode ready (theme provider configured)
- Consistent spacing, typography, and component styling
- Mobile-first responsive design

## 🚧 What Needs to Be Built

### Critical Features
- [ ] **Admin Panel**
  - [ ] Products CRUD (create, edit, delete with file uploads)
  - [ ] Orders management (list, detail, refunds)
  - [ ] Customers management
  - [ ] Blog CMS
  - [ ] Site settings editor
  - [ ] FAQ management
  - [ ] Reviews management
  - [ ] Dashboard with metrics

- [ ] **Store Frontend**
  - [ ] Dynamic product listing with Supabase data
  - [ ] Product detail pages
  - [ ] Shopping cart with state management
  - [ ] Checkout flow with currency selection (BRL/USD)
  - [ ] FAQ accordion section
  - [ ] Reviews carousel

- [ ] **Payment Integration**
  - [ ] Stripe product/price auto-creation
  - [ ] Stripe Checkout Session flow
  - [ ] Stripe webhook handler for order fulfillment
  - [ ] Refund processing (auto-approve < 7 days, manual > 7 days)

- [ ] **Email System**
  - [ ] Purchase confirmation email
  - [ ] Download link email
  - [ ] Refund processed email
  - [ ] Welcome email
  - [ ] Email templates with React Email

- [ ] **Download System**
  - [ ] Secure download endpoint with signed URLs
  - [ ] Download count tracking and limits
  - [ ] Expiry enforcement
  - [ ] User downloads dashboard

- [ ] **User Account**
  - [ ] Order history page
  - [ ] E-books library with download buttons
  - [ ] Account settings (profile, password, delete account)

- [ ] **Blog System**
  - [ ] Public blog listing
  - [ ] Blog post detail pages
  - [ ] Rich text rendering
  - [ ] SEO optimization

- [ ] **Additional Features**
  - [ ] Internationalization (PT/EN)
  - [ ] PWA setup (manifest, service worker)
  - [ ] Legal pages (Terms, Privacy, Refund)
  - [ ] SEO (meta tags, Open Graph, JSON-LD, sitemap)
  - [ ] Rate limiting
  - [ ] Loading states and error boundaries
  - [ ] Analytics integration

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd alphagrit
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the following required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   RESEND_API_KEY=re_...

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Supabase database**
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/20240101000000_initial_schema.sql`
   - Create storage buckets:
     - `products` (private) - for PDF files
     - `site-assets` (public) - for images

4. **Configure Supabase Auth**
   - Enable Email provider
   - Enable Google OAuth provider
   - Set site URL to `http://localhost:3000` (development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - Your production URL + `/auth/callback`

5. **Create first admin user**
   - Sign up through the app at `/auth/signup`
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user and change `role` from `customer` to `admin`

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
/app
  /(store)              # Public store routes
    /store/page.tsx     # Store homepage
    layout.tsx          # Store layout with header/footer
  /account              # User account area
    /page.tsx           # Account dashboard
  /auth                 # Authentication
    /signin/page.tsx    # Sign in page
    /signup/page.tsx    # Sign up page
    /callback/route.ts  # OAuth callback
  /admin                # Admin panel (to be built)
  /blog                 # Blog (to be built)
  /legal                # Legal pages (to be built)

/components
  /ui                   # shadcn/ui components
  /store                # Store-specific components
  /providers            # Context providers

/lib
  /actions              # Server Actions
  /supabase             # Supabase clients
  /constants.ts         # App constants
  /utils.ts             # Utility functions
  /design-tokens.ts     # Design system tokens

/config
  /site.ts              # Site configuration
  /navigation.ts        # Navigation structure
  /features.ts          # Feature flags

/types
  /index.ts             # Shared TypeScript types
  /supabase.ts          # Database types

/supabase
  /migrations           # Database migrations
```

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316) - main brand color
- **Accent**: Red (#ef4444) - secondary actions
- **Neutral**: Black to white scale for text and backgrounds

### Brand Identity
- **Name**: ALPHA GRIT
- **Tagline**: "Transform your life through discipline, strength, and relentless action"
- **Style**: Masculine, bold, motivational (David Goggins energy but friendly)
- **Typography**: Strong, modern sans-serif

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy

2. **Configure Supabase for production**
   - Update site URL in Supabase settings
   - Add production callback URL
   - Update RLS policies if needed

3. **Configure Stripe webhooks**
   - Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`
   - Copy webhook secret to environment variables

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `MERCADO_PAGO_ACCESS_TOKEN` | Mercado Pago token (optional) | No |
| `MERCADO_PAGO_PUBLIC_KEY` | Mercado Pago public key (optional) | No |

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 📚 Key Technologies Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Email](https://react.email)
- [Resend](https://resend.com/docs)

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📞 Support

- **WhatsApp**: +1 (956) 308-2357
- **Email**: support@alphagrit.com

## ⚖️ License

Proprietary - All rights reserved

---

**Built with discipline. Deployed with purpose. Transform with action.**
