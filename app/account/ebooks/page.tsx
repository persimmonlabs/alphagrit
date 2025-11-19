import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'
import { formatDate, isDownloadExpired } from '@/lib/utils'
import { Download, Clock, AlertCircle } from 'lucide-react'

export default async function MyEbooksPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch download links with product info
  const { data: downloadLinks, error } = await supabase
    .from('download_links')
    .select(`
      id,
      product_id,
      download_count,
      download_limit,
      expires_at,
      created_at,
      products (
        id,
        name,
        slug,
        cover_image_url,
        type
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ebooks:', error)
  }

  const ebooks = downloadLinks || []

  if (ebooks.length === 0) {
    return (
      <div className="container py-12 max-w-6xl">
        <div className="space-y-6">
          <Heading level="h1">My E-books</Heading>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <Heading level="h3" className="mb-2">No E-books Yet</Heading>
              <Text color="muted" className="mb-6 max-w-md">
                You haven&apos;t purchased any e-books yet. Browse our store to find your next read.
              </Text>
              <Button asChild>
                <Link href="/store">Browse Store</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-6xl">
      <div className="space-y-8">
        <div>
          <Heading level="h1" className="mb-2">My E-books</Heading>
          <Text color="muted">Access your purchased digital products</Text>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((link: any) => {
            const product = link.products
            const isExpired = link.expires_at ? isDownloadExpired(link.expires_at) : false
            const downloadsRemaining = link.download_limit - link.download_count

            return (
              <Card key={link.id} className="overflow-hidden flex flex-col">
                {/* Cover Image */}
                <div className="relative aspect-[3/4] w-full bg-muted">
                  {product?.cover_image_url ? (
                    <Image
                      src={product.cover_image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{product?.name || 'Unknown Product'}</CardTitle>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Purchased {formatDate(link.created_at)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow flex flex-col justify-end gap-4">
                  {/* Download Status */}
                  <div className="text-sm">
                    {isExpired ? (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>Link expired</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Downloads:</span>
                        <span className="font-medium">
                          {link.download_count}/{link.download_limit}
                        </span>
                      </div>
                    )}
                    {!isExpired && link.expires_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Valid until {formatDate(link.expires_at)}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  {isExpired || downloadsRemaining <= 0 ? (
                    <Button variant="outline" disabled className="w-full">
                      {isExpired ? 'Expired' : 'Download Limit Reached'}
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/api/download/${link.id}`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download ({downloadsRemaining} left)
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
