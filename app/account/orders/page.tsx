import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/actions/orders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getUserOrders()

  if (!result.success || !result.orders) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Failed to load orders. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orders = result.orders

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      <div className="space-y-4">
        {orders.map((order) => {
          const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
          const statusColor = 
            order.status === 'paid' ? 'bg-green-500' :
            order.status === 'refunded' ? 'bg-gray-500' :
            'bg-yellow-500'

          return (
            <Card key={order.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <Badge className={statusColor}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">${(order.total_amount / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-semibold">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline">
                    <Link href={`/account/orders/${order.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Preview of order items */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2 flex-wrap">
                    {order.order_items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-sm text-muted-foreground">
                        {item.products.name}
                        {item.quantity > 1 && ` (×${item.quantity})`}
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{order.order_items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
