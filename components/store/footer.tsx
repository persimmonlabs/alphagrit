import Link from 'next/link'
import { Container } from '@/components/ui/layout'
import { Grid } from '@/components/ui/layout'
import { Stack } from '@/components/ui/layout'
import { Section } from '@/components/ui/layout'
import { Heading } from '@/components/ui/typography'
import { Text } from '@/components/ui/typography'
import { Divider } from '@/components/ui/spacing'
import { ROUTES, CONTACT } from '@/lib/constants'

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

const FOOTER_SECTIONS: Record<string, { title: string; links: FooterLink[] }> = {
  products: {
    title: 'Products',
    links: [
      { label: 'All Products', href: ROUTES.STORE },
      { label: 'E-books', href: ROUTES.STORE },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: ROUTES.BLOG },
      { label: 'Contact', href: '/contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: ROUTES.TERMS },
      { label: 'Privacy Policy', href: ROUTES.PRIVACY },
      { label: 'Refund Policy', href: ROUTES.REFUND },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'WhatsApp', href: CONTACT.WHATSAPP_LINK, external: true },
    ],
  },
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <Section spacing="lg">
        <Container>
          <Grid cols={4} gap="lg">
            {/* Brand */}
            <Stack gap="md">
              <Heading level="h6" weight="black" className="text-primary-500">
                ALPHA GRIT
              </Heading>
              <Text size="sm" color="muted">
                Transform your life through discipline, strength, and relentless action.
              </Text>
            </Stack>

            {/* Footer Links */}
            {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
              <Stack key={key} gap="md">
                <Heading level="h6" weight="semibold">
                  {section.title}
                </Heading>
                <Stack gap="sm">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary-500 transition-colors"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Grid>

          <Divider spacing="lg" />

          <Text size="sm" color="muted" align="center">
            &copy; {currentYear} Alpha Grit. All rights reserved.
          </Text>
        </Container>
      </Section>
    </footer>
  )
}
