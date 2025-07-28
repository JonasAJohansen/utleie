import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: PageProps) {
  try {
    const { id: listingId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Find items that were rented by people who also rented this item
    const result = await sql`
      WITH item_renters AS (
        -- Get users who rented this specific item
        SELECT DISTINCT requester_id as user_id
        FROM rental_requests
        WHERE listing_id = ${listingId} 
        AND status = 'approved'
      ),
      related_rentals AS (
        -- Get all other items rented by these users
        SELECT 
          rr.listing_id,
          COUNT(DISTINCT rr.requester_id) as renter_count,
          COUNT(*) as rental_frequency
        FROM rental_requests rr
        INNER JOIN item_renters ir ON rr.requester_id = ir.user_id
        WHERE rr.listing_id != ${listingId}
        AND rr.status = 'approved'
        GROUP BY rr.listing_id
      ),
      listing_details AS (
        -- Get listing details with photos and ratings
        SELECT 
          l.id,
          l.name,
          l.price,
          l.location,
          l.category_id,
          COALESCE(lp.url, '') as image,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as review_count,
          u.username as owner_username,
          rr.renter_count,
          rr.rental_frequency
        FROM related_rentals rr
        INNER JOIN listings l ON rr.listing_id = l.id
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
          lp.url, u.username, rr.renter_count, rr.rental_frequency
      )
      SELECT *
      FROM listing_details
      ORDER BY 
        renter_count DESC,      -- Prioritize items rented by more users
        rental_frequency DESC,   -- Then by total rental frequency
        rating DESC,            -- Then by rating
        review_count DESC       -- Finally by review count
      LIMIT ${limit}
    `

    // If no rental-based recommendations, fall back to similar category items
    if (result.rows.length === 0) {
      const fallbackResult = await sql`
        WITH listing_category AS (
          SELECT category_id 
          FROM listings 
          WHERE id = ${listingId}
        )
        SELECT 
          l.id,
          l.name,
          l.price,
          l.location,
          l.category_id,
          COALESCE(lp.url, '') as image,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as review_count,
          u.username as owner_username,
          0 as renter_count,
          0 as rental_frequency
        FROM listings l
        INNER JOIN listing_category lc ON l.category_id = lc.category_id
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
        AND l.id != ${listingId}
        GROUP BY 
          l.id, l.name, l.price, l.location, l.category_id,
          lp.url, u.username
        ORDER BY 
          COALESCE(AVG(r.rating), 0) DESC,
          COUNT(r.id) DESC,
          l.created_at DESC
        LIMIT ${limit}
      `
      
      const fallbackItems = fallbackResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        location: row.location,
        category_id: row.category_id,
        image: row.image,
        rating: parseFloat(row.rating),
        review_count: parseInt(row.review_count),
        owner_username: row.owner_username,
        recommendation_type: 'similar_category',
        recommendation_strength: 0
      }))

      return NextResponse.json({ 
        recommendations: fallbackItems,
        type: 'similar_category',
        message: 'Anbefalinger basert på samme kategori'
      })
    }

    const recommendations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      location: row.location,
      category_id: row.category_id,
      image: row.image,
      rating: parseFloat(row.rating),
      review_count: parseInt(row.review_count),
      owner_username: row.owner_username,
      recommendation_type: 'rental_correlation',
      recommendation_strength: parseInt(row.renter_count),
      rental_frequency: parseInt(row.rental_frequency)
    }))

    return NextResponse.json({ 
      recommendations,
      type: 'rental_correlation',
      message: `Andre leide også disse gjenstandene`
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error getting recommendations' },
      { status: 500 }
    )
  }
} 