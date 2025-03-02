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
    const type = url.searchParams.get('type') || 'received' // 'received' or 'given'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    let result;
    let countResult;
    
    if (type === 'received') {
      // Fetch reviews received on the user's listings
      result = await sql`
        SELECT 
          r.*,
          l.name as listing_name,
          l.id as listing_id,
          u.username as reviewer_username,
          u.image_url as reviewer_image
        FROM reviews r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON r.reviewer_id = u.id
        WHERE l.user_id = ${userId}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
      
      // Count total reviews for pagination
      countResult = await sql`
        SELECT COUNT(*)::int as total
        FROM reviews r
        JOIN listings l ON r.listing_id = l.id
        WHERE l.user_id = ${userId}
      `
    } else {
      // Fetch reviews given by the user
      result = await sql`
        SELECT 
          r.*,
          l.name as listing_name,
          l.id as listing_id,
          u.username as owner_username,
          u.image_url as owner_image
        FROM reviews r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE r.reviewer_id = ${userId}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
      
      // Count total reviews for pagination
      countResult = await sql`
        SELECT COUNT(*)::int as total
        FROM reviews
        WHERE reviewer_id = ${userId}
      `
    }
    
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
    console.error('Error fetching profile reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
} 