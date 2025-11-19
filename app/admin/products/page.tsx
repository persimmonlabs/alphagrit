import Link from 'next/link'
import Image from 'next/image'
import { getAdminProducts, deleteProduct } from '@/lib/actions/admin/products'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Text, Heading } from '@/components/ui/typography'

export default async function AdminProductsPage() {
  const { data: products, success } = await getAdminProducts()

  if (!success || !products) {
    return (
      <div>
        <Heading level="h2" className="text-destructive">Error loading products</Heading>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level="h1">Products</Heading>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price (BRL)</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                      {product.cover_image_url && (
                        <Image
                          src={product.cover_image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    <div className="text-xs text-muted-foreground">
                      /{product.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={
                      product.status === 'active' ? 'text-green-600' :
                      product.status === 'draft' ? 'text-yellow-600' :
                      'text-muted-foreground'
                    }>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price_brl, 'BRL')}</TableCell>
                  <TableCell>{formatCurrency(product.price_usd, 'USD')}</TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/store/products/${product.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> View Live
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
