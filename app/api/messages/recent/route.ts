import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('[RECENT_MESSAGES_GET] Fetching messages for user:', userId)

    const result = await sql`
      WITH recent_messages AS (
        SELECT DISTINCT ON (c.id)
          c.id as conversation_id,
          m.id as message_id,
          m.content,
          m.created_at,
          m.sender_id,
          CASE 
            WHEN c.user1_id = ${userId} THEN c.user2_id 
            ELSE c.user1_id 
          END as other_user_id
        FROM conversations c
        JOIN messages m ON c.id = m.conversation_id
        WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
        ORDER BY c.id, m.created_at DESC
      )
      SELECT 
        rm.conversation_id,
        rm.message_id,
        rm.content,
        rm.created_at,
        u.username as other_user_name,
        u.image_url as other_user_avatar,
        COUNT(*) FILTER (WHERE NOT m.is_read AND m.sender_id != ${userId}) as unread_count
      FROM recent_messages rm
      JOIN users u ON rm.other_user_id = u.id
      LEFT JOIN messages m ON rm.conversation_id = m.conversation_id
      GROUP BY 
        rm.conversation_id,
        rm.message_id,
        rm.content,
        rm.created_at,
        u.username,
        u.image_url
      ORDER BY rm.created_at DESC
      LIMIT 5
    `

    console.log('[RECENT_MESSAGES_GET] Found messages:', result?.rows?.length || 0)
    
    // Check if result is valid
    if (!result || !Array.isArray(result.rows)) {
      console.error('[RECENT_MESSAGES_GET] Invalid result structure:', result)
      return NextResponse.json([])
    }
    
    // Transform and validate each message object
    const validMessages = result.rows
      .filter(row => row && typeof row === 'object')
      .map(message => ({
        conversation_id: message.conversation_id || '',
        message_id: message.message_id || '',
        content: message.content || '',
        created_at: message.created_at || new Date().toISOString(),
        other_user_name: message.other_user_name || 'Unknown User',
        other_user_avatar: message.other_user_avatar || '/placeholder.svg',
        unread_count: typeof message.unread_count === 'number' ? message.unread_count : 0
      }));
    
    return NextResponse.json(validMessages)
  } catch (error) {
    console.error('[RECENT_MESSAGES_GET] Error:', error)
    // Return empty array on error so client doesn't crash
    return NextResponse.json([])
  }
} 