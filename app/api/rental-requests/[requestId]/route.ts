import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  context: { params: { requestId: string } }
) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the requestId from the params
    const { requestId } = context.params
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Get the rental request
    const result = await sql`
      SELECT 
        rr.*,
        l.name as listing_name,
        l.price as listing_price,
        l.user_id as owner_id,
        owner.username as owner_username,
        owner.image_url as owner_image,
        requester.username as requester_username,
        requester.image_url as requester_image,
        (
          SELECT lp.url
          FROM listing_photos lp
          WHERE lp.listing_id = l.id AND lp.is_main = true
          LIMIT 1
        ) as listing_image
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      JOIN users owner ON l.user_id = owner.id
      JOIN users requester ON rr.requester_id = requester.id
      WHERE rr.id = ${requestId}
    `
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Rental request not found' }, { status: 404 })
    }
    
    const request = result.rows[0]
    
    // Check if the user is authorized to view this request
    if (request.requester_id !== userId && request.owner_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to view this request' }, { status: 403 })
    }
    
    return NextResponse.json(request)
  } catch (error) {
    console.error('Error fetching rental request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { requestId: string } }
) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the requestId from the params
    const { requestId } = context.params
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Parse request body
    const body = await request.json()
    const { status } = body
    
    // Validate status
    if (!status || !['approved', 'rejected', 'canceled'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: approved, rejected, canceled' 
      }, { status: 400 })
    }
    
    // Check if the request exists and the user is authorized
    const requestResult = await sql`
      SELECT 
        rr.id,
        rr.listing_id,
        rr.requester_id,
        rr.status,
        l.user_id as owner_id
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE rr.id = ${requestId}
    `
    
    if (requestResult.rowCount === 0) {
      return NextResponse.json({ error: 'Rental request not found' }, { status: 404 })
    }
    
    const requestData = requestResult.rows[0]
    
    // Check authorization based on the status change
    if (status === 'approved' || status === 'rejected') {
      // Only the owner can approve or reject
      if (requestData.owner_id !== userId) {
        return NextResponse.json({ 
          error: 'Only the listing owner can approve or reject requests' 
        }, { status: 403 })
      }
    } else if (status === 'canceled') {
      // Either the requester or the owner can cancel
      if (requestData.requester_id !== userId && requestData.owner_id !== userId) {
        return NextResponse.json({ 
          error: 'Only the requester or the listing owner can cancel requests' 
        }, { status: 403 })
      }
    }
    
    // Update the request status
    await sql`
      UPDATE rental_requests
      SET 
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `
    
    // Send notification based on status change
    // This would be similar to the specific route handlers
    
    return NextResponse.json({
      success: true,
      message: `Rental request ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating rental request:', error)
    return NextResponse.json(
      { error: 'Failed to update rental request' },
      { status: 500 }
    )
  }
} 