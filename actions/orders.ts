'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  products: {
    id: string
    name: string
    image_url: string | null
  }
}

export interface Order {
  id: string
  user_id: string
  stripe_payment_intent: string
  total_amount: number
  status: 'pending' | 'paid' | 'refunded'
  email: string
  created_at: string
  order_items: OrderItem[]
}

export async function getUserOrders(): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        stripe_payment_intent,
        total_amount,
        status,
        email,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return { success: false, error: 'Failed to fetch orders' }
    }

    return { success: true, orders: data as unknown as Order[] }
  } catch (error) {
    console.error('Get user orders error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getOrderById(orderId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        stripe_payment_intent,
        total_amount,
        status,
        email,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return { success: false, error: 'Order not found' }
    }

    return { success: true, order: data as unknown as Order }
  } catch (error) {
    console.error('Get order by ID error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function refundOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'refunded') {
      return { success: false, error: 'Order is already refunded' }
    }

    if (order.status !== 'paid') {
      return { success: false, error: 'Only paid orders can be refunded' }
    }

    // Check if order is within refund window (e.g., 30 days)
    const orderDate = new Date(order.created_at)
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceOrder > 30) {
      return { success: false, error: 'Refund period has expired (30 days)' }
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent,
    })

    if (refund.status !== 'succeeded' && refund.status !== 'pending') {
      return { success: false, error: 'Refund failed. Please contact support.' }
    }

    // Update order status using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    const { error: updateError } = await (adminSupabase
      .from('orders') as any)
      .update({ status: 'refunded' })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return { success: false, error: 'Refund processed but status update failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Refund order error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Admin functions
export async function getAllOrders(filters?: {
  status?: string
  startDate?: string
  endDate?: string
}): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        stripe_payment_intent,
        total_amount,
        status,
        email,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        )
      `)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return { success: false, error: 'Failed to fetch orders' }
    }

    return { success: true, orders: data as unknown as Order[] }
  } catch (error) {
    console.error('Get all orders error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getAdminOrderById(orderId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        stripe_payment_intent,
        total_amount,
        status,
        email,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return { success: false, error: 'Order not found' }
    }

    return { success: true, order: data as unknown as Order }
  } catch (error) {
    console.error('Get admin order by ID error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function adminRefundOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'refunded') {
      return { success: false, error: 'Order is already refunded' }
    }

    if (order.status !== 'paid') {
      return { success: false, error: 'Only paid orders can be refunded' }
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent,
    })

    if (refund.status !== 'succeeded' && refund.status !== 'pending') {
      return { success: false, error: 'Refund failed. Please contact support.' }
    }

    // Update order status using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    const { error: updateError } = await (adminSupabase
      .from('orders') as any)
      .update({ status: 'refunded' })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return { success: false, error: 'Refund processed but status update failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Admin refund order error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
