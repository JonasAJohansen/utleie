import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Return empty array for empty queries to avoid unnecessary DB hits
    if (!query.trim()) {
      return NextResponse.json({ items: [] })
    }
    
    console.log(`Search query: "${query}"`)
    
    const result = await sql`
      WITH listing_photos_main AS (
        SELECT DISTINCT ON (listing_id) 
          listing_id, 
          url
        FROM listing_photos
        WHERE is_main = true
        ORDER BY listing_id, display_order
      )
      SELECT 
        l.id,
        l.name,
        l.price,
        l.location,
        l.category_id,
        l.latitude,
        l.longitude,
        COALESCE(lp.url, '') as image,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as review_count,
        u.username
      FROM listings l
      LEFT JOIN listing_photos_main lp ON l.id = lp.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 
        l.status = 'active' 
        AND l.name ILIKE ${`%${query}%`}
      GROUP BY 
        l.id, 
        l.name, 
        l.price, 
        l.location, 
        l.category_id,
        l.latitude,
        l.longitude,
        lp.url,
        u.username
      ORDER BY 
        CASE WHEN l.name ILIKE ${`${query}%`} THEN 0 ELSE 1 END,
        l.created_at DESC
      LIMIT ${limit}
    `
    
    // Transform the data for consistent response format
    const items = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      location: item.location,
      category_id: item.category_id,
      latitude: item.latitude,
      longitude: item.longitude,
      image: item.image,
      rating: parseFloat(item.rating),
      review_count: parseInt(item.review_count),
      username: item.username,
      features: [] // Add placeholder for features if needed
    }))
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error in listing search:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error searching listings' },
      { status: 500 }
    )
  }
} 