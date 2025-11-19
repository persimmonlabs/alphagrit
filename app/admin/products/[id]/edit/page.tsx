import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Heading } from '@/components/ui/typography'
import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = await createServerClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Heading level="h1">Edit Product</Heading>
      <ProductForm initialData={product} isEditing />
    </div>
  )
}
