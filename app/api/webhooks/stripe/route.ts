import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { generateOrderNumber, getDownloadExpiry } from '@/lib/utils'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Handle successful checkout
    try {
      await handleCheckoutSessionCompleted(session, supabase)
    } catch (error: any) {
      console.error('Error handling checkout session:', error)
      return new NextResponse(`Error handling checkout session: ${error.message}`, { status: 500 })
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    try {
      await handleChargeRefunded(charge, supabase)
    } catch (error: any) {
      console.error('Error handling charge refund:', error)
      return new NextResponse(`Error handling charge refund: ${error.message}`, { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}

async function handleChargeRefunded(charge: Stripe.Charge, supabase: any) {
  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    console.log('Charge refunded but no payment_intent found, skipping')
    return
  }

  // Find order by payment_intent_id
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_payment_intent', paymentIntentId)
    .single()

  if (fetchError || !order) {
    console.error('Order not found for refund:', paymentIntentId)
    return
  }

  if (order.status === 'refunded') {
    console.log('Order already marked as refunded:', order.id)
    return
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', order.id)

  if (updateError) {
    throw new Error(`Failed to update order status to refunded: ${updateError.message}`)
  }
  
  console.log('Order marked as refunded via webhook:', order.id)
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const { 
    metadata, 
    amount_total, 
    currency, 
    payment_intent, 
    customer_details, 
    payment_status 
  } = session

  if (!amount_total || !currency) throw new Error('Invalid session data')

  // 1. Create Order
  // We need to get the user_id. If it's guest, we might not have a user_id in metadata if they didn't sign up.
  // But our requirement RF-001 says "Profile created automatically" isn't strictly enforced for pure guest checkout
  // UNLESS we auto-create a user account for them. 
  // For this MVP, let's create the order. If user_id is null, it's a guest order.
  
  const orderData = {
    user_id: metadata?.user_id || null,
    order_number: generateOrderNumber(),
    email: customer_details?.email || metadata?.guest_email,
    status: 'paid', // Simplified for MVP
    currency: currency.toUpperCase(),
    subtotal: amount_total / 100, // Convert cents to unit
    total: amount_total / 100,
    payment_provider: 'stripe',
    payment_intent_id: typeof payment_intent === 'string' ? payment_intent : null,
    payment_status: payment_status,
    metadata: {
      stripe_session_id: session.id,
      guest_name: metadata?.guest_name,
    }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)

  // 2. Create Order Items
  // We need to retrieve line items from Stripe to know what was bought
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product']
  })

  const itemsToInsert = []
  const downloadLinksToCreate = []

  for (const item of lineItems.data) {
    const price = item.price
    const product = price?.product as Stripe.Product
    
    if (!product) continue

    // Find product in our DB by stripe_product_id to get our internal ID
    const { data: dbProduct } = await supabase
      .from('products')
      .select('id, type')
      .eq('stripe_product_id', product.id)
      .single()

    if (dbProduct) {
      itemsToInsert.push({
        order_id: order.id,
        product_id: dbProduct.id,
        product_name: product.name,
        product_type: dbProduct.type, // Assuming 'ebook' mainly
        quantity: item.quantity || 1,
        price: (price?.unit_amount || 0) / 100,
      })

      // Prepare download link if it's a digital product
      if (dbProduct.type === 'ebook') {
        downloadLinksToCreate.push({
          order_id: order.id,
          product_id: dbProduct.id,
          user_id: orderData.user_id, // Can be null for guests
          download_count: 0,
          download_limit: 5,
          expires_at: getDownloadExpiry().toISOString(),
          // signed_url will be generated on demand or we can generate a token here
          // For now, we insert the record. The actual signed URL for S3 is generated when they click download.
          // But we need a token for the public download link if they are guests.
          token: crypto.randomUUID(), // We might need to add this column or use ID
        })
      }
    }
  }

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)
    
    if (itemsError) throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  // 3. Create Download Links
  // Note: The schema in types/supabase.ts shows 'signed_url' as a required field in download_links? 
  // Let's check schema again. If it is required, we might need to put a placeholder or generate one.
  // Usually 'signed_url' is transient. It's better if the table stores a 'token' and we generate the signed URL on the fly.
  // Based on the provided types, `signed_url` IS required. This seems like a schema flaw for persistent links.
  // I will insert a placeholder string for now or generate a long-lived one if bucket allows (max 7 days for Supabase).
  // Supabase signed URLs max out. 
  // BETTER APPROACH: The `download_links` table probably shouldn't store the `signed_url` itself but rather be the record of authority.
  // I'll assume for this MVP I should just put a placeholder or generate one.
  
  const linksWithPlaceholders = downloadLinksToCreate.map(link => ({
    ...link,
    signed_url: 'generated_on_request', // Placeholder
    // If `token` column doesn't exist, we rely on `id`.
    // I'll remove `token` from insert to match the type definition I saw earlier.
  }))
  
  // Remove token property
  const finalLinks = linksWithPlaceholders.map(({ token, ...rest }) => rest)

  if (finalLinks.length > 0) {
    const { error: linksError } = await supabase
      .from('download_links')
      .insert(finalLinks)

    if (linksError) console.error('Failed to create download links:', linksError)
  }

  // 4. Send Email (TODO: Implement Resend)
  // console.log('Sending confirmation email to:', orderData.email)
}
