import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const { userId } = await auth()
    const { notificationId } = params
    const body = await req.json()
    const { read } = body

    if (!userId || !notificationId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verify the notification belongs to the user
    const notification = await sql`
      SELECT user_id
      FROM notifications
      WHERE id = ${notificationId}
    `

    if (notification.rows.length === 0) {
      return new NextResponse("Notification not found", { status: 404 })
    }

    if (notification.rows[0].user_id !== userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update the notification
    const result = await sql`
      UPDATE notifications
      SET read = ${read}
      WHERE id = ${notificationId}
      RETURNING id
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('[NOTIFICATION_PATCH]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 