# Alpha Grit Database Schema Documentation

## Overview

This database schema supports a complete digital products (e-books) platform with:
- User authentication and authorization
- Product catalog management
- Shopping cart and checkout
- Payment processing (Stripe + Mercado Pago)
- Order management and fulfillment
- Secure download links with expiration
- Blog and content management
- Site configuration and feature flags
- Refund management
- Email tracking

## Technology Stack

- **Database**: Railway PostgreSQL 15+
- **Authentication**: JWT-based (FastAPI backend)
- **ORM**: SQLAlchemy (Python backend)
- **Security**: Row Level Security (RLS) policies

## Quick Start

### 1. Set Up Railway PostgreSQL

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL service
3. Copy the connection string (DATABASE_URL)

### 2. Initialize Database

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL

# Run the schema
\i database/schema.sql
```

Or directly:
```bash
psql $DATABASE_URL < database/schema.sql
```

### 3. Create First Admin User

After a user signs up through the app, promote them to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

## Database Schema

### Core Tables

#### 1. **profiles**
User profiles with application-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | User identifier |
| email | VARCHAR(255) | User email (unique) |
| full_name | VARCHAR(255) | User's full name |
| avatar_url | TEXT | Profile picture URL |
| role | ENUM | 'customer' or 'admin' |
| preferred_language | VARCHAR(5) | 'en' or 'pt' |
| preferred_currency | ENUM | 'BRL' or 'USD' |
| created_at | TIMESTAMPTZ | Account creation time |
| updated_at | TIMESTAMPTZ | Last update time |

---

#### 2. **products**
E-books and digital products.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Product identifier |
| name | VARCHAR(255) | Product name |
| slug | VARCHAR(255) | URL-friendly name (unique) |
| price_brl | DECIMAL(10,2) | Price in Brazilian Reais |
| price_usd | DECIMAL(10,2) | Price in US Dollars |
| stripe_product_id | VARCHAR(255) | Stripe product ID |
| file_url | TEXT | PDF/EPUB file path in storage |
| status | ENUM | 'draft', 'active', 'archived' |
| is_featured | BOOLEAN | Featured on homepage |

**Status Flow**: `draft` → `active` → `archived`

---

#### 3. **orders**
Customer purchase records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Order identifier |
| order_number | VARCHAR(50) | Human-readable ID (e.g., AG-20241123-1234) |
| user_id | UUID (FK) | References profiles (nullable for guests) |
| total | DECIMAL(10,2) | Final total |
| currency | ENUM | 'BRL' or 'USD' |
| payment_method | ENUM | 'stripe' or 'mercado_pago' |
| status | ENUM | Order status |

**Order Number Format**: `AG-YYYYMMDD-XXXX`

---

#### 4. **download_links**
Secure, time-limited download links.

| Column | Type | Description |
|--------|------|-------------|
| token | VARCHAR(255) | Unique access token |
| max_downloads | INTEGER | Download limit (default: 5) |
| download_count | INTEGER | Current download count |
| expires_at | TIMESTAMPTZ | Link expiration (default: 7 days) |
| is_active | BOOLEAN | Active flag |

**Security Model**:
1. Token-based URL access
2. Time-limited (7 days default)
3. Download-limited (5 downloads default)
4. IP tracking for abuse detection

---

## Row Level Security (RLS)

### Key Principles
1. **Public Access**: Active products, published blog posts, approved reviews
2. **User Access**: Own cart, orders, download links, profile
3. **Admin Access**: Everything

---

## Common Queries

### Admin Dashboard

```sql
-- Revenue metrics
SELECT
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as orders_today,
  SUM(total) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as revenue_week
FROM orders
WHERE status = 'paid';
```

### Customer Account

```sql
-- User's purchased e-books with download status
SELECT
  p.name,
  dl.download_count,
  dl.max_downloads,
  dl.expires_at,
  dl.is_active
FROM download_links dl
JOIN products p ON p.id = dl.product_id
WHERE dl.user_id = 'user-uuid';
```

---

## Backup Strategy

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Before migrations
pg_dump $DATABASE_URL > pre_migration_backup.sql
```

---

## Support

- Backend: Python FastAPI with Clean Architecture (DDD)
- Frontend: Next.js 14+ with TypeScript
- Database: Railway PostgreSQL

**Next Steps**: See `backend/README.md` for backend implementation guide.
