// E-book TypeScript Types

export type ProductStatus = 'draft' | 'active' | 'archived';

export type SectionType = 'standard' | 'two-column' | 'full-width';

export type BlockType =
  | 'text'
  | 'image'
  | 'quote'
  | 'callout'
  | 'accordion'
  | 'tabs'
  | 'code'
  | 'video'
  | 'divider';

export interface EbookThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface Ebook {
  id: string;
  productId: string;
  totalChapters: number;
  estimatedReadTimeMinutes: number | null;
  themeConfig: EbookThemeConfig;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  chapters?: EbookChapter[];
}

export interface EbookChapter {
  id: string;
  ebookId: string;
  chapterNumber: number;
  displayOrder: number;
  titleEn: string;
  titlePt: string | null;
  slug: string;
  summaryEn: string | null;
  summaryPt: string | null;
  estimatedReadTimeMinutes: number | null;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: EbookSection[];
}

export interface EbookSection {
  id: string;
  chapterId: string;
  displayOrder: number;
  headingEn: string | null;
  headingPt: string | null;
  sectionType: SectionType;
  createdAt: string;
  updatedAt: string;
  blocks?: EbookContentBlock[];
}

export interface EbookContentBlock {
  id: string;
  sectionId: string;
  displayOrder: number;
  blockType: BlockType;
  contentEn: BlockContent;
  contentPt: BlockContent | null;
  config: BlockConfig;
  createdAt: string;
  updatedAt: string;
}

export interface EbookReadingProgress {
  id: string;
  userId: string;
  ebookId: string;
  lastChapterId: string | null;
  lastSectionId: string | null;
  completionPercentage: number;
  completedChapters: string[];
  bookmarks: string[];
  startedAt: string;
  lastReadAt: string;
  completedAt: string | null;
}

// Block Content Types
export interface TextBlockContent {
  html: string;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  caption?: string;
}

export interface QuoteBlockContent {
  text: string;
  author?: string;
}

export interface CalloutBlockContent {
  type: 'info' | 'warning' | 'tip' | 'note';
  title?: string;
  content: string;
}

export interface AccordionBlockContent {
  items: Array<{
    title: string;
    content: string;
  }>;
}

export interface TabsBlockContent {
  tabs: Array<{
    label: string;
    content: string;
  }>;
}

export interface CodeBlockContent {
  code: string;
  language?: string;
  filename?: string;
}

export interface VideoBlockContent {
  src: string;
  type: 'youtube' | 'vimeo' | 'file';
  title?: string;
}

export interface DividerBlockContent {
  style?: 'line' | 'dots' | 'space';
}

export type BlockContent =
  | TextBlockContent
  | ImageBlockContent
  | QuoteBlockContent
  | CalloutBlockContent
  | AccordionBlockContent
  | TabsBlockContent
  | CodeBlockContent
  | VideoBlockContent
  | DividerBlockContent
  | Record<string, unknown>;

export interface BlockConfig {
  className?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
}

// API Response types (matches backend schemas)
export interface EbookResponse {
  id: string;
  product_id: string;
  total_chapters: number;
  estimated_read_time_minutes: number | null;
  theme_config: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  } | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface EbookChapterResponse {
  id: string;
  ebook_id: string;
  chapter_number: number;
  display_order: number;
  title_en: string;
  title_pt: string | null;
  slug: string;
  summary_en: string | null;
  summary_pt: string | null;
  estimated_read_time_minutes: number | null;
  is_free_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EbookSectionResponse {
  id: string;
  chapter_id: string;
  display_order: number;
  heading_en: string | null;
  heading_pt: string | null;
  section_type: SectionType;
  created_at: string;
  updated_at: string;
}

export interface EbookContentBlockResponse {
  id: string;
  section_id: string;
  display_order: number;
  block_type: BlockType;
  content_en: BlockContent;
  content_pt: BlockContent | null;
  config: BlockConfig;
  created_at: string;
  updated_at: string;
}

export interface EbookReadingProgressResponse {
  id: string;
  user_id: string;
  ebook_id: string;
  last_chapter_id: string | null;
  last_section_id: string | null;
  completion_percentage: number;
  completed_chapters: string[];
  bookmarks: string[];
  started_at: string;
  last_read_at: string;
  completed_at: string | null;
}

// Transform functions from API response to frontend types
export function transformEbook(response: EbookResponse): Ebook {
  return {
    id: response.id,
    productId: response.product_id,
    totalChapters: response.total_chapters,
    estimatedReadTimeMinutes: response.estimated_read_time_minutes,
    themeConfig: response.theme_config ?? {
      primaryColor: '#f97316',
      accentColor: '#ef4444',
      fontFamily: 'Inter'
    },
    status: response.status,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    publishedAt: response.published_at
  };
}

export function transformChapter(response: EbookChapterResponse): EbookChapter {
  return {
    id: response.id,
    ebookId: response.ebook_id,
    chapterNumber: response.chapter_number,
    displayOrder: response.display_order,
    titleEn: response.title_en,
    titlePt: response.title_pt,
    slug: response.slug,
    summaryEn: response.summary_en,
    summaryPt: response.summary_pt,
    estimatedReadTimeMinutes: response.estimated_read_time_minutes,
    isFreePreview: response.is_free_preview,
    isPublished: response.is_published,
    createdAt: response.created_at,
    updatedAt: response.updated_at
  };
}

export function transformSection(response: EbookSectionResponse): EbookSection {
  return {
    id: response.id,
    chapterId: response.chapter_id,
    displayOrder: response.display_order,
    headingEn: response.heading_en,
    headingPt: response.heading_pt,
    sectionType: response.section_type,
    createdAt: response.created_at,
    updatedAt: response.updated_at
  };
}

export function transformBlock(response: EbookContentBlockResponse): EbookContentBlock {
  return {
    id: response.id,
    sectionId: response.section_id,
    displayOrder: response.display_order,
    blockType: response.block_type,
    contentEn: response.content_en,
    contentPt: response.content_pt,
    config: response.config,
    createdAt: response.created_at,
    updatedAt: response.updated_at
  };
}

export function transformReadingProgress(response: EbookReadingProgressResponse): EbookReadingProgress {
  return {
    id: response.id,
    userId: response.user_id,
    ebookId: response.ebook_id,
    lastChapterId: response.last_chapter_id,
    lastSectionId: response.last_section_id,
    completionPercentage: response.completion_percentage,
    completedChapters: response.completed_chapters,
    bookmarks: response.bookmarks,
    startedAt: response.started_at,
    lastReadAt: response.last_read_at,
    completedAt: response.completed_at
  };
}

// Localization helper
export function getLocalizedContent<T extends { contentEn: BlockContent; contentPt: BlockContent | null }>(
  block: T,
  lang: 'en' | 'pt'
): BlockContent {
  if (lang === 'pt' && block.contentPt) {
    return block.contentPt;
  }
  return block.contentEn;
}

export function getLocalizedTitle(chapter: EbookChapter, lang: 'en' | 'pt'): string {
  if (lang === 'pt' && chapter.titlePt) {
    return chapter.titlePt;
  }
  return chapter.titleEn;
}

export function getLocalizedHeading(section: EbookSection, lang: 'en' | 'pt'): string | null {
  if (lang === 'pt' && section.headingPt) {
    return section.headingPt;
  }
  return section.headingEn;
}
