'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Container, Section, Stack } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { Spacer } from '@/components/ui/spacing'
import { CheckCircle, Download } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  useEffect(() => {
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  if (!sessionId) {
    return (
      <Container>
        <Section spacing="2xl">
          <Stack gap="lg" align="center" className="text-center">
            <Heading level="h2">Invalid Session</Heading>
            <Button asChild>
              <Link href="/store">Return to Store</Link>
            </Button>
          </Stack>
        </Section>
      </Container>
    )
  }

  return (
    <Container>
      <Section spacing="2xl">
        <Stack gap="xl" align="center" className="text-center max-w-xl mx-auto">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>

          <Heading level="h1">Payment Successful!</Heading>
          
          <Text size="lg" color="muted">
            Thank you for your purchase. Your order has been confirmed and your download links have been sent to your email.
          </Text>

          <div className="w-full rounded-xl border bg-muted/30 p-6 text-left">
            <Text size="sm" color="muted" className="uppercase tracking-wider font-semibold mb-2">
              Next Steps
            </Text>
            <ul className="space-y-2 text-sm">
              <li>1. Check your email for the order confirmation.</li>
              <li>2. Click the links in the email to download your files.</li>
              <li>3. You can also access your downloads in your account.</li>
            </ul>
          </div>

          <Spacer size="md" />

          <Stack gap="md" className="w-full sm:w-auto">
            <Button size="xl" asChild>
              <Link href="/account/ebooks">
                <Download className="mr-2 h-4 w-4" />
                Go to My Downloads
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/store">Continue Shopping</Link>
            </Button>
          </Stack>
        </Stack>
      </Section>
    </Container>
  )
}
