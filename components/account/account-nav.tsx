'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    title: 'Dashboard',
    href: '/account',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/account/orders',
    icon: ShoppingBag,
  },
  {
    title: 'E-books',
    href: '/account/ebooks',
    icon: BookOpen,
  },
  {
    title: 'Settings',
    href: '/account/settings',
    icon: Settings,
  },
];

export function AccountNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full justify-start"
        >
          {mobileMenuOpen ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Close Menu
            </>
          ) : (
            <>
              <Menu className="mr-2 h-4 w-4" />
              Account Menu
            </>
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'lg:block',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/account' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
