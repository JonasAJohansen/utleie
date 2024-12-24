import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Get the ID from the URL
    const requestId = request.url.split('/').pop()
    const { status } = await request.json()

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // First, verify that the user owns the listing associated with this request
    const requestCheck = await sql`
      SELECT l.user_id 
      FROM rental_requests r
      JOIN listings l ON r.listing_id = l.id
      WHERE r.id = ${requestId}::uuid
    `

    if (requestCheck.rows.length === 0) {
      return new NextResponse('Rental request not found', { status: 404 })
    }

    if (requestCheck.rows[0].user_id !== userId) {
      return new NextResponse('Unauthorized - you do not own this listing', { status: 403 })
    }

    // Update the request status
    const result = await sql`
      UPDATE rental_requests
      SET 
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}::uuid
      RETURNING *
    `

    // Create a notification for the requester
    const notification = await sql`
      INSERT INTO notifications (
        user_id,
        type,
        content,
        related_id
      )
      SELECT 
        r.requester_id,
        'rental_request_' || ${status},
        'Your rental request for ' || l.name || ' has been ' || ${status},
        r.id
      FROM rental_requests r
      JOIN listings l ON r.listing_id = l.id
      WHERE r.id = ${requestId}::uuid
      RETURNING *
    `

    return NextResponse.json({
      request: result.rows[0],
      notification: notification.rows[0]
    })
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 