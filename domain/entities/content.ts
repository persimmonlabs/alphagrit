/**
 * Content Domain Entities
 *
 * TypeScript types and enums for content management
 */

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface BlogPostEntity {
  id: string;
  title: string;
  title_pt?: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_pt?: string;
  excerpt_en?: string;
  content: string;
  content_pt?: string;
  content_en?: string;
  author_id?: string;
  author_name?: string;
  author?: string;
  cover_image_url?: string;
  status: PostStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  read_time?: number;
  tags?: string[];
}

export interface ProductEntity {
  id: string;
  name: string;
  name_pt?: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_pt?: string;
  description_en?: string;
  price_usd: number;
  price_brl: number;
  cover_image_url?: string;
  status: ProductStatus;
  is_featured: boolean;
  category?: string;
  rating?: number;
  reviews_count?: number;
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface SiteConfigEntity {
  key: string;
  value: any;
  value_type: string;
  is_public: boolean;
}

export interface FeatureFlagEntity {
  key: string;
  is_enabled: boolean;
  description?: string;
}
