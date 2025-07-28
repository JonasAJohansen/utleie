import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = parseInt(searchParams.get('days') || '7')
    
    // Get trending listings based on view activity
    const result = await sql`
      WITH trending_data AS (
        SELECT 
          l.id,
          l.name,
          l.price,
          l.location,
          l.category_id,
          l.created_at,
          l.view_count,
          COALESCE(lp.url, '') as image,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as review_count,
          u.username as owner_username,
          COUNT(lv.id) as views_period,
          COUNT(DISTINCT lv.user_id) as unique_viewers,
          COUNT(DISTINCT lv.ip_address) as unique_ips,
          -- Calculate trending score based on recent activity vs total views
          CASE 
            WHEN l.view_count > 0 THEN 
              (COUNT(lv.id)::float / l.view_count) * 100 + COUNT(lv.id)
            ELSE 
              COUNT(lv.id)
          END as trending_score,
          -- Rank within trending listings
          RANK() OVER (
            ORDER BY 
              COUNT(lv.id) DESC, 
              COUNT(DISTINCT lv.user_id) DESC,
              l.view_count DESC
          ) as trending_rank
        FROM listings l
        LEFT JOIN listing_views lv ON l.id = lv.listing_id 
          AND lv.viewed_at >= NOW() - INTERVAL '${days} days'
        LEFT JOIN (
          SELECT DISTINCT ON (listing_id) 
            listing_id, 
            url
          FROM listing_photos
          WHERE is_main = true
          ORDER BY listing_id, display_order
        ) lp ON l.id = lp.listing_id
        LEFT JOIN reviews r ON l.id = r.listing_id
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.status = 'active'
        GROUP BY 
          l.id, l.name, l.price, l.location, l.category_id, 
          l.created_at, l.view_count, lp.url, u.username
        HAVING COUNT(lv.id) > 0  -- Only include items with recent views
      )
      SELECT *
      FROM trending_data
      WHERE trending_rank <= ${limit}
      ORDER BY trending_rank
    `

    // If no trending items in the specified period, fall back to most viewed overall
    if (result.rows.length === 0) {
      const fallbackResult = await sql`
        SELECT 
          l.id,
          l.name,
          l.price,
          l.location,
          l.category_id,
          l.created_at,
          l.view_count,
          COALESCE(lp.url, '') as image,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as review_count,
          u.username as owner_username,
          0 as views_period,
          0 as unique_viewers,
          0 as unique_ips,
          l.view_count as trending_score,
          ROW_NUMBER() OVER (ORDER BY l.view_count DESC, l.created_at DESC) as trending_rank
        FROM listings l
        LEFT JOIN (
          SELECT DISTINCT ON (listing_id) 
            listing_id, 
            url
          FROM listing_photos
          WHERE is_main = true
          ORDER BY listing_id, display_order
        ) lp ON l.id = lp.listing_id
        LEFT JOIN reviews r ON l.id = r.listing_id
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.status = 'active' AND l.view_count > 0
        GROUP BY 
          l.id, l.name, l.price, l.location, l.category_id, 
          l.created_at, l.view_count, lp.url, u.username
        ORDER BY l.view_count DESC, l.created_at DESC
        LIMIT ${limit}
      `
      
      const fallbackItems = fallbackResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        location: row.location,
        category_id: row.category_id,
        created_at: row.created_at,
        image: row.image,
        rating: parseFloat(row.rating),
        review_count: parseInt(row.review_count),
        owner_username: row.owner_username,
        trending: {
          rank: parseInt(row.trending_rank),
          views_period: parseInt(row.views_period),
          unique_viewers: parseInt(row.unique_viewers),
          trending_score: parseFloat(row.trending_score),
          period_days: days
        },
        view_count: parseInt(row.view_count)
      }))

      return NextResponse.json({ 
        trending: fallbackItems,
        type: 'most_viewed',
        period: `${days} days`,
        message: `Mest sette annonser (ingen nye trender siste ${days} dager)`
      })
    }

    const trending = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      location: row.location,
      category_id: row.category_id,
      created_at: row.created_at,
      image: row.image,
      rating: parseFloat(row.rating),
      review_count: parseInt(row.review_count),
      owner_username: row.owner_username,
      trending: {
        rank: parseInt(row.trending_rank),
        views_period: parseInt(row.views_period),
        unique_viewers: parseInt(row.unique_viewers),
        trending_score: parseFloat(row.trending_score),
        period_days: days
      },
      view_count: parseInt(row.view_count)
    }))

    return NextResponse.json({ 
      trending,
      type: 'trending',
      period: `${days} days`,
      message: `Trending siste ${days} ${days === 1 ? 'dag' : 'dager'}`
    })
  } catch (error) {
    console.error('Error fetching trending listings:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error getting trending listings' },
      { status: 500 }
    )
  }
} 