-- =====================================================
-- ALPHA GRIT - SUPABASE DATABASE SCHEMA (SIMPLIFIED)
-- =====================================================
-- Version: 2.0.0
-- Platform: Next.js + Supabase + Sanity CMS + Stripe
--
-- This schema works with:
-- - Supabase Auth (handles user authentication)
-- - Sanity CMS (stores ebook content)
-- - Stripe (handles payments)
-- =====================================================

-- =====================================================
-- TABLE: profiles
-- User profile information (linked to Supabase Auth)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'pt')),
    preferred_currency TEXT DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'BRL')),
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can do anything" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TABLE: subscriptions
-- User subscriptions (for all-access plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- TABLE: purchases
-- Individual ebook purchases
-- =====================================================

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    sanity_ebook_id TEXT NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount_paid INTEGER NOT NULL, -- in cents
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'BRL')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policies for purchases
CREATE POLICY "Users can view own purchases" ON purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything" ON purchases
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes for faster lookups
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_ebook ON purchases(sanity_ebook_id);
CREATE UNIQUE INDEX idx_purchases_user_ebook ON purchases(user_id, sanity_ebook_id);

-- =====================================================
-- FUNCTION: Auto-create profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION
-- =====================================================

-- Summary:
-- Tables: profiles, subscriptions, purchases (3 tables total)
--
-- Content is managed in Sanity CMS:
-- - Ebooks, chapters, sections, blocks
--
-- Payments are managed by Stripe:
-- - Checkout sessions, webhooks, subscriptions
--
-- To make a user admin:
-- UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
