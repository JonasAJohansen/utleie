import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/websocket'

export async function POST(request: NextRequest, props: { params: Promise<{ requestId: string }> }) {
  const params = await props.params;
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { requestId } = params
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Get reason from request body (optional)
    const body = await request.json().catch(() => ({}))
    const { reason } = body
    
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
      return NextResponse.json({ error: 'You do not have permission to reject this request' }, { status: 403 })
    }
    
    // Check if the request is already approved or rejected
    if (requestData.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request is already ${requestData.status}` 
      }, { status: 400 })
    }
    
    // Update request status to rejected
    await sql`
      UPDATE rental_requests
      SET 
        status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
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
          'REQUEST_REJECTED', 
          ${`Your request to rent "${requestData.listing_name}" has been rejected${reason ? `: ${reason}` : '.'}`}, 
          ${userId}, 
          ${requestId},
          false
        )
      `
      
      // Send real-time notification
      sendNotification(requestData.requester_id, {
        type: 'REQUEST_REJECTED',
        requestId: requestId,
        listingId: requestData.listing_id,
        listingName: requestData.listing_name,
        rejectedBy: userId,
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
      message: 'Rental request rejected successfully',
      requestId: requestId
    })
  } catch (error) {
    console.error('Error rejecting rental request:', error)
    return NextResponse.json(
      { error: 'Failed to reject rental request' },
      { status: 500 }
    )
  }
} 