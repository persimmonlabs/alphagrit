-- Alpha Grit Database Schema
-- Complete migration for all tables, indexes, RLS policies, functions, and seed data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table (unified for all product types)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price_brl DECIMAL(10,2) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'ebook', -- 'ebook' | 'physical' | 'consultation' | 'subscription'
  category TEXT,
  cover_image_url TEXT,
  file_url TEXT, -- For downloadable products (PDF)
  file_size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'archived'
  stripe_product_id TEXT,
  stripe_price_id_brl TEXT,
  stripe_price_id_usd TEXT,
  metadata JSONB DEFAULT '{}', -- Flexible storage for type-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  order_number TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL, -- For guest checkouts
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'refunded' | 'failed'
  currency TEXT NOT NULL, -- 'BRL' | 'USD'
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_provider TEXT, -- 'stripe' | 'mercadopago'
  payment_intent_id TEXT,
  payment_status TEXT,
  refund_status TEXT, -- NULL | 'requested' | 'approved' | 'processed'
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download links table (temporary, expiring links)
CREATE TABLE public.download_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  user_id UUID REFERENCES public.profiles(id),
  signed_url TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_addresses TEXT[] DEFAULT '{}', -- Track IPs for security
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table (admin adds manually for MVP)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_title TEXT, -- e.g., "Entrepreneur", "Athlete"
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- 'active' | 'hidden'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Rich text JSON or Markdown
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'hidden'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site configuration table (key-value store)
CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics/Metrics table (simple tracking)
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_id UUID REFERENCES public.profiles(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart table (for logged-in users)
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_download_links_user_id ON public.download_links(user_id);
CREATE INDEX idx_download_links_order_id ON public.download_links(order_id);
CREATE INDEX idx_download_links_expires_at ON public.download_links(expires_at);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_featured ON public.reviews(featured) WHERE featured = TRUE;
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at) WHERE status = 'published';
CREATE INDEX idx_faqs_order_index ON public.faqs(order_index);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies (public read active, admin write)
CREATE POLICY "Active products viewable by everyone" ON public.products
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders policies (users see own, admins see all)
CREATE POLICY "Users see own orders" ON public.orders
  FOR SELECT USING (
    user_id = auth.uid() OR
    (user_id IS NULL AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order items policies
CREATE POLICY "Users see own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
      AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "System can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Download links policies
CREATE POLICY "Users see own download links" ON public.download_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert download links" ON public.download_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own download links" ON public.download_links
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can see all download links" ON public.download_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reviews policies (public read active, admin write)
CREATE POLICY "Active reviews viewable by everyone" ON public.reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Blog policies (public read published, admin write)
CREATE POLICY "Published posts viewable by everyone" ON public.blog_posts
  FOR SELECT USING (
    status = 'published' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- FAQ policies (public read active)
CREATE POLICY "Active FAQs viewable by everyone" ON public.faqs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins manage FAQs" ON public.faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Site config policies (public read, admin write)
CREATE POLICY "Site config viewable by everyone" ON public.site_config
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site config" ON public.site_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Feature flags (public read, admin write)
CREATE POLICY "Feature flags viewable by everyone" ON public.feature_flags
  FOR SELECT USING (true);

CREATE POLICY "Admins manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cart policies
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL USING (user_id = auth.uid());

-- Page views policies (anyone can insert, only admins can read)
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create download link after purchase
CREATE OR REPLACE FUNCTION create_download_link(
  p_order_id UUID,
  p_product_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
  v_file_url TEXT;
BEGIN
  -- Get product file URL
  SELECT file_url INTO v_file_url FROM public.products WHERE id = p_product_id;

  IF v_file_url IS NULL THEN
    RAISE EXCEPTION 'Product has no downloadable file';
  END IF;

  -- Create download link (7 days, 5 downloads)
  INSERT INTO public.download_links (
    order_id,
    product_id,
    user_id,
    signed_url,
    download_limit,
    expires_at
  ) VALUES (
    p_order_id,
    p_product_id,
    p_user_id,
    v_file_url, -- Will be replaced with signed URL in app
    5,
    NOW() + INTERVAL '7 days'
  ) RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed initial site config
INSERT INTO public.site_config (key, value, description) VALUES
  ('site_name', '"Alpha Grit"', 'Site name'),
  ('site_description', '"Transform your life through discipline, strength, and relentless action."', 'Site description'),
  ('primary_color', '"#f97316"', 'Primary brand color (orange)'),
  ('secondary_color', '"#ef4444"', 'Secondary brand color (red)'),
  ('logo_url', '""', 'Logo image URL'),
  ('hero_title', '"Dominate Every Area of Your Life"', 'Homepage hero title'),
  ('hero_subtitle', '"Science-based transformation system for modern men. Not temporary motivation—total reconstruction."', 'Homepage hero subtitle'),
  ('contact_whatsapp', '"+1 (956) 308-2357"', 'WhatsApp contact'),
  ('social_instagram', '""', 'Instagram URL (empty for now)'),
  ('social_twitter', '""', 'Twitter/X URL (empty for now)'),
  ('legal_terms_updated', 'to_jsonb(NOW())', 'Terms last updated'),
  ('legal_privacy_updated', 'to_jsonb(NOW())', 'Privacy policy last updated');

-- Seed feature flags
INSERT INTO public.feature_flags (name, enabled, description) VALUES
  ('mercadopago_enabled', FALSE, 'Enable Mercado Pago payment option'),
  ('affiliates_enabled', FALSE, 'Enable affiliate program (prepared but not active)'),
  ('subscriptions_enabled', FALSE, 'Enable subscription products'),
  ('blog_enabled', TRUE, 'Enable blog section'),
  ('reviews_enabled', TRUE, 'Show product reviews'),
  ('newsletter_enabled', FALSE, 'Enable newsletter signup'),
  ('dark_mode_enabled', TRUE, 'Enable dark/light mode toggle'),
  ('pwa_enabled', TRUE, 'Enable PWA features');

-- Seed initial FAQs
INSERT INTO public.faqs (question, answer, category, order_index) VALUES
  ('How long until I see results?', 'Most people see significant changes in 4-6 weeks with consistency. Full transformations typically happen in 12-16 weeks. It depends on your commitment to applying what you learn.', 'General', 1),
  ('Is there a money-back guarantee?', 'Yes! 30-day guarantee. If you''re not satisfied, we refund 100% of your money within 7 days of purchase, no questions asked.', 'Payment', 2),
  ('How do I access my e-book after purchase?', 'Immediately after payment, you''ll receive an email with a download link. You can also access all your purchases in your account dashboard. Links are valid for 7 days and can be downloaded up to 5 times.', 'Downloads', 3),
  ('What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, Amex) through Stripe. Payments are processed securely and we never store your card information.', 'Payment', 4);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.products IS 'Products catalog (unified for all types)';
COMMENT ON TABLE public.orders IS 'Customer orders';
COMMENT ON TABLE public.order_items IS 'Items in each order';
COMMENT ON TABLE public.download_links IS 'Temporary download links with expiry and limits';
COMMENT ON TABLE public.reviews IS 'Product reviews (admin-managed for MVP)';
COMMENT ON TABLE public.blog_posts IS 'Blog posts';
COMMENT ON TABLE public.faqs IS 'Frequently asked questions';
COMMENT ON TABLE public.site_config IS 'Site configuration (key-value store)';
COMMENT ON TABLE public.feature_flags IS 'Feature flags for enabling/disabling features';
COMMENT ON TABLE public.cart_items IS 'Shopping cart items for logged-in users';
COMMENT ON TABLE public.page_views IS 'Simple page view analytics';
