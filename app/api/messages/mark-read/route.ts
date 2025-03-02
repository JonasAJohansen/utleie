import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sendMessageRead } from '@/lib/websocket'

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Find the conversations this user is part of
    const conversationsResult = await sql`
      SELECT id, user1_id, user2_id
      FROM conversations
      WHERE user1_id = ${userId} OR user2_id = ${userId}
    `
    
    const conversations = conversationsResult.rows
    const conversationIds = conversations.map(conv => conv.id)
    
    // Early return if no conversations found
    if (conversationIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        markedCount: 0,
        message: 'No conversations to update'
      })
    }
    
    // Mark messages as read where the current user is the recipient
    const result = await sql`
      UPDATE messages
      SET is_read = true
      WHERE 
        conversation_id = ANY(${conversationIds})
        AND sender_id != ${userId}
        AND is_read = false
      RETURNING id, conversation_id, sender_id
    `
    
    const markedCount = result.rowCount || 0
    
    // If any messages were marked as read, notify the senders
    if (markedCount > 0) {
      // Map by sender to send a single notification per sender
      const updatesBySender = new Map<string, string[]>()
      
      result.rows.forEach(row => {
        if (!updatesBySender.has(row.sender_id)) {
          updatesBySender.set(row.sender_id, [])
        }
        const senderConversations = updatesBySender.get(row.sender_id)!
        if (!senderConversations.includes(row.conversation_id)) {
          senderConversations.push(row.conversation_id)
        }
      })
      
      // Send WebSocket notification to each sender
      updatesBySender.forEach((conversationIds, senderId) => {
        sendMessageRead(senderId, {
          readBy: userId,
          conversationIds,
          timestamp: new Date().toISOString()
        })
      })
    }
    
    // Return success response with count of marked messages
    return NextResponse.json({ 
      success: true, 
      markedCount,
      message: `Marked ${markedCount} messages as read`
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
} 