import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/lib/actions/products'
import ProductClientPage from './client-page'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { data: product } = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | Alpha Grit`,
    description: product.short_description || product.description?.substring(0, 160),
    openGraph: {
      images: product.cover_image_url ? [product.cover_image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product } = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  // Fetch related products (exclude current)
  const { data: allProducts } = await getProducts()
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />
}
