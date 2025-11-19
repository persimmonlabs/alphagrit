import { Heading } from '@/components/ui/typography'
import { ProductForm } from '@/components/admin/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Heading level="h1">Create Product</Heading>
      <ProductForm />
    </div>
  )
}
