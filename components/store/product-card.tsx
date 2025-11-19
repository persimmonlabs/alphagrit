'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/actions/products';

import { useCart } from '@/components/providers/cart-provider';

interface ProductCardProps {
  product: Product;
  currency?: 'BRL' | 'USD';
}

export function ProductCard({ product, currency = 'BRL' }: ProductCardProps) {
  const price = currency === 'BRL' ? product.price_brl : product.price_usd;
  const { addItem } = useCart();
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:border-primary/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {product.short_description || product.description || 'No description available.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(price, currency)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="grid gap-2">
        <Button 
          className="w-full" 
          onClick={() => addItem(product)}
        >
          Add to Cart
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/products/${product.slug}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
