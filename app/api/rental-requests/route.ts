import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/websocket';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { listingId, startDate, endDate, message = '', totalPrice } = await request.json();

    // Validate required fields
    if (!listingId || !startDate || !endDate || totalPrice === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: listingId, startDate, endDate, totalPrice'
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (start > end) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    if (start < new Date()) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
    }

    // Check if the listing exists and the user is not the owner
    const listingResult = await sql`
      SELECT l.*, u.username as owner_username
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ${listingId}
    `;

    if (!listingResult.rowCount || listingResult.rowCount === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listingResult.rows[0];

    if (listing.user_id === userId) {
      return NextResponse.json({ error: 'You cannot rent your own listing' }, { status: 400 });
    }

    // Check if the user already has a pending request for this listing
    const existingRequestResult = await sql`
      SELECT id, status
      FROM rental_requests
      WHERE 
        listing_id = ${listingId} 
        AND requester_id = ${userId}
        AND (
          (start_date <= ${startDate} AND end_date >= ${startDate})
          OR
          (start_date <= ${endDate} AND end_date >= ${endDate})
          OR
          (start_date >= ${startDate} AND end_date <= ${endDate})
        )
        AND status = 'pending'
    `;

    if (existingRequestResult.rowCount && existingRequestResult.rowCount > 0) {
      return NextResponse.json({
        error: 'You already have a pending request for this listing that overlaps with these dates'
      }, { status: 400 });
    }

    // Check if the listing is already booked for these dates
    const existingBookingsResult = await sql`
      SELECT id
      FROM rental_requests
      WHERE listing_id = ${listingId}
        AND status = 'approved'
        AND (
          (start_date <= ${startDate} AND end_date >= ${startDate})
          OR
          (start_date <= ${endDate} AND end_date >= ${endDate})
          OR
          (start_date >= ${startDate} AND end_date <= ${endDate})
        )
    `;

    if (existingBookingsResult.rowCount && existingBookingsResult.rowCount > 0) {
      return NextResponse.json({
        error: 'This listing is already booked for the selected dates'
      }, { status: 400 });
    }

    // Get the username of the requester
    const userResult = await sql`
      SELECT username FROM users WHERE id = ${userId}
    `;

    if (!userResult.rowCount || userResult.rowCount === 0) {
      return NextResponse.json({
        error: 'Recipient user not found'
      }, { status: 404 });
    }

    const username = userResult.rows[0].username;

    // Create the rental request
    const result = await sql`
      INSERT INTO rental_requests (
        listing_id,
        requester_id,
        start_date,
        end_date,
        message,
        status,
        total_price
      ) VALUES (
        ${listingId},
        ${userId},
        ${startDate},
        ${endDate},
        ${message},
        'pending',
        ${totalPrice}
      )
      RETURNING id
    `;

    const requestId = result.rows[0].id;

    // Create a notification for the listing owner
    try {
      // Insert notification into database
      await sql`
        INSERT INTO notifications (
          user_id, 
          type, 
          content, 
          sender_id, 
          related_id,
          is_read
        ) VALUES (
          ${listing.user_id}, 
          'RENTAL_REQUEST', 
          ${`${username} wants to rent your "${listing.name}" from ${startDate} to ${endDate}`}, 
          ${userId}, 
          ${requestId},
          false
        )
      `;

      // Send real-time notification
      sendNotification(listing.user_id, {
        type: 'RENTAL_REQUEST',
        requestId: requestId,
        listingId: listingId,
        listingName: listing.name,
        requestedBy: userId,
        requestedByUsername: username,
        startDate: startDate,
        endDate: endDate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      // Continue execution even if notification fails
    }

    return NextResponse.json({
      success: true,
      requestId: requestId,
      message: 'Rental request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating rental request:', error);
    return NextResponse.json(
      { error: 'Failed to create rental request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'incoming', 'outgoing', or 'all'
    const status = searchParams.get('status') || 'all'; // 'pending', 'approved', 'rejected', 'canceled', or 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = '';
    const queryParams: any[] = [limit, offset];
    let countQuery = '';

    if (type === 'incoming') {
      // Requests for the user's listings
      query = `
        SELECT 
          rr.id,
          rr.listing_id,
          rr.requester_id,
          rr.start_date,
          rr.end_date,
          rr.message,
          rr.status,
          rr.created_at,
          rr.updated_at,
          l.name as listing_name,
          l.price as listing_price,
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ) as listing_image,
          u.username as requester_username,
          u.image_url as requester_image
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        JOIN users u ON rr.requester_id = u.id
        WHERE l.user_id = $3
      `;
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        WHERE l.user_id = $1
      `;
      
      queryParams.push(userId);
      
      if (status !== 'all') {
        query += ` AND rr.status = $4`;
        countQuery += ` AND rr.status = $2`;
        queryParams.push(status);
      }
      
      query += ` ORDER BY rr.created_at DESC LIMIT $1 OFFSET $2`;
    } else if (type === 'outgoing') {
      // Requests made by the user
      query = `
        SELECT 
          rr.id,
          rr.listing_id,
          rr.requester_id,
          rr.start_date,
          rr.end_date,
          rr.message,
          rr.status,
          rr.created_at,
          rr.updated_at,
          l.name as listing_name,
          l.price as listing_price,
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ) as listing_image,
          u.username as owner_username,
          u.image_url as owner_image
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE rr.requester_id = $3
      `;
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM rental_requests rr
        WHERE rr.requester_id = $1
      `;
      
      queryParams.push(userId);
      
      if (status !== 'all') {
        query += ` AND rr.status = $4`;
        countQuery += ` AND rr.status = $2`;
        queryParams.push(status);
      }
      
      query += ` ORDER BY rr.created_at DESC LIMIT $1 OFFSET $2`;
    } else {
      // All requests (both incoming and outgoing)
      query = `
        SELECT 
          rr.id,
          rr.listing_id,
          rr.requester_id,
          rr.start_date,
          rr.end_date,
          rr.message,
          rr.status,
          rr.created_at,
          rr.updated_at,
          l.name as listing_name,
          l.user_id as owner_id,
          l.price as listing_price,
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ) as listing_image,
          CASE 
            WHEN l.user_id = $3 THEN 'incoming'
            ELSE 'outgoing'
          END as request_type,
          CASE 
            WHEN l.user_id = $3 THEN req_user.username
            ELSE owner_user.username
          END as other_username,
          CASE 
            WHEN l.user_id = $3 THEN req_user.image_url
            ELSE owner_user.image_url
          END as other_image
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        JOIN users req_user ON rr.requester_id = req_user.id
        JOIN users owner_user ON l.user_id = owner_user.id
        WHERE l.user_id = $3 OR rr.requester_id = $3
      `;
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM rental_requests rr
        JOIN listings l ON rr.listing_id = l.id
        WHERE l.user_id = $1 OR rr.requester_id = $1
      `;
      
      queryParams.push(userId);
      
      if (status !== 'all') {
        query += ` AND rr.status = $4`;
        countQuery += ` AND rr.status = $2`;
        queryParams.push(status);
      }
      
      query += ` ORDER BY rr.created_at DESC LIMIT $1 OFFSET $2`;
    }

    // Execute the count query
    const countResult = await sql.query(countQuery, type === 'all' || status === 'all' 
      ? [userId] 
      : [userId, status]
    );
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Execute the main query
    const result = await sql.query(query, queryParams);

    return NextResponse.json({
      requests: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental requests' },
      { status: 500 }
    );
  }
} 