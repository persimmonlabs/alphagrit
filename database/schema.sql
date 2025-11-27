-- =====================================================
-- ALPHA GRIT - POSTGRESQL DATABASE SCHEMA
-- =====================================================
-- Version: 1.1.0
-- Platform: Next.js + FastAPI Backend + Railway PostgreSQL
-- Auth: JWT (FastAPI backend)
-- Payments: Stripe + Mercado Pago
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'refunded', 'refund_requested', 'cancelled');
CREATE TYPE payment_method AS ENUM ('stripe', 'mercado_pago');
CREATE TYPE currency_type AS ENUM ('BRL', 'USD');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'denied');

-- =====================================================
-- TABLE: profiles
-- User profile information
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en',
    preferred_currency currency_type DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =====================================================
-- TABLE: categories
-- Product categories
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- =====================================================
-- TABLE: products
-- E-books and digital products
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description_short VARCHAR(500),
    description_full TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Pricing
    price_brl DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,

    -- Stripe integration
    stripe_product_id VARCHAR(255),
    stripe_price_id_brl VARCHAR(255),
    stripe_price_id_usd VARCHAR(255),

    -- Files
    cover_image_url TEXT,
    file_url TEXT NOT NULL, -- Path to PDF/EPUB in storage
    file_size_bytes BIGINT,
    file_format VARCHAR(20) DEFAULT 'pdf',

    -- Metadata
    author VARCHAR(255),
    pages INTEGER,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,

    -- Status
    status product_status DEFAULT 'draft' NOT NULL,
    is_featured BOOLEAN DEFAULT false,

    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Indexes for products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- =====================================================
-- TABLE: cart_items
-- Shopping cart (for logged-in users)
-- =====================================================

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure one product per user in cart
    UNIQUE(user_id, product_id)
);

-- Indexes for cart_items
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- =====================================================
-- TABLE: orders
-- Customer orders
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Customer info (nullable for guest checkout)
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.0,
    total DECIMAL(10, 2) NOT NULL,
    currency currency_type NOT NULL,

    -- Payment
    payment_method payment_method NOT NULL,
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    stripe_session_id VARCHAR(255), -- Stripe checkout session ID
    mercado_pago_id VARCHAR(255), -- Mercado Pago payment ID

    -- Status
    status order_status DEFAULT 'pending' NOT NULL,

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- Indexes for orders
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

-- =====================================================
-- TABLE: order_items
-- Line items for each order
-- =====================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,

    -- Snapshot of product at time of purchase
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL,

    -- File reference (in case product is deleted later)
    file_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for order_items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================================
-- TABLE: download_links
-- Secure download links with expiration
-- =====================================================

CREATE TABLE download_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    -- Security
    token VARCHAR(255) NOT NULL UNIQUE,
    file_url TEXT NOT NULL,

    -- Limits
    max_downloads INTEGER DEFAULT 5 NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    -- Tracking
    last_downloaded_at TIMESTAMPTZ,
    last_ip_address INET,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for download_links
CREATE INDEX idx_download_links_token ON download_links(token);
CREATE INDEX idx_download_links_order ON download_links(order_id);
CREATE INDEX idx_download_links_user ON download_links(user_id);
CREATE INDEX idx_download_links_expires ON download_links(expires_at);
CREATE INDEX idx_download_links_active ON download_links(is_active);

-- =====================================================
-- TABLE: blog_posts
-- Blog content
-- =====================================================

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,

    -- Author
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255),

    -- Media
    cover_image_url TEXT,

    -- Status
    status post_status DEFAULT 'draft' NOT NULL,

    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    -- Stats
    views INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Indexes for blog_posts
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);

-- =====================================================
-- TABLE: faqs
-- Frequently Asked Questions
-- =====================================================

CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for faqs
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_faqs_order ON faqs(display_order);
CREATE INDEX idx_faqs_category ON faqs(category);

