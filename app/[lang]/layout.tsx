import { i18n } from '@/i18n-config'
import { fontHeading, fontBody, fontMono } from "@/lib/fonts"
import "../globals.css"
import { cn } from "@/lib/utils"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <html lang={params.lang} className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground",
          fontHeading.variable,
          fontBody.variable,
          fontMono.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}
