import 'server-only'
import type { Locale } from '@/i18n-config'

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: async () => (await import('@/content/en')).en,
  pt: async () => (await import('@/content/pt')).pt,
}

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    // Default to English if locale not found
    console.warn(`Dictionary for locale '${locale}' not found, defaulting to 'en'`)
    return dictionaries['en']()
  }
  return dictionaries[locale]()
}
