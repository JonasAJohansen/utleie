import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    // The username parameter is actually a user ID in this case
    const userId = username

    // Get user data including their stats
    const result = await sql`
      WITH user_stats AS (
        SELECT 
          u.id,
          u.username,
          u.email,
          u.image_url,
          u.created_at,
          COUNT(DISTINCT l.id) as total_listings,
          COUNT(DISTINCT rr.id) as total_rentals,
          COALESCE(AVG(r.rating)::numeric(10,2), 0)::float as avg_rating
        FROM users u
        LEFT JOIN listings l ON u.id = l.user_id
        LEFT JOIN rental_requests rr ON l.id = rr.listing_id AND rr.status = 'approved'
        LEFT JOIN reviews r ON l.id = r.listing_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.username, u.email, u.image_url, u.created_at
      )
      SELECT 
        id,
        username,
        image_url,
        created_at as "joinDate",
        total_listings as "totalListings",
        total_rentals as "totalRentals",
        avg_rating::float as "rating"
      FROM user_stats
    `

    if (result.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 })
    }

    const userData = {
      ...result.rows[0],
      rating: parseFloat(result.rows[0].rating) || 0
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 