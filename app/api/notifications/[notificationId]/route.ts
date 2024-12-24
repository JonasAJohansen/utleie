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
    const notificationId = request.url.split('/').pop()
    const { read } = await request.json()

    // Update the notification
    const result = await sql`
      UPDATE notifications
      SET read = ${read}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${notificationId}::uuid AND user_id = ${userId}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return new NextResponse('Notification not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 