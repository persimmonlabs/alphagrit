import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateDownload } from '@/lib/downloads/validate-download';
import { generateSignedUrl } from '@/lib/downloads/generate-signed-url';
import { trackDownload } from '@/lib/downloads/track-download';

/**
 * Secure download endpoint for purchased products
 *
 * Security checks:
 * 1. User authentication
 * 2. Product ownership verification
 * 3. Download link expiry validation
 * 4. Download limit enforcement (5 max)
 * 5. IP address tracking
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate download eligibility
 * 3. Generate signed URL (1 hour expiry)
 * 4. Track download event
 * 5. Redirect to signed URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    // 1. Authenticate user
    const supabase = createServerComponentClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to download.' },
        { status: 401 }
      );
    }

    // 2. Validate download eligibility
    const validation = await validateDownload(user.id, productId);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    if (!validation.linkId || !validation.filePath) {
      return NextResponse.json(
        { error: 'Invalid download configuration. Please contact support.' },
        { status: 500 }
      );
    }

    // 3. Generate signed URL from Supabase Storage (1 hour expiry)
    const signedUrl = await generateSignedUrl(validation.filePath, 3600);

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download link. Please try again or contact support.' },
        { status: 500 }
      );
    }

    // 4. Track download event
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const trackingResult = await trackDownload(validation.linkId, clientIp);

    if (!trackingResult.success) {
      return NextResponse.json(
        { error: trackingResult.error || 'Failed to track download' },
        { status: 403 }
      );
    }

    // 5. Redirect to signed URL for download
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('Download endpoint error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for download service
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const validation = await validateDownload(user.id, productId);

    if (!validation.valid) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Downloads-Remaining': String(
          (validation.maxDownloads || 5) - (validation.downloadCount || 0)
        ),
        'X-Expires-At': validation.expiresAt || ''
      }
    });

  } catch (error) {
    console.error('Download health check error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
