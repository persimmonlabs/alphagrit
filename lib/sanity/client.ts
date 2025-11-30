import { createClient, type SanityClient } from '@sanity/client'
import { createImageUrlBuilder, type ImageUrlBuilder } from '@sanity/image-url'

// Use any for SanityImageSource to avoid type issues
type SanityImageSource = any

// Lazy-loaded clients to avoid build-time env var errors
let _sanityClient: SanityClient | null = null
let _imageBuilder: ImageUrlBuilder | null = null

function getProjectId() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
}

function getDataset() {
  return process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
}

export function getSanityClient(): SanityClient {
  if (!_sanityClient) {
    _sanityClient = createClient({
      projectId: getProjectId(),
      dataset: getDataset(),
      apiVersion: '2024-01-01',
      useCdn: process.env.NODE_ENV === 'production',
    })
  }
  return _sanityClient
}

// Legacy export for backwards compatibility
export const sanityClient = {
  fetch: (...args: Parameters<SanityClient['fetch']>) => getSanityClient().fetch(...args),
}

// Image URL builder (lazy)
function getImageBuilder(): ImageUrlBuilder {
  if (!_imageBuilder) {
    _imageBuilder = createImageUrlBuilder({
      projectId: getProjectId(),
      dataset: getDataset()
    })
  }
  return _imageBuilder
}

export function urlFor(source: SanityImageSource) {
  return getImageBuilder().image(source)
}

// Types for Sanity documents
export interface SanityEbook {
  _id: string
  _type: 'ebook'
  title: { en: string; pt?: string }
  slug: { current: string }
  description?: { en: string; pt?: string }
  coverImage?: SanityImageSource
  price_usd?: number
  price_brl?: number
  stripe_price_id_usd?: string
  stripe_price_id_brl?: string
  chapters?: SanityChapter[]
  estimatedReadTimeMinutes?: number
  themeConfig?: {
    primaryColor: string
    accentColor: string
    fontFamily: string
  }
  status: 'draft' | 'active' | 'archived'
}

export interface SanityChapter {
  _id: string
  _type: 'chapter'
  chapterNumber: number
  title: { en: string; pt?: string }
  slug: { current: string }
  summary?: { en: string; pt?: string }
  estimatedReadTimeMinutes?: number
  isFreePreview: boolean
  isPublished: boolean
  sections?: SanitySection[]
}

export interface SanitySection {
  _key: string
  heading?: { en: string; pt?: string }
  sectionType: 'standard' | 'two-column' | 'full-width'
  blocks?: SanityBlock[]
}

export type SanityBlock =
  | SanityTextBlock
  | SanityImageBlock
  | SanityCalloutBlock
  | SanityQuoteBlock
  | SanityCodeBlock
  | SanityVideoBlock
  | SanityDividerBlock
  | SanityAccordionBlock
  | SanityTabsBlock

interface SanityTextBlock {
  _key: string
  _type: 'textBlock'
  content: { en: any[]; pt?: any[] }
}

interface SanityImageBlock {
  _key: string
  _type: 'imageBlock'
  image: SanityImageSource
  alt?: { en: string; pt?: string }
  caption?: { en: string; pt?: string }
}

interface SanityCalloutBlock {
  _key: string
  _type: 'calloutBlock'
  type: 'info' | 'warning' | 'tip' | 'note'
  title?: { en: string; pt?: string }
  content: { en: string; pt?: string }
}

interface SanityQuoteBlock {
  _key: string
  _type: 'quoteBlock'
  text: { en: string; pt?: string }
  author?: string
}

interface SanityCodeBlock {
  _key: string
  _type: 'codeBlock'
  code: string
  language?: string
  filename?: string
}

interface SanityVideoBlock {
  _key: string
  _type: 'videoBlock'
  type: 'youtube' | 'vimeo'
  url: string
  title?: { en: string; pt?: string }
}

interface SanityDividerBlock {
  _key: string
  _type: 'dividerBlock'
  style: 'line' | 'dots' | 'space'
}

interface SanityAccordionBlock {
  _key: string
  _type: 'accordionBlock'
  items: Array<{
    title: { en: string; pt?: string }
    content: { en: string; pt?: string }
  }>
}

interface SanityTabsBlock {
  _key: string
  _type: 'tabsBlock'
  tabs: Array<{
    label: { en: string; pt?: string }
    content: { en: string; pt?: string }
  }>
}
