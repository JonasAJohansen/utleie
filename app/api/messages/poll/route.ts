import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')
    
    if (!since) {
      return new NextResponse('Since parameter is required', { status: 400 })
    }

    const sinceDate = new Date(since)
    
    // Get new messages for user's conversations
    const { rows: newMessages } = await sql.query(`
      SELECT 
        m.*,
        m.created_at as timestamp,
        u.username as sender_username,
        u.image_url as sender_avatar,
        reply_msg.content as reply_to_content,
        reply_user.username as reply_to_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN conversations c ON m.conversation_id = c.id
      LEFT JOIN messages reply_msg ON m.reply_to_message_id = reply_msg.id
      LEFT JOIN users reply_user ON reply_msg.sender_id = reply_user.id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND m.sender_id != $1
        AND m.created_at > $2
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [userId, sinceDate.toISOString()])

    // Get new notifications
    const { rows: newNotifications } = await sql.query(`
      SELECT *
      FROM notifications
      WHERE user_id = $1
        AND created_at > $2
        AND is_read = false
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId, sinceDate.toISOString()])

    return NextResponse.json({
      messages: newMessages,
      notifications: newNotifications,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[MESSAGES_POLL]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}