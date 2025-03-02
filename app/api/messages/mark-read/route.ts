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
    
    // Early return if no conversations found
    if (conversations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        markedCount: 0,
        message: 'No conversations to update'
      })
    }
    
    // Handle batch updates for each conversation separately to avoid ANY operator issues
    let totalMarkedCount = 0
    const allUpdatedMessages = []
    
    // Process each conversation separately
    for (const conversation of conversations) {
      const result = await sql`
        UPDATE messages
        SET is_read = true
        WHERE 
          conversation_id = ${conversation.id}
          AND sender_id != ${userId}
          AND is_read = false
        RETURNING id, conversation_id, sender_id
      `
      
      // Check if rowCount exists and is greater than 0
      const rowCount = result?.rowCount || 0
      if (rowCount > 0) {
        totalMarkedCount += rowCount
        allUpdatedMessages.push(...result.rows)
      }
    }
    
    // If any messages were marked as read, notify the senders
    if (totalMarkedCount > 0) {
      // Map by sender to send a single notification per sender
      const updatesBySender = new Map<string, string[]>()
      
      allUpdatedMessages.forEach(row => {
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
      markedCount: totalMarkedCount,
      message: `Marked ${totalMarkedCount} messages as read`
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
} 