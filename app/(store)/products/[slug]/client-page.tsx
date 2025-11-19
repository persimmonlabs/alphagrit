'use client'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import { Container, Section, Stack } from '@/components/ui/layout'
import { Heading, Text, Display } from '@/components/ui/typography'
import { formatCurrency } from '@/lib/utils'
import { renderTiptapContent } from '@/lib/blog/tiptap-renderer'
import { ProductCard } from '@/components/store/product-card'
import { useCart } from '@/components/providers/cart-provider'

interface ProductClientPageProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductClientPage({ product, relatedProducts }: ProductClientPageProps) {
  const { addItem } = useCart()

  const htmlDescription = product.description 
    ? renderTiptapContent(product.description) 
    : ''

  return (
    <Container>
      <Section spacing="xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
            {product.cover_image_url ? (
              <Image
                src={product.cover_image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <Stack gap="lg">
              <div>
                <Text size="sm" color="primary" className="font-semibold uppercase tracking-wider">
                  {product.type === 'ebook' ? 'Digital Product' : product.type}
                </Text>
                <Display size="sm" as="h1">
                  {product.name}
                </Display>
              </div>

              <div className="flex items-baseline gap-4">
                <Text size="2xl" weight="bold" color="primary">
                  {formatCurrency(product.price_brl, 'BRL')}
                </Text>
                {product.price_usd > 0 && (
                  <Text size="lg" color="muted">
                    / {formatCurrency(product.price_usd, 'USD')}
                  </Text>
                )}
              </div>

              <Text size="lg" color="muted">
                {product.short_description}
              </Text>

              <div className="h-px w-full bg-border" />

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="xl" className="flex-1" onClick={() => addItem(product)}>
                  Add to Cart
                </Button>
                <Button size="xl" variant="outline" className="flex-1" onClick={() => addItem(product)} asChild>
                  <Link href="/cart">Buy Now</Link>
                </Button>
              </div>

              {/* Trust Badges / Features */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
              </div>
            </Stack>
          </div>
        </div>
      </Section>

      {/* Product Description */}
      {htmlDescription && (
        <Section spacing="xl" className="border-t bg-muted/30">
          <div className="mx-auto max-w-3xl">
            <Heading level="h2" className="mb-8 text-center">
              Description
            </Heading>
            <div 
              className="prose prose-lg dark:prose-invert mx-auto"
              dangerouslySetInnerHTML={{ __html: htmlDescription }}
            />
          </div>
        </Section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Section spacing="xl" className="border-t">
          <Stack gap="xl">
            <Heading level="h2" align="center">
              You Might Also Like
            </Heading>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Stack>
        </Section>
      )}
    </Container>
  )
}
