import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

const submissionSchema = z.object({
  website_url: z.string().url(),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  challenge: z.string().optional(),
  enrichment_data: z.record(z.unknown()).optional(),
  locale: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = submissionSchema.parse(body)

    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'API Error' }))
      console.error('API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to submit data' },
        { status: response.status }
      )
    }

    const submission = await response.json()
    return NextResponse.json({ success: true, data: submission }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
