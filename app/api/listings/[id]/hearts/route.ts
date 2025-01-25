import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params)
  const listingId = resolvedParams.id

  try {
    // Get the count of hearts/favorites for this listing
    const result = await sql`
      SELECT COUNT(*) as count
      FROM favorites
      WHERE listing_id = ${listingId}::uuid
    `

    return NextResponse.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Error fetching heart count:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 