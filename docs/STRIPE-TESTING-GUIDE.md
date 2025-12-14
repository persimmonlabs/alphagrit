# Stripe Integration & Testing Guide

This guide walks you through setting up Stripe test mode, testing subscriptions, and going live.

## SUBSCRIPTION-ONLY MODEL

AlphaGrit now operates on a **subscription-only model**:
- Blog posts: Free for everyone
- Ebooks: Subscribers only (non-subscribers see Chapter 1 as free preview)
- Monthly plan: **$15/month**
- Yearly plan: **$120/year** ($10/month)
- No individual ebook purchases

## 1. Stripe Dashboard Setup (Test Mode)

### Switch to Test Mode
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle "Test mode" switch in the top-right corner (should show orange "TEST" badge)

### Create Test Products

You need 2 subscription products:

**Monthly Subscription:**
1. Products → Add Product
2. Name: "Monthly All-Access"
3. Add two prices:
   - USD: $15.00/month (recurring)
   - BRL: R$75.00/month (recurring)

**Yearly Subscription:**
1. Products → Add Product
2. Name: "Yearly All-Access"
3. Add two prices:
   - USD: $120.00/year (recurring)
   - BRL: R$600.00/year (recurring)

### Get Your Keys
1. Developers → API Keys
2. Copy "Publishable key" (starts with `pk_test_`)
3. Copy "Secret key" (starts with `sk_test_`)

---

## 2. Environment Variables

Create `.env.local` in the `alphagrit/` directory:

```env
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe TEST Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Subscription prices (from products you created)
STRIPE_MONTHLY_PRICE_USD=price_YOUR_USD_MONTHLY_PRICE  # $15/month
STRIPE_MONTHLY_PRICE_BRL=price_YOUR_BRL_MONTHLY_PRICE  # R$75/month
STRIPE_YEARLY_PRICE_USD=price_YOUR_USD_YEARLY_PRICE    # $120/year
STRIPE_YEARLY_PRICE_BRL=price_YOUR_BRL_YEARLY_PRICE    # R$600/year
```

Replace `YOUR_*` values with actual IDs from your Stripe Dashboard.

---

## 3. Local Webhook Testing with Stripe CLI

The Stripe CLI forwards webhook events from Stripe to your local dev server.

### Install Stripe CLI

**Windows (with Scoop):**
```bash
scoop install stripe
```

**Windows (direct download):**
Download from: https://github.com/stripe/stripe-cli/releases

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

### Login to Stripe
```bash
stripe login
```
This opens a browser to authenticate.

### Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copy that `whsec_` value to your `.env.local` as `STRIPE_WEBHOOK_SECRET`**

Keep this terminal open while testing.

---

## 4. Test Checkout Flow

### Start the Dev Server
In a new terminal:
```bash
cd alphagrit
npm run dev
```

### Test Subscription

1. Go to http://localhost:3000/en/ebooks
2. Click on any ebook
3. Click "Subscribe to Read" button (or go to pricing section)
4. Choose Monthly ($15) or Yearly ($120) plan
5. On checkout, use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - Name/Address: Any values
6. Complete subscription

**Verify:**
- Check Stripe CLI terminal - should show `checkout.session.completed` event
- Check Supabase `subscriptions` table - should have new row with `status: active`
- All ebooks should now be accessible (all chapters unlocked)
- Chapter 1 should be accessible even without subscription (free preview)

### Test Free Preview (Chapter 1)

1. Open any ebook WITHOUT being subscribed
2. Verify Chapter 1 is readable
3. Verify other chapters show "Subscribe to Read" message

---

## 5. Test Card Numbers

| Scenario | Card Number | Use Case |
|----------|-------------|----------|
| **Success** | 4242 4242 4242 4242 | Normal successful payment |
| **Decline** | 4000 0000 0000 0002 | Test declined payment handling |
| **Requires Auth** | 4000 0025 0000 3155 | Test 3D Secure flow |
| **Insufficient Funds** | 4000 0000 0000 9995 | Test specific decline reason |

Always use:
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC (e.g., 123)
- Any billing address

---

## 6. Troubleshooting

### "Webhook not receiving events"
- Make sure `stripe listen` is running in terminal
- Check the forwarding URL matches your dev server port
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local` matches CLI output

### "400 Error on checkout"
- Verify all subscription price IDs in `.env.local` match Stripe Dashboard
- Check that products are set up as recurring (not one-time)

### "Access not granted after subscription"
- Check webhook secret matches
- Look at server logs for webhook errors
- Verify Supabase RLS policies allow inserts
- Check `subscriptions` table has `status: 'active'`

### "Chapter 1 not showing as free"
- Verify chapter has `chapter_number = 1` in database
- Check `canAccessChapter()` function in access-control.ts

---

## 7. Going Live Checklist

When ready for production:

### 1. Switch Stripe to Live Mode
- Toggle off "Test mode" in Stripe Dashboard
- Create LIVE versions of your products/prices

### 2. Update Environment Variables
Replace ALL test values with live values:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Live subscription price IDs
STRIPE_MONTHLY_PRICE_USD=price_YOUR_LIVE_MONTHLY_USD  # $15/month
STRIPE_MONTHLY_PRICE_BRL=price_YOUR_LIVE_MONTHLY_BRL  # R$75/month
STRIPE_YEARLY_PRICE_USD=price_YOUR_LIVE_YEARLY_USD    # $120/year
STRIPE_YEARLY_PRICE_BRL=price_YOUR_LIVE_YEARLY_BRL    # R$600/year
```

### 3. Register Production Webhook
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your production env

### 4. Test with Real Payment
Make a small real purchase to verify everything works:
- Create a $1 test product
- Do a real purchase with your own card
- Refund it after verifying

---

## Quick Reference

**Stripe Dashboard:** https://dashboard.stripe.com

**Test Card:** 4242 4242 4242 4242

**Webhook Events Used:**
- `checkout.session.completed` → Records subscriptions
- `customer.subscription.updated` → Updates subscription status
- `customer.subscription.deleted` → Cancels subscription
- `invoice.payment_failed` → Marks subscription as past_due

**Subscription Pricing:**
- Monthly: $15/month (or R$75/month)
- Yearly: $120/year (or R$600/year) - $10/month equivalent

**Access Model:**
- All ebooks require active subscription
- Chapter 1 always free as preview
- No individual ebook purchases

**Local Testing Command:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
