import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params
    const supabase = await createServerClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to download.' },
        { status: 401 }
      )
    }

    // 2. Get download link details
    const { data: downloadLink, error: linkError } = await supabase
      .from('download_links')
      .select(`
        id,
        user_id,
        product_id,
        download_count,
        download_limit,
        expires_at,
        products (
          id,
          name,
          file_url
        )
      `)
      .eq('id', linkId)
      .single()

    if (linkError || !downloadLink) {
      return NextResponse.json(
        { error: 'Download link not found' },
        { status: 404 }
      )
    }

    // 3. Verify ownership
    if (downloadLink.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. This download link does not belong to you.' },
        { status: 403 }
      )
    }

    // 4. Check expiry
    if (downloadLink.expires_at && new Date(downloadLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Download link has expired. Please contact support.' },
        { status: 410 }
      )
    }

    // 5. Check download limit
    if (downloadLink.download_count >= downloadLink.download_limit) {
      return NextResponse.json(
        { error: 'Download limit reached. Please contact support if you need additional downloads.' },
        { status: 403 }
      )
    }

    const product = downloadLink.products as any

    if (!product?.file_url) {
      return NextResponse.json(
        { error: 'Product file not found. Please contact support.' },
        { status: 500 }
      )
    }

    // 6. Increment download count using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Get existing IPs
    const currentIps = (downloadLink as any).ip_addresses || []
    const updatedIps = [...currentIps, clientIp].slice(-10) // Keep last 10 IPs

    const { error: updateError } = await adminSupabase
      .from('download_links')
      .update({
        download_count: downloadLink.download_count + 1,
        ip_addresses: updatedIps,
      })
      .eq('id', linkId)

    if (updateError) {
      console.error('Failed to update download count:', updateError)
      // Continue with download even if tracking fails
    }

    // 7. Generate a signed URL from Supabase Storage
    // Extract bucket and path from file_url
    // Format: https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<path>
    // or: https://<project-id>.supabase.co/storage/v1/object/sign/<bucket>/<path>
    
    try {
      const url = new URL(product.file_url)
      const pathParts = url.pathname.split('/')
      
      // Find bucket and file path
      let bucket = ''
      let filePath = ''
      
      // Parse the URL to extract bucket and path
      const storageIndex = pathParts.indexOf('storage')
      if (storageIndex >= 0 && pathParts[storageIndex + 3]) {
        // Format: /storage/v1/object/public/<bucket>/<path>
        bucket = pathParts[storageIndex + 4] || 'products'
        filePath = pathParts.slice(storageIndex + 5).join('/')
      } else {
        // Fallback: assume it's a direct URL and extract filename
        filePath = pathParts[pathParts.length - 1]
        bucket = 'products'
      }

      // Generate signed URL (valid for 1 hour)
      const { data: signedData, error: signError } = await adminSupabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600)

      if (signError || !signedData) {
        console.error('Failed to generate signed URL:', signError)
        // Fallback to direct file_url if it's public
        return NextResponse.redirect(product.file_url)
      }

      // 8. Redirect to signed URL
      return NextResponse.redirect(signedData.signedUrl)
    } catch (urlError) {
      console.error('Error parsing file URL:', urlError)
      // Fallback: redirect to the file_url directly if public
      return NextResponse.redirect(product.file_url)
    }

  } catch (error) {
    console.error('Download endpoint error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
