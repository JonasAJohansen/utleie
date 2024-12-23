import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Simple in-memory store for typing status
const typingStore = new Map<string, { userId: string; timestamp: number }>()

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all conversations for the user
    const { rows: conversationRows } = await sql.query(`
      SELECT id FROM conversations 
      WHERE user1_id = $1 OR user2_id = $1
    `, [userId])

    // Clean up old typing status entries and build response
    const now = Date.now()
    const status: Record<string, boolean> = {}

    // Clean up old entries first
    for (const [convId, data] of typingStore.entries()) {
      if (now - data.timestamp > 3000) {
        typingStore.delete(convId)
      }
    }

    // Build status object
    conversationRows.forEach(row => {
      const typingData = typingStore.get(row.id)
      status[row.id] = !!(typingData && typingData.userId !== userId && now - typingData.timestamp <= 3000)
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error('[TYPING_STATUS_GET]', error)
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
    const { conversationId, isTyping } = body

    if (!conversationId) {
      return new NextResponse('Missing required fields', { status: 400 })
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

    if (isTyping) {
      typingStore.set(conversationId, {
        userId,
        timestamp: Date.now()
      })
    } else {
      typingStore.delete(conversationId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TYPING_STATUS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 