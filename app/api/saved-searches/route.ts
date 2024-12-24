import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const result = await sql`
      SELECT 
        id,
        user_id,
        search_query,
        created_at
      FROM saved_searches
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchQuery } = await request.json()

    if (!searchQuery) {
      return new NextResponse('Search query is required', { status: 400 })
    }

    const result = await sql`
      INSERT INTO saved_searches (user_id, search_query)
      VALUES (${userId}, ${searchQuery})
      RETURNING *
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error saving search:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 