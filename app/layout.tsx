import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Alpha Grit - Transform Your Life Through Discipline',
  description: 'Science-based transformation system for modern men. Not temporary motivation—total reconstruction.',
  keywords: ['fitness', 'ebook', 'transformation', 'discipline', 'motivation', 'self-improvement'],
  authors: [{ name: 'Alpha Grit' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Alpha Grit',
    title: 'Alpha Grit - Transform Your Life Through Discipline',
    description: 'Science-based transformation system for modern men. Not temporary motivation—total reconstruction.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Alpha Grit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpha Grit - Transform Your Life Through Discipline',
    description: 'Science-based transformation system for modern men. Not temporary motivation—total reconstruction.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

import { CartProvider } from '@/components/providers/cart-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#f97316',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
