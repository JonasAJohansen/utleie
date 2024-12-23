import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conversations = await sql`
      SELECT 
        c.id,
        u.id as user_id,
        u.username,
        u.image_url as avatar,
        (
          SELECT content 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = ${userId} THEN c.user2_id = u.id
          ELSE c.user1_id = u.id
        END
      )
      WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
      ORDER BY last_message_time DESC NULLS LAST
    `

    return NextResponse.json(conversations.rows)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { otherUserId } = await req.json()
    if (!otherUserId) {
      return new NextResponse('Other user ID is required', { status: 400 })
    }

    // Prevent self-conversations
    if (userId === otherUserId) {
      return new NextResponse('Cannot start a conversation with yourself', { status: 400 })
    }

    // Check if the other user exists
    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${otherUserId}
    `
    if (userCheck.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check for existing conversation
    const existingConversation = await sql`
      SELECT id, user1_id, user2_id
      FROM conversations
      WHERE (user1_id = ${userId} AND user2_id = ${otherUserId})
         OR (user1_id = ${otherUserId} AND user2_id = ${userId})
    `

    if (existingConversation.rows.length > 0) {
      // Return existing conversation with user details
      const conversation = await sql`
        SELECT 
          c.id,
          u.id as user_id,
          u.username,
          u.image_url as avatar
        FROM conversations c
        JOIN users u ON u.id = ${otherUserId}
        WHERE c.id = ${existingConversation.rows[0].id}
      `
      return NextResponse.json(conversation.rows[0])
    }

    // Create new conversation
    const result = await sql`
      WITH new_conversation AS (
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (${userId}, ${otherUserId})
        RETURNING id
      )
      SELECT 
        nc.id,
        u.id as user_id,
        u.username,
        u.image_url as avatar
      FROM new_conversation nc
      JOIN users u ON u.id = ${otherUserId}
    `

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    if (error?.code === '23514') { // Check constraint violation
      return new NextResponse('Cannot create conversation with yourself', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 