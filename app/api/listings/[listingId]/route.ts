import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function DELETE(
  request: Request,
  context: { params: { listingId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify the user owns this listing
    const { rows } = await sql`
      SELECT user_id 
      FROM listings 
      WHERE id = ${context.params.listingId}
    `

    if (rows.length === 0) {
      return new NextResponse('Listing not found', { status: 404 })
    }

    if (rows[0].user_id !== userId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Delete the listing
    await sql`
      DELETE FROM listings 
      WHERE id = ${context.params.listingId} 
      AND user_id = ${userId}
    `

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 