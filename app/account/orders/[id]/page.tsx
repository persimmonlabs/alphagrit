import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById } from '@/actions/orders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import RefundButton from './refund-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getOrderById(params.id)

  if (!result.success || !result.order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order Not Found</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Button asChild className="mt-4">
              <Link href="/account/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = result.order

  const statusColor = 
    order.status === 'paid' ? 'bg-green-500' :
    order.status === 'refunded' ? 'bg-gray-500' :
    'bg-yellow-500'

  const canRefund = order.status === 'paid'
  const orderDate = new Date(order.created_at)
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  const isWithinRefundWindow = daysSinceOrder <= 30

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <CardDescription>
                Placed on {orderDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </div>
            <Badge className={statusColor}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Intent</p>
                <p className="font-mono text-sm">{order.stripe_payment_intent.slice(0, 20)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg">${(order.total_amount / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    {item.products.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.products.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      ${(item.price_at_purchase / 100).toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${((item.price_at_purchase * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Refund Section */}
          {canRefund && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Request Refund</h3>
              {isWithinRefundWindow ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can request a refund within 30 days of purchase. You have {30 - daysSinceOrder} days remaining.
                  </p>
                  <RefundButton orderId={order.id} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The refund period (30 days) has expired for this order.
                </p>
              )}
            </div>
          )}

          {order.status === 'refunded' && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Refund Information</h3>
              <p className="text-sm text-muted-foreground">
                This order has been refunded. The refund should appear in your account within 5-10 business days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
