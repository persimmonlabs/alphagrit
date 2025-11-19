import { createServerClient } from '@/lib/supabase/server'
import { getAllOrders } from '@/actions/orders'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
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

  const result = await getAllOrders({
    status: searchParams.status,
  })

  if (!result.success || !result.orders) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load orders: {result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orders = result.orders

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Button asChild variant={!searchParams.status ? "default" : "outline"} size="sm">
          <Link href="/admin/orders">All</Link>
        </Button>
        <Button asChild variant={searchParams.status === "paid" ? "default" : "outline"} size="sm">
          <Link href="/admin/orders?status=paid">Paid</Link>
        </Button>
        <Button asChild variant={searchParams.status === "pending" ? "default" : "outline"} size="sm">
          <Link href="/admin/orders?status=pending">Pending</Link>
        </Button>
        <Button asChild variant={searchParams.status === "refunded" ? "default" : "outline"} size="sm">
          <Link href="/admin/orders?status=refunded">Refunded</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
                  const statusColor = 
                    order.status === 'paid' ? 'bg-green-500' :
                    order.status === 'refunded' ? 'bg-gray-500' :
                    'bg-yellow-500'

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.email}</TableCell>
                      <TableCell>{itemCount}</TableCell>
                      <TableCell>${(order.total_amount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View order</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
