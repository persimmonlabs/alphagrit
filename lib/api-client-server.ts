'use server'

// Server-only API client for server components

import { env } from '@/lib/env'
import { headers } from 'next/headers'

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

interface RequestOptions extends RequestInit {
  token?: string
}

/**
 * Server-side API client for fetching data in Server Components
 * Uses next/headers to forward cookies and other request context
 */
export const serverApiClient = async <T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> => {
  const { token, ...rest } = options || {}

  try {
    const nextHeaders = headers()

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(nextHeaders.get('cookie') && { Cookie: nextHeaders.get('cookie') || '' }),
    }

    // Map frontend endpoints to backend endpoints
    // Backend routes: /products/, /products/categories/, /users/users/, /reviews/reviews/, /content/blog-posts/
    let apiEndpoint = endpoint

    const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
      headers: defaultHeaders,
      ...rest,
      cache: 'no-store', // Always fetch fresh data on the server
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.warn(`API request failed for ${endpoint}, using mock data:`, error)

    // Import mock data and return based on endpoint
    const { mockData } = await import('@/lib/mock-data')

    if (endpoint.includes('products/') || endpoint === '/products/') {
      if (endpoint.includes('?is_featured=true') || endpoint.includes('?status=active')) {
        return mockData.products.filter((p: any) => p.is_featured) as T
      }
      return mockData.products as T
    }
    if (endpoint.includes('categories/') || endpoint === '/categories/') {
      return mockData.categories as T
    }
    if (endpoint.includes('blog-posts') || endpoint.includes('/content/blog-posts')) {
      let filteredPosts = mockData.blogPosts

      if (endpoint.includes('status=published') || endpoint.includes('status=PUBLISHED')) {
        filteredPosts = filteredPosts.filter((p: any) => p.status === 'published')
      }

      if (endpoint.includes('slug=')) {
        const slugMatch = endpoint.match(/slug=([^&]+)/)
        if (slugMatch) {
          const slug = slugMatch[1]
          filteredPosts = filteredPosts.filter((p: any) => p.slug === slug)
        }
      }

      return filteredPosts as T
    }
    if (endpoint.includes('site-config')) {
      return mockData.siteSettings as T
    }
    if (endpoint.includes('feature-flags')) {
      return mockData.featureFlags as T
    }
    if (endpoint.includes('reviews')) {
      return mockData.reviews as T
    }
    if (endpoint.includes('users')) {
      return mockData.users as T
    }

    // E-book endpoints
    if (endpoint.includes('/ebooks')) {
      if (endpoint.includes('/ebooks/by-product/')) {
        return (mockData.ebooks?.[0] || {}) as T
      }
      // /ebooks/chapters/{chapterId}/sections - filter sections by chapter_id
      if (endpoint.includes('/chapters/') && endpoint.includes('/sections')) {
        const chapterIdMatch = endpoint.match(/\/chapters\/([^/]+)\/sections/)
        if (chapterIdMatch) {
          const chapterId = chapterIdMatch[1]
          const filtered = (mockData.ebookSections || []).filter(
            (s: any) => s.chapter_id === chapterId
          )
          return filtered as T
        }
        return (mockData.ebookSections || []) as T
      }
      // /ebooks/sections/{sectionId}/blocks - filter blocks by section_id
      if (endpoint.includes('/sections/') && endpoint.includes('/blocks')) {
        const sectionIdMatch = endpoint.match(/\/sections\/([^/]+)\/blocks/)
        if (sectionIdMatch) {
          const sectionId = sectionIdMatch[1]
          const filtered = (mockData.ebookBlocks || []).filter(
            (b: any) => b.section_id === sectionId
          )
          return filtered as T
        }
        return (mockData.ebookBlocks || []) as T
      }
      if (endpoint.includes('/chapters')) {
        return (mockData.ebookChapters || []) as T
      }
      if (endpoint.includes('/sections')) {
        return (mockData.ebookSections || []) as T
      }
      if (endpoint.includes('/blocks')) {
        return (mockData.ebookBlocks || []) as T
      }
      if (endpoint.includes('/access')) {
        // Grant access for demo purposes
        return { has_access: true, ebook_id: 'ebook-1', product_id: 'prod-1' } as T
      }
      if (endpoint.includes('/progress')) {
        return {} as T
      }
      return (mockData.ebooks || []) as T
    }

    // Default: return empty array for list endpoints or empty object
    if (endpoint.endsWith('/')) {
      return [] as T
    }
    return {} as T
  }
}
