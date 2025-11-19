'use server'

import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { CartItem } from '@/components/providers/cart-provider'

interface CheckoutParams {
  items: CartItem[]
  currency: 'BRL' | 'USD'
  guestEmail?: string
  guestName?: string
}

export async function createCheckoutSession({ 
  items, 
  currency, 
  guestEmail, 
  guestName 
}: CheckoutParams) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const origin = headers().get('origin')

    if (!user && !guestEmail) {
      return { success: false, error: 'Email is required for guest checkout' }
    }

    // 1. Validate items and get Stripe Price IDs from DB
    const productIds = items.map(item => item.id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, stripe_price_id_brl, stripe_price_id_usd, name')
      .in('id', productIds)

    if (productsError || !products) {
      return { success: false, error: 'Failed to validate products' }
    }

    // 2. Build Line Items
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.id)
      if (!product) throw new Error(`Product ${item.name} not found`)

      const priceId = currency === 'BRL' 
        ? product.stripe_price_id_brl 
        : product.stripe_price_id_usd

      if (!priceId) throw new Error(`Price not found for ${item.name}`)

      return {
        price: priceId,
        quantity: item.quantity,
      }
    })

    // 3. Handle Customer
    let customerId: string | undefined

    if (user) {
      // Check if we have a stripe_customer_id for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else {
        // Create customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        })
        customerId = customer.id
        
        // Save to profile
        // Note: You might need to add stripe_customer_id to profiles table if not present
        // For now, we'll skip saving if the column doesn't exist or handle it elsewhere
      }
    } else if (guestEmail) {
      // For guests, we can let Stripe handle customer creation or search by email
      // Or create one explicitly. Explicit is better for tracking.
      const customers = await stripe.customers.list({ email: guestEmail, limit: 1 })
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: guestEmail,
          name: guestName,
        })
        customerId = customer.id
      }
    }

    // 4. Create Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`, // Or /checkout if we want them to stay there
      metadata: {
        user_id: user?.id || null,
        currency,
        guest_email: guestEmail || null,
        guest_name: guestName || null,
      },
      payment_method_types: ['card'],
      // If we want to collect addresses
      // billing_address_collection: 'required', 
    })

    if (!session.url) {
      return { success: false, error: 'Failed to create checkout session URL' }
    }

    return { success: true, url: session.url }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return { success: false, error: error.message || 'Failed to initiate checkout' }
  }
}