-- =====================================================
-- TABLE: reviews
-- Customer reviews (can be for products or testimonials)
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Review content
    title VARCHAR(255),
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Customer info (for testimonials without user account)
    reviewer_name VARCHAR(255),
    reviewer_avatar_url TEXT,

    -- Flags
    is_featured BOOLEAN DEFAULT false,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- =====================================================
-- TABLE: site_config
-- Global site configuration (key-value store)
-- =====================================================

CREATE TABLE site_config (
    key VARCHAR(100) PRIMARY KEY,
    new_value JSONB,
    value_type VARCHAR(50) DEFAULT 'string', -- string, json, number, boolean
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can be exposed to frontend
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Migration step: Populate new_value with existing data, converting to JSONB
UPDATE site_config
SET new_value =
    CASE
        WHEN value_type = 'json' THEN value::jsonb
        WHEN value_type = 'number' AND value ~ '^-?\d+(\.\d+)?$' THEN value::numeric::text::jsonb
        WHEN value_type = 'boolean' AND value IN ('true', 'false') THEN value::boolean::text::jsonb
        ELSE to_jsonb(value)
    END;

-- Step 3: Remove the old TEXT column (done in the previous step by modifying the definition)
-- Step 4: Rename the new JSONB column to 'value'
ALTER TABLE site_config RENAME COLUMN new_value TO value;

-- Pre-populate with default values
INSERT INTO site_config (key, value, value_type, is_public, description) VALUES
('site_name', 'Alpha Grit', 'string', true, 'Site name'),
('site_description', 'Digital products for unstoppable minds', 'string', true, 'Site description'),
('primary_color', '#f97316', 'string', true, 'Primary brand color'),
('secondary_color', '#000000', 'string', true, 'Secondary brand color'),
('hero_title', 'ALPHA GRIT', 'string', true, 'Hero section title'),
('hero_subtitle', 'A escolha é sua. O trabalho começa agora.', 'string', true, 'Hero section subtitle'),
('whatsapp_number', '', 'string', true, 'WhatsApp support number'),
('instagram_url', '', 'string', true, 'Instagram profile URL'),
('twitter_url', '', 'string', true, 'Twitter profile URL'),
('terms_of_service', '', 'string', true, 'Terms of Service content'),
('privacy_policy', '', 'string', true, 'Privacy Policy content'),
('refund_policy', '', 'string', true, 'Refund Policy content'),
('download_link_expiry_days', '7', 'number', false, 'Days until download link expires'),
('max_downloads_per_purchase', '5', 'number', false, 'Max downloads allowed per purchase'),
('auto_refund_days', '7', 'number', false, 'Days within which refunds are auto-approved');

-- =====================================================
-- TABLE: feature_flags
-- Feature toggles for gradual rollouts
-- =====================================================

CREATE TABLE feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pre-populate with features
INSERT INTO feature_flags (key, is_enabled, description) VALUES
('mercado_pago_enabled', false, 'Enable Mercado Pago payment method'),
('blog_enabled', true, 'Enable blog functionality'),
('newsletter_enabled', false, 'Enable newsletter signup'),
('affiliates_enabled', false, 'Enable affiliate program (future)'),
('subscriptions_enabled', false, 'Enable subscription model (future)'),
('dark_mode_enabled', true, 'Enable dark mode toggle'),
('pwa_enabled', true, 'Enable Progressive Web App features'),
('reviews_enabled', true, 'Enable product reviews');

-- =====================================================
-- TABLE: refund_requests
-- Track refund requests from customers
-- =====================================================

CREATE TABLE refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Request details
    reason TEXT,
    status refund_status DEFAULT 'pending' NOT NULL,

    -- Admin response
    admin_notes TEXT,
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for refund_requests
CREATE INDEX idx_refund_requests_order ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_user ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- =====================================================
-- TABLE: email_logs
-- Track sent emails for debugging and compliance
-- =====================================================

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_name VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'sent', -- sent, failed, bounced
    error_message TEXT,

    -- References
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Provider info
    provider VARCHAR(50), -- resend, sendgrid, etc.
    provider_message_id VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for email_logs
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- =====================================================
-- TABLE: ebooks
-- E-book content linked to products (e-books as React webpages)
-- =====================================================

CREATE TABLE ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL UNIQUE,

    -- Metadata
    total_chapters INTEGER DEFAULT 0,
    estimated_read_time_minutes INTEGER,

    -- Theme configuration (JSON for styling variations)
    theme_config JSONB DEFAULT '{
        "primaryColor": "#f97316",
        "accentColor": "#ef4444",
        "fontFamily": "Inter"
    }',

    -- Status (reuses product_status enum)
    status product_status DEFAULT 'draft' NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Indexes for ebooks
