import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { userId } = await auth()
  const listingId = context.params.id

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

      // Delete any favorites
      await sql`
        DELETE FROM favorites 
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
  request: Request,
  context: { params: { id: string } }
) {
  const listingId = context.params.id
  return NextResponse.json({ id: listingId })
} 