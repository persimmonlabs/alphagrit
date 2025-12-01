import { MetadataRoute } from 'next'
import { getEbooks } from '@/lib/supabase/ebooks'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphagrit.com'

  // Static pages
  const staticPages = [
    '',
    '/ebooks',
    '/blog',
    '/terms',
    '/privacy',
    '/auth/login',
    '/auth/signup',
  ]

  const staticRoutes = ['en', 'pt'].flatMap((lang) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${lang}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // Dynamic ebook pages
  let ebookRoutes: MetadataRoute.Sitemap = []
  try {
    const ebooks = await getEbooks()
    ebookRoutes = ['en', 'pt'].flatMap((lang) =>
      ebooks.map((ebook) => ({
        url: `${baseUrl}/${lang}/ebooks/${ebook.slug}`,
        lastModified: new Date(ebook.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch ebooks for sitemap:', error)
  }

  return [...staticRoutes, ...ebookRoutes]
}
