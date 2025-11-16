import { ROUTES, CONTACT } from '@/lib/constants'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Flag,
  User,
  BookOpen,
  Download,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Store navigation
export const storeNav: NavItem[] = [
  {
    title: 'Products',
    href: ROUTES.STORE,
  },
  {
    title: 'Blog',
    href: ROUTES.BLOG,
  },
]

// User account navigation
export const accountNav: NavSection[] = [
  {
    title: 'Account',
    items: [
      {
        title: 'Dashboard',
        href: ROUTES.ACCOUNT,
        icon: LayoutDashboard,
      },
      {
        title: 'Orders',
        href: ROUTES.ACCOUNT_ORDERS,
        icon: ShoppingCart,
      },
      {
        title: 'My E-books',
        href: ROUTES.ACCOUNT_EBOOKS,
        icon: Download,
      },
      {
        title: 'Settings',
        href: ROUTES.ACCOUNT_SETTINGS,
        icon: Settings,
      },
    ],
  },
]

// Admin navigation
export const adminNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: ROUTES.ADMIN,
        icon: LayoutDashboard,
      },
      {
        title: 'Products',
        href: ROUTES.ADMIN_PRODUCTS,
        icon: Package,
      },
      {
        title: 'Orders',
        href: ROUTES.ADMIN_ORDERS,
        icon: ShoppingCart,
      },
      {
        title: 'Customers',
        href: ROUTES.ADMIN_CUSTOMERS,
        icon: Users,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Blog',
        href: ROUTES.ADMIN_BLOG,
        icon: FileText,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Site Settings',
        href: `${ROUTES.ADMIN_SETTINGS}/site`,
        icon: Settings,
      },
      {
        title: 'Feature Flags',
        href: `${ROUTES.ADMIN_SETTINGS}/features`,
        icon: Flag,
      },
    ],
  },
]

// Footer navigation
export const footerNav = {
  products: [
    { title: 'All Products', href: ROUTES.STORE },
    { title: 'E-books', href: ROUTES.STORE },
  ],
  company: [
    { title: 'About', href: '/about' },
    { title: 'Blog', href: ROUTES.BLOG },
    { title: 'Contact', href: '/contact' },
  ],
  legal: [
    { title: 'Terms of Service', href: ROUTES.TERMS },
    { title: 'Privacy Policy', href: ROUTES.PRIVACY },
    { title: 'Refund Policy', href: ROUTES.REFUND },
  ],
  support: [
    { title: 'FAQ', href: '/#faq' },
    { title: 'WhatsApp', href: CONTACT.WHATSAPP_LINK, external: true },
  ],
}
