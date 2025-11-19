import { getProducts } from '@/lib/actions/products'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/layout'
import { Section } from '@/components/ui/layout'
import { Stack } from '@/components/ui/layout'
import { Inline } from '@/components/ui/layout'
import { Display } from '@/components/ui/typography'
import { Text } from '@/components/ui/typography'
import { Heading } from '@/components/ui/typography'
import { Spacer } from '@/components/ui/spacing'
import Link from 'next/link'

export default async function StorePage() {
  const { data: products, success } = await getProducts();

  return (
    <Container>
      {/* Hero Section */}
      <Section spacing="xl">
        <Stack gap="xl" align="center">
          <Display size="lg" gradient="brand" className="text-center">
            Dominate Every Area of Your Life
          </Display>

          <Text
            size="xl"
            color="muted"
            align="center"
            className="max-w-3xl"
          >
            Science-based transformation system for modern men. Not temporary motivation—total reconstruction.
          </Text>

          <Spacer size="md" />

          <Inline gap="md" justify="center">
            <Button size="lg" asChild>
              <Link href="#products">Browse Products</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">Read the Blog</Link>
            </Button>
          </Inline>
        </Stack>
      </Section>

      {/* Products Section */}
      <Section spacing="xl" id="products">
        <Stack gap="2xl">
          <Heading level="h2" align="center">
            Our Products
          </Heading>

          {success && products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Stack gap="lg" align="center">
              <Text size="lg" color="muted" align="center">
                No products available at the moment.
              </Text>
              <Text size="sm" color="muted" align="center">
                Please check back later or contact support.
              </Text>
            </Stack>
          )}
        </Stack>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl">
        <div className="bg-primary-500/10 dark:bg-primary-500/20 rounded-2xl p-8 sm:p-12 lg:p-16">
          <Stack gap="xl" align="center">
            <Heading level="h2" align="center">
              Ready to Transform?
            </Heading>

            <Text
              size="lg"
              color="muted"
              align="center"
              className="max-w-2xl"
            >
              Join thousands of men who have taken control of their lives through discipline and action.
            </Text>

            <Spacer size="sm" />

            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started Now</Link>
            </Button>
          </Stack>
        </div>
      </Section>
    </Container>
  )
}
