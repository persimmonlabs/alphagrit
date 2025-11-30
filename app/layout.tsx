import { fontHeading, fontBody, fontMono } from "@/lib/fonts"
import "./globals.css"
import { cn } from "@/lib/utils"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Alpha Grit',
    template: '%s | Alpha Grit',
  },
  description: 'Transform your mind. Transform your body. Become unstoppable.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
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
