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

    // Delete the saved search, but only if it belongs to the user
    const result = await sql`
      DELETE FROM saved_searches
      WHERE id = ${id}::uuid AND user_id = ${userId}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Saved search not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 