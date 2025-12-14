# Ebook Upload Guide

This guide shows you how to upload ebooks with cover images and chapters to your AlphaGrit store.

## SUBSCRIPTION-ONLY MODEL

AlphaGrit operates on a **subscription-only model**:
- All ebooks are accessible through subscription only
- Chapter 1 is always free as a preview
- No individual ebook pricing needed
- Users subscribe for $15/month or $120/year to access all ebooks

## Before You Start

Make sure you have:
- Admin access to the AlphaGrit dashboard
- Your ebook content ready (title, description, chapters)
- Cover image (400x600px recommended, JPG/PNG, under 2MB)
- Subscriptions configured in Stripe (see STRIPE-TESTING-GUIDE.md)

---

## 1. Upload Cover Image to Supabase

### Create Storage Bucket (First Time Only)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Storage → Create bucket
4. Create bucket named `ebook-covers`
5. Make it **Public** (so images can be displayed)

### Upload Cover Image

1. In Supabase Storage, click on `ebook-covers` bucket
2. Click "Upload file"
3. Select your cover image
4. After upload, click on the file
5. Copy the public URL (looks like: `https://xxx.supabase.co/storage/v1/object/public/ebook-covers/filename.jpg`)

---

## 2. Create Ebook via Admin Dashboard

### Access Admin

1. Go to `http://localhost:3000/admin` (or your deployed URL)
2. Login with admin account
3. Click "E-books" in the sidebar

### Create New Ebook

1. Click "New Ebook" button
2. Fill in the form:

| Field | Description | Example |
|-------|-------------|---------|
| **Title (EN)** | English title | "The Productivity Blueprint" |
| **Title (PT)** | Portuguese title | "O Manual da Produtividade" |
| **Slug** | URL-friendly name (auto-generated or manual) | "productivity-blueprint" |
| **Description (EN)** | English synopsis | "Master your time and energy..." |
| **Description (PT)** | Portuguese synopsis | "Domine seu tempo e energia..." |
| **Cover Image URL** | Paste Supabase storage URL | `https://xxx.supabase.co/...` |
| **Status** | Set to "draft" while setting up | draft |

**Note:** Pricing fields have been removed. All ebooks are now accessible via subscription only.

3. Click "Create Ebook"

---

## 3. Add Chapters

### Navigate to Chapters

1. After creating ebook, you'll be on the ebook detail page
2. Click "Manage Chapters" or go to the chapters section

### Create Each Chapter

For each chapter:

1. Click "Add Chapter"
2. Fill in:

| Field | Description |
|-------|-------------|
| **Chapter Number** | Order (1, 2, 3, etc.) |
| **Title (EN)** | English chapter title |
| **Title (PT)** | Portuguese chapter title |
| **Slug** | URL-friendly name (e.g., "introduction") |
| **Content (EN)** | English content (rich text editor) |
| **Content (PT)** | Portuguese content |
| **Is Free Preview** | Check for Chapter 1 (always free) |
| **Is Published** | Check when chapter is ready |

**Important:** Chapter 1 should ALWAYS be marked as free preview. This allows non-subscribers to read it.

3. Click "Save Chapter"

Repeat for all chapters.

---

## 4. Content Formatting

The rich text editor supports:

### Basic Formatting
- **Bold** and *italic* text
- Headings (H1, H2, H3)
- Bullet and numbered lists
- Links

### Images in Content

To add images inside chapter content:

1. Upload image to Supabase Storage first
2. In the editor, click the image button
3. Paste the Supabase public URL

### Code Blocks

For technical content, use the code block button to add:
```javascript
function example() {
  return "formatted code";
}
```

### Quotes

Use the quote button for:
> "Important quotes or excerpts"

---

## 5. Publish and Test

### Publish Checklist

Before making the ebook live:

- [ ] Cover image uploaded and URL set
- [ ] All chapters created and content added
- [ ] Chapter 1 marked as "Free Preview"
- [ ] All chapters marked as "Published"
- [ ] Descriptions in both languages
- [ ] Subscription plans configured in Stripe (see STRIPE-TESTING-GUIDE.md)

### Make Live

1. Edit the ebook
2. Change Status from "draft" to "active"
3. Save

### Verify

1. Go to `http://localhost:3000/en/ebooks`
2. Check that ebook appears in catalog
3. Click on ebook to view detail page
4. Verify:
   - Cover image displays
   - Description shows correctly
   - Chapter 1 is readable without subscription (free preview)
   - Other chapters show "Subscribe to Read" button
   - "Subscribe to Read" button appears on ebook page

---

## 6. Bulk Upload (Advanced)

For uploading multiple ebooks at once, use SQL in Supabase:

```sql
-- Insert ebook (pricing fields no longer used in subscription-only model)
INSERT INTO ebooks (
  title_en,
  title_pt,
  slug,
  description_en,
  description_pt,
  cover_image_url,
  status,
  estimated_read_time_minutes
) VALUES (
  'My Ebook Title',
  'Meu Titulo do Ebook',
  'my-ebook',
  'English description here...',
  'Portuguese description here...',
  'https://xxx.supabase.co/storage/v1/object/public/ebook-covers/cover.jpg',
  'active',
  60
) RETURNING id;
```

Then add chapters:

```sql
-- Use the returned ID from above
INSERT INTO chapters (
  ebook_id,
  chapter_number,
  slug,
  title_en,
  title_pt,
  content_en,
  content_pt,
  is_free_preview,
  is_published
) VALUES (
  'EBOOK_ID_HERE',
  1,
  'introduction',
  'Introduction',
  'Introducao',
  '<p>Chapter 1 content in HTML...</p>',
  '<p>Conteudo do capitulo 1...</p>',
  true,
  true
);
```

---

## 7. Storage Buckets Reference

| Bucket | Purpose | Visibility |
|--------|---------|------------|
| `ebook-covers` | Cover images | Public |
| `ebook-images` | Images inside chapters | Public |
| `ebook-files` | Downloadable PDFs (if needed) | Private |

---

## Quick Checklist

New Ebook Upload:
1. [ ] Upload cover to Supabase Storage
2. [ ] Create ebook in admin (draft mode)
3. [ ] Add all chapters with content
4. [ ] Mark chapter 1 as free preview (required)
5. [ ] Ensure subscription plans configured in Stripe
6. [ ] Change status to "active"
7. [ ] Test chapter 1 free access
8. [ ] Test subscription flow for full access

That's it! Your ebook is now live and ready for sale.
