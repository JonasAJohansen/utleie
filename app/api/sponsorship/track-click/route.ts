import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Update click count for sponsored listing
    await sql`
      UPDATE sponsored_listings 
      SET clicks_count = clicks_count + 1
      WHERE listing_id = ${listingId}::uuid
        AND is_active = true
        AND expires_at > CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking sponsored listing click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}