CREATE INDEX idx_ebooks_product ON ebooks(product_id);
CREATE INDEX idx_ebooks_status ON ebooks(status);

-- =====================================================
-- TABLE: ebook_chapters
-- Chapters within e-books
-- =====================================================

CREATE TABLE ebook_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE NOT NULL,

    -- Ordering
    chapter_number INTEGER NOT NULL,
    display_order INTEGER NOT NULL,

    -- Titles (bilingual)
    title_en VARCHAR(255) NOT NULL,
    title_pt VARCHAR(255),

    -- Slug for URL
    slug VARCHAR(255) NOT NULL,

    -- Summary/preview (bilingual)
    summary_en TEXT,
    summary_pt TEXT,

    -- Estimated read time for this chapter
    estimated_read_time_minutes INTEGER,

    -- Is this a free preview chapter?
    is_free_preview BOOLEAN DEFAULT false,

    -- Status
    is_published BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(ebook_id, chapter_number),
    UNIQUE(ebook_id, slug)
);

-- Indexes for ebook_chapters
CREATE INDEX idx_ebook_chapters_ebook ON ebook_chapters(ebook_id);
CREATE INDEX idx_ebook_chapters_order ON ebook_chapters(ebook_id, display_order);
CREATE INDEX idx_ebook_chapters_slug ON ebook_chapters(slug);

-- =====================================================
-- TABLE: ebook_sections
-- Sections within chapters
-- =====================================================

CREATE TABLE ebook_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES ebook_chapters(id) ON DELETE CASCADE NOT NULL,

    -- Ordering
    display_order INTEGER NOT NULL,

    -- Section heading (optional, bilingual)
    heading_en VARCHAR(255),
    heading_pt VARCHAR(255),

    -- Section type determines which template/layout to use
    section_type VARCHAR(50) DEFAULT 'standard',  -- standard, two-column, full-width

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for ebook_sections
CREATE INDEX idx_ebook_sections_chapter ON ebook_sections(chapter_id);
CREATE INDEX idx_ebook_sections_order ON ebook_sections(chapter_id, display_order);

-- =====================================================
-- TABLE: ebook_content_blocks
-- Content blocks (the actual content)
-- =====================================================

CREATE TABLE ebook_content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES ebook_sections(id) ON DELETE CASCADE NOT NULL,

    -- Ordering within section
    display_order INTEGER NOT NULL,

    -- Block type (maps to React component)
    -- Types: text, image, quote, callout, accordion, tabs, code, video, divider
    block_type VARCHAR(50) NOT NULL,

    -- Content data (bilingual, structure varies by block_type)
    content_en JSONB NOT NULL DEFAULT '{}',
    content_pt JSONB DEFAULT '{}',

    -- Block-specific configuration
    config JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for ebook_content_blocks
CREATE INDEX idx_ebook_blocks_section ON ebook_content_blocks(section_id);
CREATE INDEX idx_ebook_blocks_order ON ebook_content_blocks(section_id, display_order);
CREATE INDEX idx_ebook_blocks_type ON ebook_content_blocks(block_type);

-- =====================================================
-- TABLE: ebook_reading_progress
-- Track user reading progress for each e-book
-- =====================================================

