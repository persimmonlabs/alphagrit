import { APP_NAME, APP_DESCRIPTION, CONTACT } from '@/lib/constants'

export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  links: {
    whatsapp: CONTACT.WHATSAPP_LINK,
    instagram: '', // To be configured in admin
    twitter: '', // To be configured in admin
  },
  contact: {
    whatsapp: CONTACT.WHATSAPP,
    email: CONTACT.EMAIL,
  },
}

export type SiteConfig = typeof siteConfig
