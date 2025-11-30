import { getSanityClient } from './client'
import type { SanityEbook, SanityChapter } from './client'

// Get all active ebooks
export async function getEbooks(): Promise<SanityEbook[]> {
  return getSanityClient().fetch(`
    *[_type == "ebook" && status == "active"] | order(title.en asc) {
      _id,
      title,
      slug,
      description,
      coverImage,
      price_usd,
      price_brl,
      stripe_price_id_usd,
      stripe_price_id_brl,
      estimatedReadTimeMinutes,
      status,
      "chapters": chapters[]-> {
        _id,
        chapterNumber,
        title,
        slug,
        isFreePreview,
        isPublished
      }
    }
  `)
}

// Get single ebook by slug
export async function getEbookBySlug(slug: string): Promise<SanityEbook | null> {
  return getSanityClient().fetch(`
    *[_type == "ebook" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      coverImage,
      price_usd,
      price_brl,
      stripe_price_id_usd,
      stripe_price_id_brl,
      estimatedReadTimeMinutes,
      themeConfig,
      status,
      "chapters": chapters[]-> {
        _id,
        chapterNumber,
        title,
        slug,
        summary,
        estimatedReadTimeMinutes,
        isFreePreview,
        isPublished
      } | order(chapterNumber asc)
    }
  `, { slug })
}

// Get single chapter by slug with full content
export async function getChapterBySlug(
  ebookSlug: string,
  chapterSlug: string
): Promise<{ ebook: SanityEbook; chapter: SanityChapter } | null> {
  const result = await getSanityClient().fetch(`
    {
      "ebook": *[_type == "ebook" && slug.current == $ebookSlug][0] {
        _id,
        title,
        slug,
        themeConfig,
        status,
        "chapters": chapters[]-> {
          _id,
          chapterNumber,
          title,
          slug,
          isFreePreview,
          isPublished
        } | order(chapterNumber asc)
      },
      "chapter": *[_type == "chapter" && slug.current == $chapterSlug][0] {
        _id,
        chapterNumber,
        title,
        slug,
        summary,
        estimatedReadTimeMinutes,
        isFreePreview,
        isPublished,
        sections
      }
    }
  `, { ebookSlug, chapterSlug })

  if (!result.ebook || !result.chapter) {
    return null
  }

  return result
}

// Get all ebook slugs (for static generation)
export async function getEbookSlugs(): Promise<string[]> {
  return getSanityClient().fetch(`
    *[_type == "ebook" && status == "active"].slug.current
  `)
}

// Get all chapter slugs for an ebook (for static generation)
export async function getChapterSlugs(ebookSlug: string): Promise<string[]> {
  return getSanityClient().fetch(`
    *[_type == "ebook" && slug.current == $ebookSlug][0].chapters[]->slug.current
  `, { ebookSlug })
}
