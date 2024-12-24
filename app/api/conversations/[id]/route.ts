import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function DELETE(request: NextRequest) {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Get the ID from the URL
    const id = request.url.split('/').pop()

    // First check if the user is part of the conversation
    const conversationCheck = await sql`
      SELECT * FROM conversations 
      WHERE id = ${id}::uuid 
      AND (user1_id = ${userId} OR user2_id = ${userId})
    `

    if (conversationCheck.rows.length === 0) {
      return new NextResponse('Conversation not found or unauthorized', { status: 404 })
    }

    // Delete all messages in the conversation
    await sql`
      DELETE FROM messages 
      WHERE conversation_id = ${id}::uuid
    `

    // Delete the conversation
    await sql`
      DELETE FROM conversations 
      WHERE id = ${id}::uuid
    `

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 