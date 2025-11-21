import 'server-only'
import type { Locale } from '@/i18n-config'

const dictionaries = {
  en: () => import('@/content/en').then((module) => module.en),
  pt: () => import('@/content/pt').then((module) => module.pt),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
