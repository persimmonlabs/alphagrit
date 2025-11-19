/**
 * SEO metadata generation for blog posts
 */

import type { Metadata } from 'next'
import type { Database } from '@/types/supabase'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface BlogPostWithAuthor extends BlogPost {
  profiles: Profile | null
}

/**
 * Generate metadata for blog post detail page
 */
export function generateBlogPostMetadata(
  post: BlogPostWithAuthor,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
): Metadata {
  const url = `${baseUrl}/blog/${post.slug}`
  const title = `${post.title} | Alpha Grit Blog`
  const description = post.excerpt || 'Read this article on Alpha Grit'
  const authorName = post.profiles?.full_name || 'Alpha Grit'
  const publishedTime = post.published_at || post.created_at

  return {
    title,
    description,
    authors: [{ name: authorName }],
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description,
      images: post.cover_image_url ? [
        {
          url: post.cover_image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      publishedTime,
      authors: [authorName],
      siteName: 'Alpha Grit',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : [],
      creator: '@alphagrit',
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * Generate JSON-LD structured data for blog post
 */
export function generateBlogPostJsonLd(
  post: BlogPostWithAuthor,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.cover_image_url || '',
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.profiles?.full_name || 'Alpha Grit',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Alpha Grit',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  }
}

/**
 * Generate metadata for blog listing page
 */
export function generateBlogListingMetadata(
  page: number = 1,
  category?: string
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${baseUrl}/blog`

  let title = 'Blog | Alpha Grit'
  let description = 'Insights on discipline, strength, and personal transformation. Science-based advice for modern men.'

  if (category) {
    title = `${category} Articles | Alpha Grit Blog`
    description = `Browse ${category.toLowerCase()} articles on Alpha Grit`
  }

  if (page > 1) {
    title = `${title} - Page ${page}`
  }

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: page > 1 ? `${url}?page=${page}` : url,
      title,
      description,
      siteName: 'Alpha Grit',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: '@alphagrit',
    },
    alternates: {
      canonical: url,
    },
  }
}
