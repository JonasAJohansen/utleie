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
    
    // Get active listings count
    const activeListingsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM listings
      WHERE user_id = ${userId} AND status = 'active'
    `
    
    // Get total listings count
    const totalListingsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM listings
      WHERE user_id = ${userId}
    `
    
    // Get pending rental requests
    const pendingRequestsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE l.user_id = ${userId} AND rr.status = 'pending'
    `
    
    // Get approved rental requests (current rentals)
    const currentRentalsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE l.user_id = ${userId} 
        AND rr.status = 'approved'
        AND rr.start_date <= CURRENT_DATE
        AND rr.end_date >= CURRENT_DATE
    `
    
    // Get completed rentals (renter)
    const completedRentalsAsRenterResult = await sql`
      SELECT COUNT(*)::int as count
      FROM rental_requests rr
      WHERE rr.requester_id = ${userId}
        AND rr.status = 'approved'
        AND rr.end_date < CURRENT_DATE
    `
    
    // Get completed rentals (owner)
    const completedRentalsAsOwnerResult = await sql`
      SELECT COUNT(*)::int as count
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE l.user_id = ${userId}
        AND rr.status = 'approved'
        AND rr.end_date < CURRENT_DATE
    `
    
    // Get average rating received
    const avgRatingResult = await sql`
      SELECT COALESCE(AVG(r.rating), 0) as avg_rating
      FROM reviews r
      JOIN listings l ON r.listing_id = l.id
      WHERE l.user_id = ${userId}
    `
    
    // Get total reviews received
    const totalReviewsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM reviews r
      JOIN listings l ON r.listing_id = l.id
      WHERE l.user_id = ${userId}
    `
    
    // Get unread message count
    const unreadMessagesResult = await sql`
      WITH user_conversations AS (
        SELECT id FROM conversations
        WHERE user1_id = ${userId} OR user2_id = ${userId}
      )
      SELECT COUNT(*)::int as count
      FROM messages
      WHERE 
        conversation_id IN (SELECT id FROM user_conversations)
        AND sender_id != ${userId}
        AND is_read = false
    `
    
    // Get favorite listings count
    const favoritesResult = await sql`
      SELECT COUNT(*)::int as count
      FROM favorites
      WHERE user_id = ${userId}
    `
    
    // Calculate response rate (approved + rejected) / total requests
    const requestsReceivedResult = await sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE rr.status IN ('approved', 'rejected'))::int as responded
      FROM rental_requests rr
      JOIN listings l ON rr.listing_id = l.id
      WHERE l.user_id = ${userId}
    `
    
    const responseRate = requestsReceivedResult.rows[0].total > 0
      ? Math.round((requestsReceivedResult.rows[0].responded / requestsReceivedResult.rows[0].total) * 100)
      : 100 // Default to 100% if no requests received
    
    return NextResponse.json({
      listings: {
        active: activeListingsResult.rows[0].count,
        total: totalListingsResult.rows[0].count,
      },
      requests: {
        pending: pendingRequestsResult.rows[0].count,
      },
      rentals: {
        current: currentRentalsResult.rows[0].count,
        completedAsRenter: completedRentalsAsRenterResult.rows[0].count,
        completedAsOwner: completedRentalsAsOwnerResult.rows[0].count,
      },
      reviews: {
        count: totalReviewsResult.rows[0].count,
        avgRating: parseFloat(avgRatingResult.rows[0].avg_rating).toFixed(1),
      },
      messages: {
        unread: unreadMessagesResult.rows[0].count,
      },
      favorites: {
        count: favoritesResult.rows[0].count,
      },
      responseRate: responseRate,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
} 