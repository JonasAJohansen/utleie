'use server'

import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function startChat(ownerId: string) {
  const { userId } = await auth()
  if (!userId) {
    // Handle unauthenticated user
    throw new Error('User not authenticated')
  }

  try {
    // Ensure the conversation doesn't already exist
    const existingConversation = await sql`
      SELECT id FROM conversations
      WHERE (user1_id = ${userId} AND user2_id = ${ownerId})
         OR (user1_id = ${ownerId} AND user2_id = ${userId})
    `

    let conversationId: number

    if (existingConversation.rows.length > 0) {
      // Conversation already exists, update the timestamp
      conversationId = existingConversation.rows[0].id
      await sql`
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ${conversationId}
      `
    } else {
      // Create a new conversation
      const result = await sql`
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (${userId}, ${ownerId})
        RETURNING id
      `
      conversationId = result.rows[0].id
    }

    // Redirect to the chat page with the conversation ID
    redirect(`/chat?conversationId=${conversationId}`)
  } catch (error) {
    console.error('Error starting chat:', error)
    throw new Error('Failed to start chat')
  }
}

