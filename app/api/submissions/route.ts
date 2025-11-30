import { NextRequest, NextResponse } from 'next/server'

// This endpoint was used for the old Python backend submission system.
// It has been deprecated in favor of direct form submissions to external services
// or Sanity forms if needed.

export async function POST(request: NextRequest) {
  console.warn('[Submissions API] This endpoint is deprecated')

  return NextResponse.json(
    {
      error: 'DEPRECATED',
      message: 'This submission endpoint is no longer available.',
    },
    { status: 410 } // HTTP 410 Gone
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'DEPRECATED',
      message: 'This endpoint is no longer available.',
    },
    { status: 410 }
  )
}
