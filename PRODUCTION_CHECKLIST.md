# AlphaGrit Production MVP Checklist

## Current Status: Stripe Test Mode -> Production Ready

---

## 1. STRIPE CONFIGURATION (CRITICAL)

### 1.1 Create Production Products in Stripe Dashboard
Go to: https://dashboard.stripe.com/products

Create TWO products:
1. **Monthly Subscription** - $15/month (R$75/mês)
2. **Yearly Subscription** - $120/year (R$600/ano)

For each product, create prices in BOTH currencies:
- USD price
- BRL price

### 1.2 Required Environment Variables in Vercel

```bash
# Stripe Keys (PRODUCTION - no sk_test_ or pk_test_)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from Step 1.1)
STRIPE_MONTHLY_PRICE_USD=price_...   # $15/month USD
STRIPE_MONTHLY_PRICE_BRL=price_...   # R$75/mês BRL
STRIPE_YEARLY_PRICE_USD=price_...    # $120/year USD
STRIPE_YEARLY_PRICE_BRL=price_...    # R$600/ano BRL
```

### 1.3 Configure Stripe Webhook
Go to: https://dashboard.stripe.com/webhooks

1. Click "Add endpoint"
2. Endpoint URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the signing secret (`whsec_...`) to Vercel env vars

### 1.4 Configure Customer Portal
Go to: https://dashboard.stripe.com/settings/billing/portal

Enable:
- [ ] Customers can update payment methods
- [ ] Customers can update subscriptions
- [ ] Customers can cancel subscriptions
- [ ] Customers can view invoice history

---

## 2. SUPABASE CONFIGURATION

### 2.1 Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://htmwcrxelguceuuifxkh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2.2 Database Status
- [x] Tables created: profiles, subscriptions, purchases, ebooks, chapters, blog_posts
- [x] RLS enabled on all tables
- [x] Policies configured for user access
- [x] Service role policies for webhooks
- [x] Ebooks seeded: 10 ebooks, 74 chapters

### 2.3 Storage Buckets
- [x] ebook-covers bucket (public read)
- [x] blog-images bucket (public read)

---

## 3. VERCEL CONFIGURATION

### 3.1 All Required Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://htmwcrxelguceuuifxkh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_USD=price_...
STRIPE_MONTHLY_PRICE_BRL=price_...
STRIPE_YEARLY_PRICE_USD=price_...
STRIPE_YEARLY_PRICE_BRL=price_...
```

### 3.2 Deployment Checklist
- [ ] All env vars set in Vercel dashboard
- [ ] Domain configured and SSL active
- [ ] Webhook endpoint accessible

---

## 4. TESTING CHECKLIST

### 4.1 Anonymous User Flow
- [ ] Can view ebooks catalog
- [ ] Can see subscription CTA
- [ ] Clicking "Subscribe Now" redirects to login
- [ ] Can read Chapter 1 (free preview) of any ebook

### 4.2 Authenticated User (No Subscription)
- [ ] Can login/signup
- [ ] Can view ebooks catalog
- [ ] Can select monthly/yearly plan
- [ ] Checkout redirects to Stripe
- [ ] Successful payment records subscription
- [ ] Redirected to /account?success=subscription

### 4.3 Subscribed User
- [ ] Can access all chapters
- [ ] Shows "You have full access" badge
- [ ] Can manage subscription via Stripe portal
- [ ] Can view account page with subscription details

### 4.4 Webhook Processing
- [ ] Subscription created after checkout
- [ ] Subscription status updates work
- [ ] Subscription cancellation works
- [ ] Payment failure marks past_due

---

## 5. CRITICAL FIXES APPLIED

### 5.1 Icon 404 Fixed
- Updated middleware.ts matcher to exclude `icon.*\.svg`

### 5.2 Image Domains
- Added `*.supabase.co` to next.config.js remote patterns

---

## 6. LAUNCH STEPS

### Step 1: Stripe Production Setup
1. Switch Stripe account to live mode
2. Create products and prices (see 1.1)
3. Configure webhook (see 1.3)
4. Configure customer portal (see 1.4)

### Step 2: Update Vercel Environment
1. Replace all `sk_test_` with `sk_live_`
2. Replace all `pk_test_` with `pk_live_`
3. Add new production price IDs
4. Add production webhook secret
5. Trigger redeploy

### Step 3: Test Production Flow
1. Create test user account
2. Complete subscription checkout
3. Verify database entry in Supabase
4. Verify access to paid chapters
5. Test subscription portal

### Step 4: Monitor
- Check Vercel logs for errors
- Check Stripe webhook logs
- Monitor Supabase logs

---

## 7. POST-LAUNCH

### 7.1 Monitoring
- [ ] Set up Vercel log monitoring
- [ ] Set up Stripe webhook monitoring
- [ ] Set up Supabase usage alerts

### 7.2 Optional Enhancements
- [ ] Add email notifications (Resend)
- [ ] Add analytics (Google Analytics)
- [ ] Add error tracking (Sentry)

---

## Quick Reference

| Service | Dashboard URL |
|---------|---------------|
| Vercel | https://vercel.com/dashboard |
| Stripe | https://dashboard.stripe.com |
| Supabase | https://supabase.com/dashboard/project/htmwcrxelguceuuifxkh |

| API Endpoint | Purpose |
|--------------|---------|
| POST /api/checkout | Create subscription checkout |
| POST /api/webhooks/stripe | Handle Stripe events |
| POST /api/subscription/portal | Open billing portal |

---

## Pricing Reference

| Plan | USD | BRL |
|------|-----|-----|
| Monthly | $15/month | R$75/mês |
| Yearly | $120/year ($10/mo) | R$600/ano (R$50/mês) |
