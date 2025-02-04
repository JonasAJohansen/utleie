import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

// Get user's favorites
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const favorites = await sql`
      SELECT 
        f.id as favorite_id,
        l.*,
        u.username,
        u.image_url as user_image,
        COALESCE(r.average_rating, 0) as rating,
        COALESCE(r.review_count, 0) as review_count
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      JOIN users u ON l.user_id = u.id
      LEFT JOIN (
        SELECT 
          listing_id,
          COUNT(*) as review_count,
          AVG(rating) as average_rating
        FROM reviews
        GROUP BY listing_id
      ) r ON l.id = r.listing_id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `

    return NextResponse.json(favorites.rows)
  } catch (error) {
    console.error('[FAVORITES_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Add to favorites
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { listingId } = await req.json()
    if (!listingId) {
      return new NextResponse('Listing ID required', { status: 400 })
    }

    // Check if listing exists
    const listing = await sql`
      SELECT id FROM listings WHERE id = ${listingId}::uuid
    `
    if (listing.rows.length === 0) {
      return new NextResponse('Listing not found', { status: 404 })
    }

    // Check if already favorited
    const existing = await sql`
      SELECT id FROM favorites 
      WHERE user_id = ${userId} AND listing_id = ${listingId}::uuid
    `
    if (existing.rows.length > 0) {
      return NextResponse.json(existing.rows[0])
    }

    const favorite = await sql`
      INSERT INTO favorites (user_id, listing_id)
      VALUES (${userId}, ${listingId}::uuid)
      RETURNING id
    `

    return NextResponse.json(favorite.rows[0])
  } catch (error) {
    console.error('[FAVORITES_POST]', error)
    if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
      return new NextResponse('Invalid listing ID format', { status: 400 })
    }
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return new NextResponse('Already favorited', { status: 400 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Remove from favorites
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { listingId } = await req.json()
    if (!listingId) {
      return new NextResponse('Listing ID required', { status: 400 })
    }

    const result = await sql`
      DELETE FROM favorites
      WHERE user_id = ${userId} AND listing_id = ${listingId}::uuid
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Favorite not found', { status: 404 })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('[FAVORITES_DELETE]', error)
    if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
      return new NextResponse('Invalid listing ID format', { status: 400 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
} 