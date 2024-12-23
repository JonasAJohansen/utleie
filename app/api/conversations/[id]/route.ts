import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conversationId = params.id

    // Verify user has access to this conversation
    const conversation = await sql`
      SELECT * FROM conversations 
      WHERE id = ${conversationId}::uuid
      AND (user1_id = ${userId} OR user2_id = ${userId})
    `

    if (conversation.rows.length === 0) {
      return new NextResponse('Conversation not found', { status: 404 })
    }

    // Delete all messages in the conversation
    await sql`
      DELETE FROM messages 
      WHERE conversation_id = ${conversationId}::uuid
    `

    // Delete the conversation
    await sql`
      DELETE FROM conversations 
      WHERE id = ${conversationId}::uuid
    `

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 