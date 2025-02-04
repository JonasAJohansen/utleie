import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const result = await sql`
      SELECT 
        n.id,
        n.type,
        n.is_read as "read",
        n.created_at as "createdAt",
        u.username as "senderName",
        l.name as "listingName"
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      LEFT JOIN rental_requests rr ON n.related_id = rr.id
      LEFT JOIN listings l ON rr.listing_id = l.id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 20
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
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

export async function PUT(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${userId}
      AND is_read = false
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 