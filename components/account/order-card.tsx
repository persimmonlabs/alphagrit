import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ChevronRight, Package } from 'lucide-react';
import type { Order } from '@/lib/types/account';

interface OrderCardProps {
  order: Order;
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-green-500/10 text-green-500',
  refunded: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-gray-500/10 text-gray-500',
};

const refundStatusColors = {
  none: '',
  requested: 'bg-blue-500/10 text-blue-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  completed: 'bg-green-500/10 text-green-500',
};

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Order #{order.order_number}
            </p>
            <p className="text-sm text-muted-foreground">{orderDate}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColors[order.status]}>
              {order.status.toUpperCase()}
            </Badge>
            {order.refund_status !== 'none' && (
              <Badge className={refundStatusColors[order.refund_status]}>
                Refund: {order.refund_status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.product.cover_image ? (
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border">
                  <Image
                    src={item.product.cover_image}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded border bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">
                  {item.product.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 3} more item(s)
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/account/orders/${order.id}`}>
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
