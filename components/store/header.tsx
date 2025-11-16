'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Flex } from '@/components/ui/layout'
import { Container } from '@/components/ui/layout'
import { MobileOnly, DesktopOnly } from '@/components/ui/responsive'
import { Text } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

const NAV_ITEMS = [
  { label: 'Products', href: ROUTES.STORE },
  { label: 'Blog', href: ROUTES.BLOG },
] as const

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <Flex
          justify="between"
          align="center"
          className="h-16"
        >
          {/* Logo */}
          <Link href={ROUTES.STORE} className="flex items-center">
            <Text
              as="span"
              size="2xl"
              weight="bold"
              className="text-primary-500 tracking-tight"
            >
              ALPHA GRIT
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <DesktopOnly>
            <nav>
              <Flex gap="lg">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary-500',
                      pathname === item.href ? 'text-primary-500' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </Flex>
            </nav>
          </DesktopOnly>

          {/* Actions */}
          <Flex gap="md" align="center">
            <Link href={ROUTES.CART}>
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href={ROUTES.ACCOUNT}>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <DesktopOnly>
              <Link href={ROUTES.SIGNIN}>
                <Button variant="default">Sign In</Button>
              </Link>
            </DesktopOnly>
          </Flex>
        </Flex>

        {/* Mobile Navigation */}
        <MobileOnly>
          <Flex
            gap="md"
            justify="center"
            className="pb-4 border-t mt-2 pt-2"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-500 px-3 py-2',
                  pathname === item.href ? 'text-primary-500' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </Flex>
        </MobileOnly>
      </Container>
    </header>
  )
}
