import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '4', 10)

    if (!listingId && !categoryId) {
      return new NextResponse('Either listingId or categoryId is required', { status: 400 })
    }

    // If we have a listingId, first get the listing's details to use for finding similar listings
    let targetListing: any = null
    if (listingId) {
      const result = await sql`
        SELECT 
          l.id, 
          l.name, 
          l.price, 
          l.category_id, 
          l.user_id
        FROM listings l
        WHERE l.id = ${listingId}::uuid
      `

      if (result.rows.length === 0) {
        return new NextResponse('Listing not found', { status: 404 })
      }

      targetListing = result.rows[0]
    }

    // Query to find similar listings
    const queryParams: any[] = []
    let whereClause = ''
    
    if (targetListing) {
      // Exclude the original listing
      whereClause = 'l.id != $1::uuid AND '
      queryParams.push(listingId)

      // If we have category, use it for similarity
      if (targetListing.category_id) {
        whereClause += 'l.category_id = $2'
        queryParams.push(targetListing.category_id)
      } else {
        whereClause += 'TRUE'
      }
    } else if (categoryId) {
      // If only categoryId is provided
      whereClause = 'l.category_id = $1'
      queryParams.push(categoryId)
    }
    
    const query = `
      WITH listing_photos_agg AS (
        SELECT 
          listing_id,
          json_agg(
            json_build_object(
              'id', id,
              'url', url,
              'description', description,
              'isMain', is_main,
              'displayOrder', display_order
            ) ORDER BY display_order
          ) as photos
        FROM listing_photos
        GROUP BY listing_id
      ),
      listing_reviews AS (
        SELECT 
          listing_id,
          COALESCE(AVG(rating), 0) as avg_rating,
          COUNT(id) as review_count
        FROM reviews
        GROUP BY listing_id
      )
      SELECT 
        l.*,
        u.username,
        u.image_url as user_image,
        c.name as category_name,
        COALESCE(lr.avg_rating, 0) as rating,
        COALESCE(lr.review_count, 0) as review_count,
        lp.photos,
        (
          SELECT lph.url
          FROM listing_photos lph
          WHERE lph.listing_id = l.id
          AND lph.is_main = true
          LIMIT 1
        ) as main_image_url
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN listing_photos_agg lp ON l.id = lp.listing_id
      LEFT JOIN listing_reviews lr ON l.id = lr.listing_id
      WHERE ${whereClause}
      ORDER BY 
        CASE 
          WHEN $1::uuid IS NOT NULL THEN 
            ABS(l.price::numeric - $${targetListing ? '3' : '2'}::numeric)
          ELSE random()
        END
      LIMIT ${limit}
    `

    // Add price parameter if we have a target listing
    if (targetListing) {
      queryParams.push(targetListing.price.toString())
    }

    const result = await sql.query(query, queryParams)

    // Transform the results
    const similarListings = result.rows.map(listing => ({
      id: listing.id,
      name: listing.name,
      price: Number(listing.price),
      image: listing.main_image_url || (listing.photos && listing.photos[0]?.url) || '/placeholder.svg',
      category: listing.category_name,
      location: listing.location,
      rating: Number(listing.rating),
      reviewCount: Number(listing.review_count),
      username: listing.username,
      userImage: listing.user_image
    }))

    return NextResponse.json(similarListings)
  } catch (error) {
    console.error('Error finding similar listings:', error)
    return new NextResponse('Server Error', { status: 500 })
  }
} 