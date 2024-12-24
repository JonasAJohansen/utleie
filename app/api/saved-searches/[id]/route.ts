import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify the saved search belongs to the user
    const savedSearch = await sql`
      SELECT user_id 
      FROM saved_searches 
      WHERE id = ${params.id}::uuid
    `

    if (savedSearch.rows.length === 0) {
      return new NextResponse('Saved search not found', { status: 404 })
    }

    if (savedSearch.rows[0].user_id !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await sql`
      DELETE FROM saved_searches 
      WHERE id = ${params.id}::uuid
    `

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 