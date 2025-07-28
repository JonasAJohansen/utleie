import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: PageProps) {
  try {
    const { id: listingId } = await params
    const { userId } = await auth()
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Check if listing exists
    const listingCheck = await sql`
      SELECT id, user_id FROM listings 
      WHERE id = ${listingId} AND status = 'active'
    `

    if (listingCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const listing = listingCheck.rows[0]

    // Don't track views from the listing owner
    if (userId && listing.user_id === userId) {
      return NextResponse.json({ message: 'View not tracked (owner)' })
    }

    // Check for recent view from same user/IP to prevent spam
    const recentViewCheck = await sql`
      SELECT id FROM listing_views 
      WHERE listing_id = ${listingId} 
      AND (
        (user_id IS NOT NULL AND user_id = ${userId || null}) OR
        (user_id IS NULL AND ip_address = ${clientIp})
      )
      AND viewed_at > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `

    if (recentViewCheck.rows.length > 0) {
      return NextResponse.json({ message: 'View already tracked recently' })
    }

    // Record the view
    await sql`
      INSERT INTO listing_views (listing_id, user_id, ip_address, viewed_at)
      VALUES (${listingId}, ${userId || null}, ${clientIp}, CURRENT_TIMESTAMP)
    `

    // Update listing view count cache
    await sql`
      UPDATE listings 
      SET view_count = (
        SELECT COUNT(*) 
        FROM listing_views 
        WHERE listing_id = ${listingId}
      )
      WHERE id = ${listingId}
    `

    // Get updated view count
    const updatedListing = await sql`
      SELECT view_count FROM listings WHERE id = ${listingId}
    `

    return NextResponse.json({ 
      message: 'View tracked successfully',
      viewCount: updatedListing.rows[0]?.view_count || 0
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get view statistics for a listing
export async function GET(request: NextRequest, { params }: PageProps) {
  try {
    const { id: listingId } = await params
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Get view statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as views_24h,
        COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_7d,
        COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as views_30d
      FROM listing_views 
      WHERE listing_id = ${listingId}
    `

    // Get hourly view pattern for last 24 hours
    const hourlyViews = await sql`
      SELECT 
        EXTRACT(hour FROM viewed_at) as hour,
        COUNT(*) as views
      FROM listing_views 
      WHERE listing_id = ${listingId}
      AND viewed_at >= NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(hour FROM viewed_at)
      ORDER BY hour
    `

    const viewStats = stats.rows[0] || {
      total_views: 0,
      unique_users: 0,
      unique_ips: 0,
      views_24h: 0,
      views_7d: 0,
      views_30d: 0
    }

    return NextResponse.json({
      totalViews: parseInt(viewStats.total_views),
      uniqueUsers: parseInt(viewStats.unique_users),
      uniqueIPs: parseInt(viewStats.unique_ips),
      views24h: parseInt(viewStats.views_24h),
      views7d: parseInt(viewStats.views_7d),
      views30d: parseInt(viewStats.views_30d),
      hourlyPattern: hourlyViews.rows.map(row => ({
        hour: parseInt(row.hour),
        views: parseInt(row.views)
      }))
    })
  } catch (error) {
    console.error('Error fetching view stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 