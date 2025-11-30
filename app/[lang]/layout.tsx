import { i18n, type Locale } from '@/i18n-config'
import { getDictionary } from '@/lib/dictionary'
import type { Metadata } from 'next'
import CookieConsent from '@/components/CookieConsent'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(lang)

  const title = dict.metadata?.siteTitle || 'Alpha Grit'
  const description = dict.metadata?.siteDescription || 'Transform your mind. Transform your body.'

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title,
      description,
      locale: lang === 'pt' ? 'pt_BR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      languages: {
        en: '/en',
        pt: '/pt',
      },
    },
  }
}

// This layout inherits from the root layout
export default function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <>
      {children}
      <CookieConsent lang={lang} />
    </>
  )
}
