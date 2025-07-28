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
      SELECT 
        id, 
        search_query, 
        created_at,
        CASE 
          WHEN search_query ? 'title' THEN search_query->>'title'
          WHEN search_query ? 'query' THEN CONCAT('Søk: ', search_query->>'query')
          WHEN search_query ? 'location' THEN CONCAT('Sted: ', search_query->>'location')
          WHEN search_query ? 'category' THEN CONCAT('Kategori: ', search_query->>'category')
          ELSE 'Lagret søk'
        END as title
      FROM saved_searches
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    const formatted = savedSearches.rows.map(row => ({
      id: row.id,
      title: row.title,
      searchQuery: row.search_query,
      createdAt: row.created_at,
      // Extract key search criteria for display
      filters: {
        query: row.search_query.query || '',
        location: row.search_query.location || '',
        category: row.search_query.category || '',
        minPrice: row.search_query.minPrice || null,
        maxPrice: row.search_query.maxPrice || null,
        lat: row.search_query.lat || null,
        lng: row.search_query.lng || null
      }
    }))

    return NextResponse.json(formatted)
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

    const { 
      searchQuery, 
      title,
      query,
      location,
      category,
      minPrice,
      maxPrice,
      lat,
      lng
    } = await req.json()

    // Build search criteria object
    const searchCriteria: any = {}
    
    if (title) searchCriteria.title = title
    if (query) searchCriteria.query = query
    if (location) searchCriteria.location = location
    if (category && category !== 'all') searchCriteria.category = category
    if (minPrice !== null && minPrice !== undefined) searchCriteria.minPrice = minPrice
    if (maxPrice !== null && maxPrice !== undefined) searchCriteria.maxPrice = maxPrice
    if (lat !== null && lat !== undefined) searchCriteria.lat = lat
    if (lng !== null && lng !== undefined) searchCriteria.lng = lng

    // Use legacy searchQuery if provided, otherwise use individual filters
    const finalSearchQuery = searchQuery || searchCriteria

    if (!finalSearchQuery || Object.keys(finalSearchQuery).length === 0) {
      return new NextResponse('Search criteria required', { status: 400 })
    }

    // Limit number of saved searches per user
    const count = await sql`
      SELECT COUNT(*) as count FROM saved_searches 
      WHERE user_id = ${userId}
    `
    if (count.rows[0].count >= 20) {
      return new NextResponse('Maximum number of saved searches reached', { status: 400 })
    }

    // Check for duplicate searches
    const existing = await sql`
      SELECT id FROM saved_searches 
      WHERE user_id = ${userId} 
      AND search_query = ${JSON.stringify(finalSearchQuery)}
    `
    
    if (existing.rows.length > 0) {
      return new NextResponse('This search is already saved', { status: 400 })
    }

    const savedSearch = await sql`
      INSERT INTO saved_searches (user_id, search_query)
      VALUES (${userId}, ${JSON.stringify(finalSearchQuery)})
      RETURNING id, search_query, created_at
    `

    const result = savedSearch.rows[0]
    const formatted = {
      id: result.id,
      title: finalSearchQuery.title || 
              (finalSearchQuery.query ? `Søk: ${finalSearchQuery.query}` : 
               finalSearchQuery.location ? `Sted: ${finalSearchQuery.location}` :
               finalSearchQuery.category ? `Kategori: ${finalSearchQuery.category}` : 'Lagret søk'),
      searchQuery: result.search_query,
      createdAt: result.created_at,
      filters: {
        query: finalSearchQuery.query || '',
        location: finalSearchQuery.location || '',
        category: finalSearchQuery.category || '',
        minPrice: finalSearchQuery.minPrice || null,
        maxPrice: finalSearchQuery.maxPrice || null,
        lat: finalSearchQuery.lat || null,
        lng: finalSearchQuery.lng || null
      }
    }

    return NextResponse.json(formatted)
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