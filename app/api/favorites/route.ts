import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await sql`
      SELECT 
        f.id,
        f.listing_id,
        l.name,
        l.price,
        lp.url as image,
        COALESCE(AVG(r.rating)::numeric(10,1), 0) as rating,
        l.location
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      LEFT JOIN listing_photos lp ON l.id = lp.listing_id AND lp.is_main = true
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE f.user_id = ${userId}
      GROUP BY f.id, f.listing_id, l.name, l.price, lp.url, l.location
      ORDER BY f.created_at DESC
    `
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return new NextResponse('Error fetching favorites', { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { listingId } = await request.json()

    // Check if the favorite already exists
    const existingFavorite = await sql`
      SELECT id FROM favorites
      WHERE user_id = ${userId} AND listing_id = ${listingId}::uuid
    `

    if (existingFavorite.rows.length > 0) {
      return new NextResponse('Already in favorites', { status: 400 })
    }

    // Add to favorites
    const result = await sql`
      INSERT INTO favorites (user_id, listing_id)
      VALUES (${userId}, ${listingId}::uuid)
      RETURNING id
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return new NextResponse('Error adding to favorites', { status: 500 })
  }
} 