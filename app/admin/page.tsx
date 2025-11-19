import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'
import { formatCurrency } from '@/lib/utils'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  // Fetch stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Calculate total revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total, currency, status')
    .eq('status', 'paid')

  let totalRevenueBRL = 0
  let totalRevenueUSD = 0

  orders?.forEach(order => {
    if (order.currency === 'BRL') totalRevenueBRL += order.total
    else if (order.currency === 'USD') totalRevenueUSD += order.total
  })

  // Fetch recent orders for list
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, email, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <Heading level="h1">Dashboard</Heading>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (BRL)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenueBRL, 'BRL')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenueUSD, 'USD')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We can add a chart here later. For now let's just show recent orders since the placeholder is generic */}
            <div className="space-y-4">
              {recentOrders && recentOrders.length > 0 ? (
                 recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(order.total / 100).toFixed(2)}
                      </div>
                      <div className={`text-xs capitalize ${
                        order.status === 'paid' ? 'text-green-600' : 
                        order.status === 'refunded' ? 'text-gray-500' : 'text-yellow-600'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                 ))
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  No recent orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales (Logs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Use the Orders tab for full details.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
