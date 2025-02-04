import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Get user's saved searches
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const savedSearches = await sql`
      SELECT id, name, search_query, created_at
      FROM saved_searches
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(savedSearches.rows)
  } catch (error) {
    console.error('[SAVED_SEARCHES_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Save a new search
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name, searchQuery } = await req.json()
    if (!name || !searchQuery) {
      return new NextResponse('Name and search query required', { status: 400 })
    }

    // Check for duplicate name
    const existing = await sql`
      SELECT id FROM saved_searches 
      WHERE user_id = ${userId} AND name = ${name}
    `
    if (existing.rows.length > 0) {
      return new NextResponse('Search name already exists', { status: 400 })
    }

    // Limit number of saved searches per user
    const count = await sql`
      SELECT COUNT(*) as count FROM saved_searches 
      WHERE user_id = ${userId}
    `
    if (count.rows[0].count >= 10) {
      return new NextResponse('Maximum number of saved searches reached', { status: 400 })
    }

    const savedSearch = await sql`
      INSERT INTO saved_searches (user_id, name, search_query)
      VALUES (${userId}, ${name}, ${searchQuery})
      RETURNING id, name, search_query, created_at
    `

    return NextResponse.json(savedSearch.rows[0])
  } catch (error) {
    console.error('[SAVED_SEARCHES_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Delete a saved search
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchId } = await req.json()
    if (!searchId) {
      return new NextResponse('Search ID required', { status: 400 })
    }

    const result = await sql`
      DELETE FROM saved_searches
      WHERE id = ${searchId} AND user_id = ${userId}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Saved search not found', { status: 404 })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('[SAVED_SEARCHES_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 