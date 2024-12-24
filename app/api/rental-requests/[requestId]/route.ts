import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function PATCH(
  req: Request,
  context: { params: { requestId: string } }
) {
  try {
    const { userId } = await auth()
    const { requestId } = await Promise.resolve(context.params)
    const body = await req.json()
    const { status } = body

    if (!userId || !requestId || !status) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verify the user owns the listing associated with this request
    const request = await sql`
      SELECT l.user_id, rr.requester_id
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE rr.id = ${requestId}
    `

    if (request.rows.length === 0) {
      return new NextResponse("Request not found", { status: 404 })
    }

    if (request.rows[0].user_id !== userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update the request status
    const result = await sql`
      UPDATE rental_requests
      SET status = ${status}
      WHERE id = ${requestId}
      RETURNING id
    `

    // Create notification for the renter
    await sql`
      INSERT INTO notifications (
        user_id,
        sender_id,
        type,
        content,
        related_id,
        is_read
      ) VALUES (
        ${request.rows[0].requester_id},
        ${userId},
        ${status === 'APPROVED' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED'},
        ${status === 'APPROVED' ? 'Your rental request has been approved' : 'Your rental request has been rejected'},
        ${requestId},
        false
      )
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('[RENTAL_REQUEST_PATCH]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 