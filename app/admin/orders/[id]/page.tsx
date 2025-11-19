import { createServerClient } from '@/lib/supabase/server'
import { getAdminOrderById } from '@/actions/orders'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import AdminRefundButton from './admin-refund-button'

interface AdminOrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const supabase = await createServerClient()

  // Check admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const result = await getAdminOrderById(params.id)

  if (!result.success || !result.order) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Order not found</p>
            <Button asChild className="mt-4">
              <Link href="/admin/orders">Back to Orders</Link>
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <Badge className={statusColor}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      {item.products.image_url ? (
                        <Image
                          src={item.products.image_url}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.products.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${(item.price_at_purchase / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right font-medium">
                      ${((item.price_at_purchase * item.quantity) / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount</span>
              <span className="text-xl font-bold">${(order.total_amount / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">User ID</span>
                <p className="font-mono text-xs">{order.user_id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Payment Intent</span>
                <p className="font-mono text-xs break-all">{order.stripe_payment_intent}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {canRefund ? (
                <AdminRefundButton orderId={order.id} />
              ) : order.status === 'refunded' ? (
                <Button disabled variant="secondary" className="w-full">Refunded</Button>
              ) : (
                 <Button disabled variant="secondary" className="w-full">Cannot Refund</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
