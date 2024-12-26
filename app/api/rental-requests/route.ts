import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (listingId) {
      // Get unavailable dates for a listing
      const result = await sql`
        SELECT 
          start_date as "startDate",
          end_date as "endDate"
        FROM rental_requests
        WHERE listing_id = ${listingId}
        AND status = 'approved'
      `
      return NextResponse.json(result.rows)
    }

    // Get both incoming and outgoing rental requests
    const result = await sql`
      WITH user_requests AS (
        -- Outgoing requests (requests made by the user)
        SELECT 
          rr.id,
          rr.listing_id as "listingId",
          l.name as "listingName",
          l.image as "listingImage",
          u.username as "ownerName",
          u.image_url as "ownerImage",
          rr.start_date as "startDate",
          rr.end_date as "endDate",
          rr.status,
          rr.created_at as "createdAt",
          rr.total_price as "totalPrice",
          'outgoing' as "type"
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE rr.requester_id = ${userId}

        UNION ALL

        -- Incoming requests (requests for user's listings)
        SELECT 
          rr.id,
          rr.listing_id as "listingId",
          l.name as "listingName",
          l.image as "listingImage",
          u.username as "renterName",
          u.image_url as "renterImage",
          rr.start_date as "startDate",
          rr.end_date as "endDate",
          rr.status,
          rr.created_at as "createdAt",
          rr.total_price as "totalPrice",
          'incoming' as "type"
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        JOIN users u ON rr.requester_id = u.id
        WHERE l.user_id = ${userId}
      )
      SELECT * FROM user_requests
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[RENTAL_REQUESTS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { listingId, startDate, endDate, message, totalPrice } = body

    if (!userId || !listingId || !startDate || !endDate) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if the listing exists and user is not the owner
    const listing = await sql`
      SELECT user_id FROM listings WHERE id = ${listingId}
    `

    if (listing.rows.length === 0) {
      return new NextResponse("Listing not found", { status: 404 })
    }

    if (listing.rows[0].user_id === userId) {
      return new NextResponse("Cannot request your own listing", { status: 400 })
    }

    // Create the rental request
    const result = await sql`
      INSERT INTO rental_requests (
        listing_id,
        requester_id,
        start_date,
        end_date,
        status,
        total_price
      ) VALUES (
        ${listingId},
        ${userId},
        ${startDate},
        ${endDate},
        'pending',
        ${totalPrice}
      )
      RETURNING id
    `

    // Create a notification for the listing owner
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        content,
        related_id,
        is_read
      ) VALUES (
        ${listing.rows[0].user_id},
        'RENTAL_REQUEST',
        'You have a new rental request',
        ${result.rows[0].id},
        false
      )
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('[RENTAL_REQUESTS_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 