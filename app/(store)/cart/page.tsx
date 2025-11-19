'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Container, Section, Stack, Flex } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { Spacer } from '@/components/ui/spacing'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, subtotal, currency, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <Container>
        <Section spacing="xl">
          <Stack gap="lg" align="center" className="text-center">
            <Heading level="h2">Your Cart is Empty</Heading>
            <Text size="lg" color="muted">
              It looks like you haven&apos;t added any products yet.
            </Text>
            <Spacer size="md" />
            <Button size="lg" asChild>
              <Link href="/store">Start Shopping</Link>
            </Button>
          </Stack>
        </Section>
      </Container>
    )
  }

  return (
    <Container>
      <Section spacing="xl">
        <Heading level="h1" className="mb-8">
          Shopping Cart ({totalItems})
        </Heading>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <Stack gap="lg">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-6 rounded-xl border p-6 sm:flex-row sm:items-center"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32">
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <Text size="lg" weight="bold" className="mb-1">
                        {item.name}
                      </Text>
                      <Text size="sm" color="muted" className="line-clamp-1">
                        {item.short_description}
                      </Text>
                      <Text size="sm" color="primary" className="mt-1 font-medium uppercase">
                        {item.type}
                      </Text>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <Text size="xl" weight="bold" className="tabular-nums">
                        {formatCurrency(
                          currency === 'BRL' ? item.price_brl : item.price_usd,
                          currency
                        )}
                      </Text>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Stack>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-xl border bg-muted/20 p-6">
              <Heading level="h3" className="mb-6">
                Order Summary
              </Heading>

              <Stack gap="md">
                <Flex justify="between">
                  <Text color="muted">Subtotal</Text>
                  <Text weight="medium">{formatCurrency(subtotal, currency)}</Text>
                </Flex>
                
                <div className="h-px w-full bg-border" />

                <Flex justify="between">
                  <Text size="lg" weight="bold">Total</Text>
                  <Text size="xl" weight="bold" color="primary">
                    {formatCurrency(subtotal, currency)}
                  </Text>
                </Flex>

                <Spacer size="sm" />

                <Button size="lg" className="w-full group" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Text size="xs" color="muted" align="center" className="mt-4">
                  Secure checkout powered by Stripe.
                  <br />
                  Instant access after payment.
                </Text>
              </Stack>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  )
}
