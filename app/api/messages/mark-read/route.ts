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
    
    // Check if result is valid
    if (!conversationsResult || !Array.isArray(conversationsResult.rows)) {
      console.error('Invalid conversation result structure:', conversationsResult)
      return NextResponse.json({ 
        success: true, 
        markedCount: 0,
        message: 'No valid conversations found'
      })
    }
    
    const conversations = conversationsResult.rows
    // Filter out any invalid conversation IDs
    const conversationIds = conversations
      .filter(conv => conv && conv.id)
      .map(conv => conv.id)
    
    // Early return if no conversations found
    if (!conversationIds || conversationIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        markedCount: 0,
        message: 'No conversations to update'
      })
    }
    
    // Build a parameterized query for the array of conversation IDs
    // This is safer than string concatenation or using array constructor syntax
    const placeholders = conversationIds.map((_, i) => `$${i + 1}`).join(',');
    
    // Mark messages as read where the current user is the recipient
    const result = await sql.query(
      `UPDATE messages
       SET is_read = true
       WHERE 
         conversation_id = ANY(ARRAY[${placeholders}])
         AND sender_id != $${conversationIds.length + 1}
         AND is_read = false
       RETURNING id, conversation_id, sender_id`,
      [...conversationIds, userId]
    );
    
    const markedCount = result?.rowCount || 0
    
    // If any messages were marked as read, notify the senders
    if (markedCount > 0 && Array.isArray(result.rows)) {
      // Map by sender to send a single notification per sender
      const updatesBySender = new Map<string, string[]>()
      
      result.rows.forEach(row => {
        // Skip invalid rows
        if (!row || !row.sender_id || !row.conversation_id) return;
        
        if (!updatesBySender.has(row.sender_id)) {
          updatesBySender.set(row.sender_id, [])
        }
        
        const senderConversations = updatesBySender.get(row.sender_id)
        if (senderConversations && !senderConversations.includes(row.conversation_id)) {
          senderConversations.push(row.conversation_id)
        }
      })
      
      // Send WebSocket notification to each sender
      updatesBySender.forEach((conversationIds, senderId) => {
        if (senderId && Array.isArray(conversationIds) && conversationIds.length > 0) {
          sendMessageRead(senderId, {
            readBy: userId,
            conversationIds,
            timestamp: new Date().toISOString()
          })
        }
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
      { 
        success: false, 
        markedCount: 0,
        error: 'Failed to mark messages as read'
      },
      { status: 500 }
    )
  }
} 