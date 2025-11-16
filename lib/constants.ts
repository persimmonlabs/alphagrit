/**
 * Application Constants
 */

export const APP_NAME = 'Alpha Grit'
export const APP_DESCRIPTION = 'Transform your life through discipline, strength, and relentless action.'

export const CONTACT = {
  WHATSAPP: '+1 (956) 308-2357',
  WHATSAPP_LINK: 'https://wa.me/19563082357',
  EMAIL: 'support@alphagrit.com',
} as const

export const ROUTES = {
  HOME: '/',
  STORE: '/store',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',

  // Auth
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',

  // Account
  ACCOUNT: '/account',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_EBOOKS: '/account/ebooks',
  ACCOUNT_SETTINGS: '/account/settings',

  // Admin
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_SETTINGS: '/admin/settings',

  // Blog
  BLOG: '/blog',

  // Legal
  TERMS: '/legal/terms',
  PRIVACY: '/legal/privacy',
  REFUND: '/legal/refund',
} as const

export const PRODUCT_TYPES = {
  EBOOK: 'ebook',
  PHYSICAL: 'physical',
  CONSULTATION: 'consultation',
  SUBSCRIPTION: 'subscription',
} as const

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const

export const REFUND_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  PROCESSED: 'processed',
  REJECTED: 'rejected',
} as const

export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  MERCADO_PAGO: 'mercadopago',
} as const

export const CURRENCIES = {
  BRL: 'BRL',
  USD: 'USD',
} as const

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const

export const DOWNLOAD_LIMITS = {
  MAX_DOWNLOADS: 5,
  EXPIRY_DAYS: 7,
} as const

export const FILE_UPLOAD_LIMITS = {
  PDF_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_PDF_TYPES: ['.pdf', '.epub'] as const,
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const

export const REFUND_POLICY = {
  AUTO_APPROVE_DAYS: 7,
  GUARANTEE_DAYS: 30,
} as const

export const FEATURE_FLAGS = {
  MERCADOPAGO_ENABLED: 'mercadopago_enabled',
  AFFILIATES_ENABLED: 'affiliates_enabled',
  SUBSCRIPTIONS_ENABLED: 'subscriptions_enabled',
  BLOG_ENABLED: 'blog_enabled',
  REVIEWS_ENABLED: 'reviews_enabled',
  NEWSLETTER_ENABLED: 'newsletter_enabled',
  DARK_MODE_ENABLED: 'dark_mode_enabled',
  PWA_ENABLED: 'pwa_enabled',
} as const

export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  SITE_ASSETS: 'site-assets',
} as const

export const TOAST_MESSAGES = {
  en: {
    SUCCESS: {
      PRODUCT_ADDED: 'Product added to cart',
      PRODUCT_REMOVED: 'Product removed from cart',
      PROFILE_UPDATED: 'Profile updated successfully',
      ORDER_PLACED: 'Order placed successfully',
      REFUND_REQUESTED: 'Refund requested successfully',
      COPIED: 'Copied to clipboard',
    },
    ERROR: {
      GENERIC: 'Something went wrong. Please try again.',
      UNAUTHORIZED: 'You must be logged in to do that',
      FORBIDDEN: 'You do not have permission to do that',
      NOT_FOUND: 'Resource not found',
      NETWORK: 'Network error. Please check your connection.',
    },
  },
  pt: {
    SUCCESS: {
      PRODUCT_ADDED: 'Produto adicionado ao carrinho',
      PRODUCT_REMOVED: 'Produto removido do carrinho',
      PROFILE_UPDATED: 'Perfil atualizado com sucesso',
      ORDER_PLACED: 'Pedido realizado com sucesso',
      REFUND_REQUESTED: 'Reembolso solicitado com sucesso',
      COPIED: 'Copiado para a área de transferência',
    },
    ERROR: {
      GENERIC: 'Algo deu errado. Tente novamente.',
      UNAUTHORIZED: 'Você precisa estar logado para fazer isso',
      FORBIDDEN: 'Você não tem permissão para fazer isso',
      NOT_FOUND: 'Recurso não encontrado',
      NETWORK: 'Erro de rede. Verifique sua conexão.',
    },
  },
} as const

export const SEO = {
  DEFAULT_TITLE: 'Alpha Grit - Transform Your Life Through Discipline',
  DEFAULT_DESCRIPTION: 'Science-based transformation system for modern men. Not temporary motivation—total reconstruction.',
  DEFAULT_KEYWORDS: ['fitness', 'ebook', 'transformation', 'discipline', 'motivation', 'self-improvement', 'mindset'],
  OG_IMAGE: '/og-image.jpg',
} as const
