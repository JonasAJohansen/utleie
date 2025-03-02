import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/websocket'

// Main handler function
async function cancelRequestHandler(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the requestId from the params
    const { requestId } = params
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Get reason from request body (optional)
    const body = await request.json().catch(() => ({}))
    const { reason } = body
    
    // Check if the request exists
    const requestResult = await sql`
      SELECT 
        rr.id,
        rr.listing_id,
        rr.requester_id,
        rr.status,
        l.user_id as listing_owner_id,
        l.name as listing_name,
        o.username as owner_username,
        r.username as requester_username
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      JOIN users o ON l.user_id = o.id
      JOIN users r ON rr.requester_id = r.id
      WHERE rr.id = ${requestId}
    `
    
    if (requestResult.rowCount === 0) {
      return NextResponse.json({ error: 'Rental request not found' }, { status: 404 })
    }
    
    const requestData = requestResult.rows[0]
    
    // Check if the user is either the requester or the listing owner
    const isRequester = requestData.requester_id === userId
    const isOwner = requestData.listing_owner_id === userId
    
    if (!isRequester && !isOwner) {
      return NextResponse.json({ 
        error: 'You do not have permission to cancel this request' 
      }, { status: 403 })
    }
    
    // Check if the request can be canceled
    // Pending requests can be canceled by either party
    // Approved requests can be canceled by either party before start_date
    if (requestData.status !== 'pending' && requestData.status !== 'approved') {
      return NextResponse.json({ 
        error: `Request is already ${requestData.status} and cannot be canceled` 
      }, { status: 400 })
    }
    
    // For approved requests, check if rental period has started
    if (requestData.status === 'approved') {
      const rentalResult = await sql`
        SELECT 
          start_date,
          CURRENT_DATE > start_date as has_started
        FROM rental_requests
        WHERE id = ${requestId}
      `
      
      const hasStarted = rentalResult.rows[0].has_started
      
      if (hasStarted) {
        return NextResponse.json({ 
          error: 'Rental period has already started and cannot be canceled' 
        }, { status: 400 })
      }
    }
    
    // Update request status to canceled
    await sql`
      UPDATE rental_requests
      SET 
        status = 'canceled',
        cancellation_reason = ${reason || null},
        canceled_by = ${userId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `
    
    // Create a notification for the other party
    try {
      // Determine notification recipient and content
      const recipientId = isRequester ? requestData.listing_owner_id : requestData.requester_id
      const cancelerName = isRequester ? requestData.requester_username : requestData.owner_username
      const content = `${cancelerName} has canceled the rental request for "${requestData.listing_name}"${reason ? ` with reason: ${reason}` : ''}`
      
      // Insert notification into database
      await sql`
        INSERT INTO notifications (
          user_id, 
          type, 
          title, 
          content, 
          sender_id, 
          related_id
        ) VALUES (
          ${recipientId}, 
          'REQUEST_CANCELED', 
          'Rental Request Canceled', 
          ${content}, 
          ${userId}, 
          ${requestId}
        )
      `
      
      // Send real-time notification
      sendNotification(recipientId, {
        type: 'REQUEST_CANCELED',
        requestId: requestId,
        listingId: requestData.listing_id,
        listingName: requestData.listing_name,
        canceledBy: userId,
        canceledByUsername: isRequester ? requestData.requester_username : requestData.owner_username,
        isOwner: !isRequester,
        reason: reason || null,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      // Continue execution even if notification fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Rental request canceled successfully',
      requestId: requestId
    })
  } catch (error) {
    console.error('Error canceling rental request:', error)
    return NextResponse.json(
      { error: 'Failed to cancel rental request' },
      { status: 500 }
    )
  }
}

// Export POST method with explicit wrapper function
export const POST = (req: NextRequest, ctx: { params: { requestId: string } }) => 
  cancelRequestHandler(req, ctx); 