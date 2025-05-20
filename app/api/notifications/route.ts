import { sql } from '@vercel/postgres'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await sql`
      SELECT 
        n.*,
        sender.username as "senderName",
        to_char(n.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
        CASE 
          WHEN n.type LIKE 'REQUEST%' OR n.type = 'RENTAL_REQUEST' THEN l.name
          ELSE NULL
        END as "listingName"
      FROM notifications n
      LEFT JOIN users sender ON n.sender_id = sender.id
      LEFT JOIN rental_requests rr ON n.related_id = rr.id
      LEFT JOIN listings l ON rr.listing_id = l.id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 50
    `

    // Check if result is valid before processing
    if (!result || !result.rows) {
      console.error('Invalid database result structure', result)
      return NextResponse.json([])
    }

    // Transform snake_case to camelCase for frontend convenience
    const notifications = result.rows.map(notification => {
      // Only include valid notifications with required fields
      if (!notification || !notification.id) return null;
      
      return {
        id: notification.id,
        type: notification.type || 'UNKNOWN',
        read: !!notification.is_read,
        createdAt: notification.createdAt || new Date().toISOString(),
        senderName: notification.senderName || 'Unknown user',
        content: notification.content || '',
        related_id: notification.related_id || '',
        listingName: notification.listingName || undefined
      }
    }).filter(Boolean) // Remove any null values from the array

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Database Error:', error)
    // Return empty array on error so client doesn't crash
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { notificationId } = await request.json()

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId}
      AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Mark all notifications as read
export async function PUT() {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await sql`
      UPDATE notifications
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_read = false
    `

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to mark notifications as read' }, { status: 500 })
  }
} 