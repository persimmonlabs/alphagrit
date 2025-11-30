import { i18n } from '@/i18n-config'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

// This layout inherits from the root layout
// It only adds locale-specific metadata
export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
