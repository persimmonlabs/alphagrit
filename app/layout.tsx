import { fontHeading, fontBody, fontMono } from "@/lib/fonts"
import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata = {
  title: 'Alpha Grit',
  description: 'Transform your mind. Transform your body. Become unstoppable.',
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
