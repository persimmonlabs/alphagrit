/**
 * Shared TypeScript types
 */

import type { Database } from './supabase'

// Database types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Domain types
export type Profile = Tables<'profiles'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type DownloadLink = Tables<'download_links'>
export type Review = Tables<'reviews'>
export type BlogPost = Tables<'blog_posts'>
export type FAQ = Tables<'faqs'>
export type SiteConfig = Tables<'site_config'>
export type FeatureFlag = Tables<'feature_flags'>
export type CartItem = Tables<'cart_items'>

// Extended types with relations
export interface ProductWithReviews extends Product {
  reviews: Review[]
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface OrderWithItemsAndProducts extends Order {
  items: (OrderItem & { product: Product | null })[]
}

// Cart
export interface CartItemWithProduct extends CartItem {
  product: Product
}

export interface CartState {
  items: CartItemWithProduct[]
  total: number
  count: number
}

// Checkout
export interface CheckoutFormData {
  email: string
  fullName: string
  currency: 'BRL' | 'USD'
  acceptedTerms: boolean
}

// API responses
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form states
export interface FormState {
  success?: boolean
  error?: string
  message?: string
  errors?: Record<string, string[]>
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filters
export interface ProductFilters {
  status?: string
  type?: string
  category?: string
  search?: string
}

export interface OrderFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Email
export interface EmailData {
  to: string
  subject: string
  react: React.ReactElement
}

// Download
export interface DownloadRequest {
  orderId: string
  productId: string
}

export interface DownloadResponse {
  url: string
  expiresAt: string
  downloadsRemaining: number
}

// Refund
export interface RefundRequest {
  orderId: string
  reason: string
}

export interface RefundResponse {
  success: boolean
  refundId?: string
  error?: string
}

// Admin Stats
export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: OrderWithItems[]
  topProducts: (Product & { salesCount: number })[]
  revenueData: {
    date: string
    revenue: number
  }[]
}

// Site configuration
export interface SiteConfigData {
  site_name: string
  site_description: string
  primary_color: string
  secondary_color: string
  logo_url: string
  hero_title: string
  hero_subtitle: string
  contact_whatsapp: string
  social_instagram: string
  social_twitter: string
}

// Language
export type Language = 'en' | 'pt'

export interface I18nString {
  en: string
  pt: string
}

// Component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// User role
export type UserRole = 'customer' | 'admin'

// Payment provider
export type PaymentProvider = 'stripe' | 'mercadopago'

// Order status
export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'failed'

// Product status
export type ProductStatus = 'draft' | 'active' | 'archived'

// Product type
export type ProductType = 'ebook' | 'physical' | 'consultation' | 'subscription'

// Currency
export type Currency = 'BRL' | 'USD'
