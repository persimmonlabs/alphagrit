/**
 * Feature flags configuration
 * These can be overridden by database values
 */

export const defaultFeatureFlags = {
  mercadopago_enabled: false,
  affiliates_enabled: false,
  subscriptions_enabled: false,
  blog_enabled: true,
  reviews_enabled: true,
  newsletter_enabled: false,
  dark_mode_enabled: true,
  pwa_enabled: true,
} as const

export type FeatureFlag = keyof typeof defaultFeatureFlags

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // In a real app, this would check the database
  // For now, return default values
  return defaultFeatureFlags[flag]
}
