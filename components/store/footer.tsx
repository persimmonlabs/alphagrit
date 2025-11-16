import Link from 'next/link'
import { CONTACT } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-primary-500">ALPHA GRIT</h3>
            <p className="text-sm text-muted-foreground">
              Transform your life through discipline, strength, and relentless action.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/store" className="hover:text-primary-500">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-primary-500">
                  E-books
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-primary-500">
                  Blog
                </Link>
              </li>
              <li>
                <a href={CONTACT.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/legal/terms" className="hover:text-primary-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-primary-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="hover:text-primary-500">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Alpha Grit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
