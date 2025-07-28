import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const location = searchParams.get('location') || ''
    
    // Return empty array for empty queries to avoid unnecessary DB hits
    if (!query.trim() && !location.trim()) {
      return NextResponse.json({ items: [] })
    }
    
    console.log(`Search query: "${query}", location: "${location}", userCoords: ${userLat}, ${userLng}`)
    
    // Build WHERE clause dynamically
    let whereClause = `l.status = 'active'`
    const whereParams: any[] = []
    
    if (query.trim()) {
      whereClause += ` AND l.name ILIKE $${whereParams.length + 1}`
      whereParams.push(`%${query}%`)
    }
    
    if (location.trim()) {
      whereClause += ` AND l.location ILIKE $${whereParams.length + 1}`
      whereParams.push(`%${location}%`)
    }
    
    // Build ORDER BY clause based on user location
    let orderByClause = ''
    if (userLat && userLng) {
      // Sort by distance when user location is available
      orderByClause = `
        ORDER BY 
          CASE WHEN l.name ILIKE $${whereParams.length + 1} THEN 0 ELSE 1 END,
          CASE 
            WHEN l.latitude IS NOT NULL AND l.longitude IS NOT NULL THEN
              (6371 * acos(
                cos(radians($${whereParams.length + 2})) * 
                cos(radians(l.latitude)) * 
                cos(radians(l.longitude) - radians($${whereParams.length + 3})) + 
                sin(radians($${whereParams.length + 2})) * 
                sin(radians(l.latitude))
              ))
            ELSE 999999
          END,
          l.created_at DESC
      `
      if (query.trim()) {
        whereParams.push(`${query}%`) // For exact match priority
      } else {
        whereParams.push('') // Placeholder when no query
      }
      whereParams.push(userLat)
      whereParams.push(userLng)
    } else {
      orderByClause = `
        ORDER BY 
          CASE WHEN l.name ILIKE $${whereParams.length + 1} THEN 0 ELSE 1 END,
          l.created_at DESC
      `
      if (query.trim()) {
        whereParams.push(`${query}%`)
      } else {
        whereParams.push('')
      }
    }
    
    const sqlQuery = `
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
        u.username,
        ${userLat && userLng ? `
          CASE 
            WHEN l.latitude IS NOT NULL AND l.longitude IS NOT NULL THEN
              ROUND((6371 * acos(
                cos(radians($${whereParams.length - 1})) * 
                cos(radians(l.latitude)) * 
                cos(radians(l.longitude) - radians($${whereParams.length})) + 
                sin(radians($${whereParams.length - 1})) * 
                sin(radians(l.latitude))
              ))::numeric, 1)
            ELSE NULL
          END as distance_km
        ` : 'NULL as distance_km'}
      FROM listings l
      LEFT JOIN listing_photos_main lp ON l.id = lp.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE ${whereClause}
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
      ${orderByClause}
      LIMIT $${whereParams.length + 1}
    `
    
    whereParams.push(limit)
    
    const result = await sql.query(sqlQuery, whereParams)
    
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
      distance_km: item.distance_km ? parseFloat(item.distance_km) : null,
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