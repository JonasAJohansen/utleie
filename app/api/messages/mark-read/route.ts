import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('[MARK_MESSAGES_READ] Marking messages as read for user:', userId)

    // Mark all unread messages in user's conversations as read
    const result = await sql`
      WITH user_conversations AS (
        SELECT id
        FROM conversations
        WHERE user1_id = ${userId} OR user2_id = ${userId}
      )
      UPDATE messages m
      SET is_read = true
      FROM user_conversations uc
      WHERE m.conversation_id = uc.id
        AND m.sender_id != ${userId}
        AND NOT m.is_read
      RETURNING m.id
    `

    console.log('[MARK_MESSAGES_READ] Marked messages as read:', result.rows.length)
    return NextResponse.json({ 
      success: true, 
      markedCount: result.rows.length 
    })
  } catch (error) {
    console.error('[MARK_MESSAGES_READ] Error:', error)
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
} 