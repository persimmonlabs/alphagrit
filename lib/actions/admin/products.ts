'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  price_brl: z.number().min(0),
  price_usd: z.number().min(0),
  type: z.enum(['ebook', 'physical', 'subscription']),
  category: z.string().nullable(),
  status: z.enum(['draft', 'active', 'archived']),
  cover_image_url: z.string().nullable(),
  file_url: z.string().nullable(),
  file_size_bytes: z.number().nullable(),
})

export type ProductFormData = z.infer<typeof productSchema>

export async function getAdminProducts() {
  const supabase = await createServerClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin products:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: products }
}

import { stripe } from '@/lib/stripe'

export async function createProduct(data: ProductFormData) {
  try {
    const supabase = await createServerClient()
    
    // Validate data
    const validatedData = productSchema.parse(data)

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: validatedData.name,
      description: validatedData.short_description || undefined,
      images: validatedData.cover_image_url ? [validatedData.cover_image_url] : undefined,
      metadata: {
        slug: validatedData.slug,
        type: validatedData.type,
      },
    })

    // Create Prices in Stripe
    const priceBrl = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'brl',
      unit_amount: Math.round(validatedData.price_brl * 100), // Stripe uses cents
    })

    const priceUsd = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'usd',
      unit_amount: Math.round(validatedData.price_usd * 100),
    })

    // Insert into Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        stripe_product_id: stripeProduct.id,
        stripe_price_id_brl: priceBrl.id,
        stripe_price_id_usd: priceUsd.id,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/store')
    
    return { success: true, data: product }
  } catch (error: any) {
    console.error('Create product error:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  try {
    const supabase = await createServerClient()
    
    // Get existing product to get Stripe IDs
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('stripe_product_id, price_brl, price_usd')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return { success: false, error: 'Product not found' }
    }

    const updateData: any = { ...data }

    // Update Stripe Product if needed
    if (data.name || data.short_description || data.cover_image_url) {
      await stripe.products.update(existingProduct.stripe_product_id!, {
        name: data.name,
        description: data.short_description || undefined,
        images: data.cover_image_url ? [data.cover_image_url] : undefined,
      })
    }

    // Update Price BRL if changed
    if (data.price_brl !== undefined && data.price_brl !== existingProduct.price_brl) {
      const newPriceBrl = await stripe.prices.create({
        product: existingProduct.stripe_product_id!,
        currency: 'brl',
        unit_amount: Math.round(data.price_brl * 100),
      })
      updateData.stripe_price_id_brl = newPriceBrl.id
      
      // Archive old price (optional, good practice)
      // await stripe.prices.update(existingProduct.stripe_price_id_brl!, { active: false })
    }

    // Update Price USD if changed
    if (data.price_usd !== undefined && data.price_usd !== existingProduct.price_usd) {
      const newPriceUsd = await stripe.prices.create({
        product: existingProduct.stripe_product_id!,
        currency: 'usd',
        unit_amount: Math.round(data.price_usd * 100),
      })
      updateData.stripe_price_id_usd = newPriceUsd.id
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/store')
    
    return { success: true }
  } catch (error: any) {
    console.error('Update product error:', error)
    return { success: false, error: error.message || 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/store')
    
    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
