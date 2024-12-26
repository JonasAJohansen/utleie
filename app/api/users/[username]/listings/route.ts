import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    // The username parameter is actually a user ID in this case
    const userId = username

    const result = await sql`
      SELECT 
        l.id,
        l.name,
        l.description,
        l.price,
        l.location,
        COALESCE(AVG(r.rating)::numeric(10,2), 0)::float as rating,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ),
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id
            ORDER BY lp.display_order
            LIMIT 1
          )
        ) as image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE u.id = ${userId}
      GROUP BY l.id, l.name, l.description, l.price, l.location
      ORDER BY l.created_at DESC
    `

    const listings = result.rows.map(listing => ({
      ...listing,
      rating: parseFloat(listing.rating) || 0
    }))

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 