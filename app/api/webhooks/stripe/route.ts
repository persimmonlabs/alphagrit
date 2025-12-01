import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Lazy-loaded Supabase admin client (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase admin credentials not configured')
  }

  return createClient(url, key)
}

export async function POST(request: Request) {
  const webhookId = crypto.randomUUID()

  // Verify required env vars
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error(`[Webhook ${webhookId}] STRIPE_WEBHOOK_SECRET not configured`)
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    )
  }

  // Get request body and signature
  let body: string
  let signature: string | null

  try {
    body = await request.text()
    signature = headers().get('stripe-signature')
  } catch (error) {
    console.error(`[Webhook ${webhookId}] Failed to read request:`, error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  if (!signature) {
    console.error(`[Webhook ${webhookId}] Missing stripe-signature header`)
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    console.error(`[Webhook ${webhookId}] Signature verification failed:`, error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.info(`[Webhook ${webhookId}] Received event: ${event.type} (${event.id})`)

  // Get Supabase admin client
  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (error: any) {
    console.error(`[Webhook ${webhookId}] Supabase init failed:`, error.message)
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.metadata) {
          console.warn(`[Webhook ${webhookId}] Session ${session.id} has no metadata`)
          break
        }

        const metadata = session.metadata

        if (metadata.type === 'ebook_purchase') {
          // Validate required metadata (support both ebook_id and legacy sanity_ebook_id)
          const ebookId = metadata.ebook_id || metadata.sanity_ebook_id
          if (!metadata.user_id || !ebookId) {
            console.error(`[Webhook ${webhookId}] Missing required metadata for ebook purchase`)
            break
          }

          // Check for duplicate
          const { data: existing } = await supabaseAdmin
            .from('purchases')
            .select('id')
            .eq('stripe_payment_intent_id', session.payment_intent as string)
            .single()

          if (existing) {
            console.info(`[Webhook ${webhookId}] Duplicate purchase ignored: ${session.payment_intent}`)
            break
          }

          // Record purchase (store in ebook_id, keep sanity_ebook_id for legacy)
          const { error: insertError } = await supabaseAdmin.from('purchases').insert({
            user_id: metadata.user_id,
            ebook_id: ebookId,
            sanity_ebook_id: ebookId, // Keep for backwards compatibility
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: session.amount_total || 0,
            currency: metadata.currency || 'USD',
          })

          if (insertError) {
            console.error(`[Webhook ${webhookId}] Failed to record purchase:`, insertError)
            throw insertError
          }

          console.info(`[Webhook ${webhookId}] Purchase recorded: user=${metadata.user_id}, ebook=${ebookId}`)

        } else if (metadata.type === 'subscription') {
          if (!metadata.user_id || !session.subscription) {
            console.error(`[Webhook ${webhookId}] Missing required data for subscription`)
            break
          }

          // Check for duplicate
          const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', session.subscription as string)
            .single()

          if (existing) {
            console.info(`[Webhook ${webhookId}] Duplicate subscription ignored: ${session.subscription}`)
            break
          }

          // Get subscription details from Stripe
          let subscription: Stripe.Subscription
          try {
            subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          } catch (error: any) {
            console.error(`[Webhook ${webhookId}] Failed to retrieve subscription:`, error.message)
            throw error
          }

          // Record subscription
          const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
            user_id: metadata.user_id,
            stripe_subscription_id: subscription.id,
            plan_type: metadata.plan_type || 'monthly',
            status: 'active',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

          if (insertError) {
            console.error(`[Webhook ${webhookId}] Failed to record subscription:`, insertError)
            throw insertError
          }

          console.info(`[Webhook ${webhookId}] Subscription recorded: user=${metadata.user_id}, plan=${metadata.plan_type}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const status = subscription.status === 'active' ? 'active' :
                      subscription.status === 'past_due' ? 'past_due' : 'canceled'

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error(`[Webhook ${webhookId}] Failed to update subscription:`, updateError)
          throw updateError
        }

        console.info(`[Webhook ${webhookId}] Subscription updated: ${subscription.id} -> ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error(`[Webhook ${webhookId}] Failed to cancel subscription:`, updateError)
          throw updateError
        }

        console.info(`[Webhook ${webhookId}] Subscription canceled: ${subscription.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription as string)

          if (updateError) {
            console.error(`[Webhook ${webhookId}] Failed to mark subscription past_due:`, updateError)
            throw updateError
          }

          console.info(`[Webhook ${webhookId}] Subscription marked past_due: ${invoice.subscription}`)
        }
        break
      }

      default:
        console.info(`[Webhook ${webhookId}] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, eventId: event.id })

  } catch (error: any) {
    console.error(`[Webhook ${webhookId}] Handler error:`, error)

    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Webhook handler failed', eventId: event.id },
      { status: 500 }
    )
  }
}
