'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/store" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-primary-500">ALPHA GRIT</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/store"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary-500',
                pathname === '/store' ? 'text-primary-500' : 'text-muted-foreground'
              )}
            >
              Products
            </Link>
            <Link
              href="/blog"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary-500',
                pathname.startsWith('/blog') ? 'text-primary-500' : 'text-muted-foreground'
              )}
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="default">Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
