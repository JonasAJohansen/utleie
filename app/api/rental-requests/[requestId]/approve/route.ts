import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/websocket'

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the requestId from the params - await the params first
    const { requestId } = await params
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Check if the request exists and the user owns the listing
    const requestResult = await sql`
      SELECT 
        rr.id,
        rr.listing_id,
        rr.requester_id,
        rr.status,
        l.user_id as listing_owner_id,
        l.name as listing_name,
        u.username as requester_username
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      JOIN users u ON rr.requester_id = u.id
      WHERE rr.id = ${requestId}
    `
    
    if (requestResult.rowCount === 0) {
      return NextResponse.json({ error: 'Rental request not found' }, { status: 404 })
    }
    
    const requestData = requestResult.rows[0]
    
    // Check if the user is the owner of the listing
    if (requestData.listing_owner_id !== userId) {
      return NextResponse.json({ error: 'You do not have permission to approve this request' }, { status: 403 })
    }
    
    // Check if the request is already approved or rejected
    if (requestData.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request is already ${requestData.status}` 
      }, { status: 400 })
    }
    
    // Check for conflicting approved requests
    const conflictingRequestsResult = await sql`
      SELECT id
      FROM rental_requests
      WHERE 
        id != ${requestId}
        AND listing_id = ${requestData.listing_id}
        AND status = 'approved'
        AND (
          (start_date <= (SELECT start_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date >= (SELECT start_date FROM rental_requests WHERE id = ${requestId}))
          OR
          (start_date <= (SELECT end_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date >= (SELECT end_date FROM rental_requests WHERE id = ${requestId}))
          OR
          (start_date >= (SELECT start_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date <= (SELECT end_date FROM rental_requests WHERE id = ${requestId}))
        )
    `
    
    if (conflictingRequestsResult.rowCount && conflictingRequestsResult.rowCount > 0) {
      return NextResponse.json({ 
        error: 'There are conflicting approved requests for these dates' 
      }, { status: 400 })
    }
    
    // Update request status to approved
    await sql`
      UPDATE rental_requests
      SET 
        status = 'approved',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `
    
    // Reject any other pending requests for the same dates
    await sql`
      UPDATE rental_requests
      SET 
        status = 'rejected',
        rejection_reason = 'Another request for these dates was approved',
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        id != ${requestId}
        AND listing_id = ${requestData.listing_id}
        AND status = 'pending'
        AND (
          (start_date <= (SELECT start_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date >= (SELECT start_date FROM rental_requests WHERE id = ${requestId}))
          OR
          (start_date <= (SELECT end_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date >= (SELECT end_date FROM rental_requests WHERE id = ${requestId}))
          OR
          (start_date >= (SELECT start_date FROM rental_requests WHERE id = ${requestId}) 
            AND end_date <= (SELECT end_date FROM rental_requests WHERE id = ${requestId}))
        )
    `
    
    // Create a notification for the requester
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
          ${requestData.requester_id}, 
          'REQUEST_APPROVED', 
          ${`Your request to rent "${requestData.listing_name}" has been approved!`}, 
          ${userId}, 
          ${requestId},
          false
        )
      `
      
      // Send real-time notification
      sendNotification(requestData.requester_id, {
        type: 'REQUEST_APPROVED',
        requestId: requestId,
        listingId: requestData.listing_id,
        listingName: requestData.listing_name,
        approvedBy: userId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      // Continue execution even if notification fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Rental request approved successfully',
      requestId: requestId
    })
  } catch (error) {
    console.error('Error approving rental request:', error)
    return NextResponse.json(
      { error: 'Failed to approve rental request' },
      { status: 500 }
    )
  }
} 