import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get URL parameters
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'active'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Fetch user's listings with pagination
    const result = await sql`
      WITH listing_photos_main AS (
        SELECT DISTINCT ON (listing_id) 
          listing_id, 
          url,
          is_main
        FROM listing_photos
        ORDER BY listing_id, is_main DESC, display_order
      ),
      listing_reviews AS (
        SELECT 
          listing_id, 
          COUNT(*) as review_count, 
          COALESCE(AVG(rating), 0) as avg_rating
        FROM reviews
        GROUP BY listing_id
      )
      SELECT 
        l.*,
        lp.url as image_url,
        COALESCE(lr.review_count, 0) as review_count,
        COALESCE(lr.avg_rating, 0) as rating,
        (
          SELECT COUNT(*)::int 
          FROM rental_requests 
          WHERE listing_id = l.id AND status = 'pending'
        ) as pending_requests
      FROM listings l
      LEFT JOIN listing_photos_main lp ON l.id = lp.listing_id
      LEFT JOIN listing_reviews lr ON l.id = lr.listing_id
      WHERE 
        l.user_id = ${userId}
        AND (${status === 'all'} OR l.status = ${status})
      ORDER BY l.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
    
    // Count total listings for pagination
    const countResult = await sql`
      SELECT COUNT(*)::int as total
      FROM listings
      WHERE 
        user_id = ${userId}
        AND (${status === 'all'} OR status = ${status})
    `
    
    const total = countResult.rows[0]?.total || 0
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      items: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching profile listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
} 