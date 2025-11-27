# Command & Control Terminal - Setup Guide

## 1. Environment Variables

Create `.env.local` in the root directory:

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NODE_ENV=development
```

## 2. Database Setup

### Option A: Run Migration
```bash
psql $DATABASE_URL < database/schema.sql
```

### Option B: Manual Setup
1. Connect to your Railway PostgreSQL database
2. Run the SQL in `database/schema.sql`

## 3. Database Schema

The `submissions` table includes:

**Stage 1 Fields:**
- `website_url` (required)

**Stage 2 Fields:**
- `enrichment_data` (JSONB - auto-populated)

**Stage 3 Fields:**
- `email` (required)
- `phone`, `whatsapp`, `instagram`, `tiktok` (optional)
- `challenge` (optional - "Strategic Bottleneck")

**Metadata:**
- `status` ('new', 'contacted', 'qualified', 'converted', 'lost')
- `source`, `locale`, `created_at`, `updated_at`

## 4. Running the Application

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
uvicorn src.main:app --reload --port 8000
```

Visit: http://localhost:3002/en (or /pt for Portuguese)

## 5. Testing the Flow

1. **Stage 1**: Enter any valid URL (e.g., `https://example.com`)
2. **Stage 2**: Watch the data cascade animation (2 seconds)
3. **Stage 3**: Fill email and optional fields, submit

## 6. Design Specifications

**Colors:**
- Background: `#050505` (Deep Void Black)
- Grid Lines: `#1A1A1A`
- Text: `#FFFFFF` (Pure White)
- Accents: Green (`#22C55E`) for terminal data

**Typography:**
- Headings: Oswald (font-heading)
- Body: Manrope (font-body)
- Terminal: JetBrains Mono (font-mono)

**Animations:**
- Blinking cursor (800ms interval)
- Data cascade (200ms stagger)
- Stage transitions (framer-motion)

## 7. Conversion Optimization Notes

**Scarcity Trigger**: The aesthetic filters for serious buyers only
**Value Gap**: Stage 2 shows data before asking for contact info
**Reframing**: Not "sign up" - it's "authorize delivery"
**Authority**: Military/tactical terminology throughout

## 8. Next Enhancement: Real Enrichment API

Replace mock data in `ProgressiveEnrichmentForm.tsx` with:
- Clearbit API
- BuiltWith API
- Hunter.io (email verification)
- Custom scraping service

Current mock enrichment is at line 37-48.
