import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { userId } = await auth()
  const { id: listingId } = await context.params

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Start a transaction
    await sql`BEGIN`

    try {
      // First, delete all associated photos
      await sql`
        DELETE FROM listing_photos 
        WHERE listing_id = ${listingId}::uuid
      `

      // Delete any reviews
      await sql`
        DELETE FROM reviews 
        WHERE listing_id = ${listingId}::uuid
      `

      // Delete any rental requests
      await sql`
        DELETE FROM rental_requests 
        WHERE listing_id = ${listingId}::uuid
      `

      // Finally, delete the listing itself
      const result = await sql`
        DELETE FROM listings 
        WHERE id = ${listingId}::uuid 
        AND user_id = ${userId}
        RETURNING id
      `

      if (result.rowCount === 0) {
        await sql`ROLLBACK`
        return new NextResponse('Listing not found or unauthorized', { status: 404 })
      }

      // If everything succeeded, commit the transaction
      await sql`COMMIT`

      return new NextResponse('Listing deleted successfully', { status: 200 })
    } catch (error) {
      // If anything fails, roll back all changes
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error('Error deleting listing:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: listingId } = await context.params
    
    const result = await sql`
      SELECT 
        l.*,
        u.username,
        u.image_url as user_image,
        COALESCE(AVG(r.rating)::numeric, 0)::numeric(10,2) as rating,
        COUNT(r.id) as review_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.id = ${listingId}::uuid
      GROUP BY l.id, l.name, l.description, l.price, l.location, l.user_id, l.status, l.created_at, l.condition, u.username, u.image_url
    `

    if (result.rows.length === 0) {
      return new NextResponse('Listing not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching listing:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 