import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Mark message(s) as read
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { messageId, messageIds, conversationId } = body

    if (!messageId && !messageIds && !conversationId) {
      return new NextResponse('Message ID(s) or conversation ID required', { status: 400 })
    }

    let messagesToMark: string[] = []

    if (messageId) {
      messagesToMark = [messageId]
    } else if (messageIds) {
      messagesToMark = messageIds
    } else if (conversationId) {
      // Mark all unread messages in conversation as read
      const { rows: unreadMessages } = await sql.query(`
        SELECT m.id 
        FROM messages m
        LEFT JOIN message_read_receipts mrr ON m.id = mrr.message_id AND mrr.user_id = $1
        WHERE m.conversation_id = $2 
        AND m.sender_id != $1
        AND mrr.id IS NULL
      `, [userId, conversationId])
      
      messagesToMark = unreadMessages.map(msg => msg.id)
    }

    if (messagesToMark.length === 0) {
      return NextResponse.json({ message: 'No messages to mark as read' })
    }

    // Insert read receipts for messages that don't already have them
    const readReceiptPromises = messagesToMark.map(async (msgId) => {
      try {
        const receiptId = uuidv4()
        await sql.query(`
          INSERT INTO message_read_receipts (id, message_id, user_id, read_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (message_id, user_id) DO NOTHING
        `, [receiptId, msgId, userId])
        
        // Also update the message's read_at field
        await sql.query(`
          UPDATE messages 
          SET read_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND read_at IS NULL
        `, [msgId])
      } catch (error) {
        console.error(`Error marking message ${msgId} as read:`, error)
      }
    })

    await Promise.all(readReceiptPromises)

    return NextResponse.json({ 
      success: true, 
      markedCount: messagesToMark.length 
    })
  } catch (error) {
    console.error('[READ_RECEIPTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get read receipts for a message
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return new NextResponse('Message ID required', { status: 400 })
    }

    // Verify user has access to this message
    const { rows: messageRows } = await sql.query(`
      SELECT m.conversation_id, c.user1_id, c.user2_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = $1
    `, [messageId])

    if (messageRows.length === 0) {
      return new NextResponse('Message not found', { status: 404 })
    }

    const message = messageRows[0]
    if (message.user1_id !== userId && message.user2_id !== userId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Get read receipts for this message
    const { rows: receipts } = await sql.query(`
      SELECT 
        mrr.user_id,
        mrr.read_at,
        u.username,
        u.image_url
      FROM message_read_receipts mrr
      JOIN users u ON mrr.user_id = u.id
      WHERE mrr.message_id = $1
      ORDER BY mrr.read_at ASC
    `, [messageId])

    return NextResponse.json({
      messageId,
      receipts: receipts.map(receipt => ({
        userId: receipt.user_id,
        username: receipt.username,
        avatar: receipt.image_url,
        readAt: receipt.read_at
      })),
      readCount: receipts.length
    })
  } catch (error) {
    console.error('[READ_RECEIPTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 