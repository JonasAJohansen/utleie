import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { validateMessageContent } from '@/lib/content-validation'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return new NextResponse('Conversation ID is required', { status: 400 })
    }

    // Verify user has access to this conversation
    const { rows: conversationRows } = await sql.query(`
      SELECT * FROM conversations 
      WHERE id = $1
      AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId])

    if (conversationRows.length === 0) {
      return new NextResponse('Conversation not found', { status: 404 })
    }

    const { rows: messageRows } = await sql.query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.type,
        m.created_at as timestamp,
        u.username as sender_username,
        u.image_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId])

    return NextResponse.json(messageRows)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { conversationId, content, type = 'text' } = body
    
    if (!conversationId || !content) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Validate message content for blocked patterns (phone numbers and emails)
    if (type === 'text') {
      const validation = validateMessageContent(content)
      if (!validation.isValid) {
        return new NextResponse(validation.message, { status: 400 })
      }
    }

    // Verify user has access to this conversation
    const { rows: conversationRows } = await sql.query(`
      SELECT * FROM conversations 
      WHERE id = $1
      AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId])

    if (conversationRows.length === 0) {
      return new NextResponse('Conversation not found', { status: 404 })
    }

    const messageId = uuidv4()
    const timestamp = new Date().toISOString()
    
    const { rows: messageRows } = await sql.query(`
      WITH new_message AS (
        INSERT INTO messages (id, conversation_id, sender_id, content, type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      )
      SELECT 
        nm.id,
        nm.conversation_id,
        nm.sender_id,
        nm.content,
        nm.type,
        nm.created_at as timestamp,
        u.username as sender_username,
        u.image_url as sender_avatar
      FROM new_message nm
      JOIN users u ON nm.sender_id = u.id
    `, [messageId, conversationId, userId, content, type, timestamp])

    return NextResponse.json(messageRows[0])
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

