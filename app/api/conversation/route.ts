import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await sql`
      SELECT DISTINCT ON (c.id)
        c.id,
        CASE
          WHEN c.user1_id = ${userId} THEN c.user2_id
          ELSE c.user1_id
        END AS other_user_id,
        m.content AS last_message,
        m.created_at AS last_message_time
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
      ORDER BY c.id, m.created_at DESC
    `

    const conversations = await Promise.all(result.rows.map(async (row) => {
      const userResult = await sql`
        SELECT public_metadata->>'username' as username, public_metadata->>'avatar' as avatar
        FROM users
        WHERE id = ${row.other_user_id}
      `
      const user = userResult.rows[0]
      return {
        id: row.id,
        userId: row.other_user_id,
        username: user.username || 'Unknown User',
        avatar: user.avatar || '/placeholder.svg?height=32&width=32',
        lastMessage: row.last_message || '',
        lastMessageTime: row.last_message_time,
      }
    }))

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