CREATE TABLE ebook_reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE NOT NULL,

    -- Progress tracking
    last_chapter_id UUID REFERENCES ebook_chapters(id) ON DELETE SET NULL,
    last_section_id UUID REFERENCES ebook_sections(id) ON DELETE SET NULL,
    completion_percentage DECIMAL(5, 2) DEFAULT 0.0,

    -- Chapters completed (array of chapter IDs)
    completed_chapters UUID[] DEFAULT '{}',

    -- Bookmarks (array of section IDs)
    bookmarks UUID[] DEFAULT '{}',

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,

    UNIQUE(user_id, ebook_id)
);

-- Indexes for ebook_reading_progress
CREATE INDEX idx_ebook_progress_user ON ebook_reading_progress(user_id);
CREATE INDEX idx_ebook_progress_ebook ON ebook_reading_progress(ebook_id);
CREATE INDEX idx_ebook_progress_last_read ON ebook_reading_progress(last_read_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_download_links_updated_at BEFORE UPDATE ON download_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON refund_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON ebooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebook_chapters_updated_at BEFORE UPDATE ON ebook_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebook_sections_updated_at BEFORE UPDATE ON ebook_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebook_content_blocks_updated_at BEFORE UPDATE ON ebook_content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebook_reading_progress_updated_at BEFORE UPDATE ON ebook_reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'AG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- AUTHORIZATION NOTE
-- =====================================================
-- Authorization and access control is handled at the application layer
-- by the FastAPI backend. The backend validates JWT tokens and enforces
-- role-based permissions (customer vs admin) before executing queries.
--
-- Key authorization rules enforced by backend:
-- - Users can only access their own profile, cart, orders, download links
-- - Admins can access and modify all data
-- - Public can view: active products, published blog posts, approved reviews
-- - System (webhooks) can create orders and download links
-- =====================================================

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for order summary with items
CREATE OR REPLACE VIEW order_summary AS
SELECT
    o.id,
    o.order_number,
    o.user_id,
    o.customer_email,
    o.customer_name,
    o.total,
    o.currency,
    o.status,
    o.payment_method,
    o.created_at,
    o.paid_at,
    COUNT(oi.id) as item_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'product_name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

-- View for user purchase history
CREATE OR REPLACE VIEW user_purchases AS
SELECT
    p.id as profile_id,
    p.email,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total) as total_spent,
    COUNT(DISTINCT oi.product_id) as unique_products_purchased,
    MAX(o.created_at) as last_purchase_date
FROM profiles p
LEFT JOIN orders o ON o.user_id = p.id AND o.status = 'paid'
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY p.id, p.email;

-- View for product statistics
CREATE OR REPLACE VIEW product_stats AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.price_brl,
    p.price_usd,
    p.status,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.quantity) as total_units_sold,
    SUM(oi.subtotal) as total_revenue,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
GROUP BY p.id;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default category
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Personal Development', 'personal-development', 'Books and resources for personal growth and development', 1, true),
('Business & Entrepreneurship', 'business-entrepreneurship', 'Resources for entrepreneurs and business professionals', 2, true),
('Health & Fitness', 'health-fitness', 'Physical and mental health improvement resources', 3, true);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Alpha Grit database schema created successfully!';
    RAISE NOTICE '📊 Tables created: profiles, categories, products, cart_items, orders, order_items, download_links, blog_posts, faqs, reviews, site_config, feature_flags, refund_requests, email_logs';
    RAISE NOTICE '⚡ Triggers and functions configured';
    RAISE NOTICE '📈 Analytical views created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Start FastAPI backend: uvicorn src.main:app --reload --port 8000';
    RAISE NOTICE '2. Set up Stripe webhook endpoints';
    RAISE NOTICE '3. Configure file storage for product files and images';
    RAISE NOTICE '4. Create first admin user (UPDATE profiles SET role = ''admin'' WHERE email = ''...'')';
END $$;
