// lib/fonts.ts
import { Oswald, Manrope, JetBrains_Mono } from 'next/font/google'

export const fontHeading = Oswald({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const fontBody = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})