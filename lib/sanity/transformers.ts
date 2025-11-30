import { toHTML } from '@portabletext/to-html'
import { urlFor } from './client'
import type {
  SanityEbook,
  SanityChapter,
  SanitySection,
  SanityBlock,
} from './client'
import type {
  Ebook,
  EbookChapter,
  EbookSection,
  EbookContentBlock,
  BlockContent,
  BlockType,
} from '@/lib/ebook/types'

// Transform Sanity ebook to frontend type
export function transformEbook(sanity: SanityEbook): Ebook {
  return {
    id: sanity._id,
    productId: sanity._id, // Using same ID since we removed separate products table
    totalChapters: sanity.chapters?.length || 0,
    estimatedReadTimeMinutes: sanity.estimatedReadTimeMinutes || null,
    themeConfig: sanity.themeConfig || {
      primaryColor: '#f97316',
      accentColor: '#ef4444',
      fontFamily: 'Inter',
    },
    status: sanity.status,
    createdAt: '',
    updatedAt: '',
    publishedAt: sanity.status === 'active' ? new Date().toISOString() : null,
  }
}

// Transform Sanity chapter to frontend type
export function transformChapter(sanity: SanityChapter): EbookChapter {
  return {
    id: sanity._id,
    ebookId: '',
    chapterNumber: sanity.chapterNumber,
    displayOrder: sanity.chapterNumber,
    titleEn: sanity.title.en,
    titlePt: sanity.title.pt || null,
    slug: sanity.slug.current,
    summaryEn: sanity.summary?.en || null,
    summaryPt: sanity.summary?.pt || null,
    estimatedReadTimeMinutes: sanity.estimatedReadTimeMinutes || null,
    isFreePreview: sanity.isFreePreview,
    isPublished: sanity.isPublished,
    createdAt: '',
    updatedAt: '',
  }
}

// Transform Sanity section to frontend type
export function transformSection(
  sanity: SanitySection,
  index: number
): EbookSection {
  return {
    id: sanity._key,
    chapterId: '',
    displayOrder: index + 1,
    headingEn: sanity.heading?.en || null,
    headingPt: sanity.heading?.pt || null,
    sectionType: sanity.sectionType || 'standard',
    createdAt: '',
    updatedAt: '',
    blocks: sanity.blocks?.map((block, i) => transformBlock(block, i)) || [],
  }
}

// Map Sanity block type to frontend block type
function mapBlockType(sanityType: string): BlockType {
  const mapping: Record<string, BlockType> = {
    textBlock: 'text',
    imageBlock: 'image',
    calloutBlock: 'callout',
    quoteBlock: 'quote',
    codeBlock: 'code',
    videoBlock: 'video',
    dividerBlock: 'divider',
    accordionBlock: 'accordion',
    tabsBlock: 'tabs',
  }
  return mapping[sanityType] || 'text'
}

// Transform Sanity block to frontend type
export function transformBlock(
  sanity: SanityBlock,
  index: number
): EbookContentBlock {
  const blockType = mapBlockType(sanity._type)

  return {
    id: sanity._key,
    sectionId: '',
    displayOrder: index + 1,
    blockType,
    contentEn: transformBlockContent(sanity, 'en'),
    contentPt: transformBlockContent(sanity, 'pt'),
    config: {},
    createdAt: '',
    updatedAt: '',
  }
}

// Transform block content based on type and language
function transformBlockContent(
  block: SanityBlock,
  lang: 'en' | 'pt'
): BlockContent {
  switch (block._type) {
    case 'textBlock': {
      const content = lang === 'pt' && block.content.pt
        ? block.content.pt
        : block.content.en
      return {
        html: content ? toHTML(content) : '',
      }
    }

    case 'imageBlock': {
      return {
        src: block.image ? urlFor(block.image).url() : '',
        alt: (lang === 'pt' && block.alt?.pt) || block.alt?.en || '',
        caption: (lang === 'pt' && block.caption?.pt) || block.caption?.en,
      }
    }

    case 'calloutBlock': {
      return {
        type: block.type,
        title: (lang === 'pt' && block.title?.pt) || block.title?.en,
        content: (lang === 'pt' && block.content.pt) || block.content.en || '',
      }
    }

    case 'quoteBlock': {
      return {
        text: (lang === 'pt' && block.text.pt) || block.text.en || '',
        author: block.author,
      }
    }

    case 'codeBlock': {
      return {
        code: block.code,
        language: block.language,
        filename: block.filename,
      }
    }

    case 'videoBlock': {
      // Extract video ID from URL
      let src = block.url
      if (block.type === 'youtube' && block.url) {
        const match = block.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
        if (match) src = match[1]
      } else if (block.type === 'vimeo' && block.url) {
        const match = block.url.match(/vimeo\.com\/(\d+)/)
        if (match) src = match[1]
      }

      return {
        src,
        type: block.type,
        title: (lang === 'pt' && block.title?.pt) || block.title?.en,
      }
    }

    case 'dividerBlock': {
      return {
        style: block.style,
      }
    }

    case 'accordionBlock': {
      return {
        items: block.items.map((item) => ({
          title: (lang === 'pt' && item.title.pt) || item.title.en || '',
          content: (lang === 'pt' && item.content.pt) || item.content.en || '',
        })),
      }
    }

    case 'tabsBlock': {
      return {
        tabs: block.tabs.map((tab) => ({
          label: (lang === 'pt' && tab.label.pt) || tab.label.en || '',
          content: (lang === 'pt' && tab.content.pt) || tab.content.en || '',
        })),
      }
    }

    default:
      return {}
  }
}

// Transform full chapter with sections
export function transformChapterWithSections(
  chapter: SanityChapter
): EbookChapter & { sections: EbookSection[] } {
  const transformedChapter = transformChapter(chapter)
  const sections = chapter.sections?.map((s, i) => transformSection(s, i)) || []

  return {
    ...transformedChapter,
    sections,
  }
}
