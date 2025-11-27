import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - AlphaGrit',
  description: 'Administrative dashboard for managing products, blog posts, and settings.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
