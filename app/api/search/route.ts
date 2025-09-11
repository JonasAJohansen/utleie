import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

const ITEMS_PER_PAGE = 12

// Helper function to get a random sponsored listing for a category
async function getRandomSponsoredListing(categoryId?: string) {
  try {
    const query = categoryId && categoryId !== 'All Categories' 
      ? sql`
          SELECT 
            l.*,
            u.username,
            u.image_url as user_image,
            CASE 
              WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
              ELSE c.name 
            END as category_name,
            sl.position_priority,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count,
            (
              SELECT lp.url
              FROM listing_photos lp
              WHERE lp.listing_id = l.id
              AND lp.is_main = true
              LIMIT 1
            ) as image
          FROM sponsored_listings sl
          JOIN listings l ON sl.listing_id = l.id
          JOIN users u ON l.user_id = u.id
          LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
          LEFT JOIN reviews r ON r.listing_id = l.id
          WHERE sl.is_active = true
            AND sl.expires_at > CURRENT_TIMESTAMP
            AND (sl.category_id = ${categoryId} OR sl.category_id IS NULL)
            AND l.status = 'active'
          GROUP BY 
            l.id, l.name, l.description, l.price, l.location, l.created_at,
            l.category_id, u.username, u.image_url, c.name, sl.position_priority
          ORDER BY sl.position_priority DESC, RANDOM()
          LIMIT 1
        `
      : sql`
          SELECT 
            l.*,
            u.username,
            u.image_url as user_image,
            CASE 
              WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
              ELSE c.name 
            END as category_name,
            sl.position_priority,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count,
            (
              SELECT lp.url
              FROM listing_photos lp
              WHERE lp.listing_id = l.id
              AND lp.is_main = true
              LIMIT 1
            ) as image
          FROM sponsored_listings sl
          JOIN listings l ON sl.listing_id = l.id
          JOIN users u ON l.user_id = u.id
          LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
          LEFT JOIN reviews r ON r.listing_id = l.id
          WHERE sl.is_active = true
            AND sl.expires_at > CURRENT_TIMESTAMP
            AND l.status = 'active'
          GROUP BY 
            l.id, l.name, l.description, l.price, l.location, l.created_at,
            l.category_id, u.username, u.image_url, c.name, sl.position_priority
          ORDER BY sl.position_priority DESC, RANDOM()
          LIMIT 1
        `

    const result = await query
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching sponsored listing:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const offset = (page - 1) * ITEMS_PER_PAGE
    
    // Build the SQL query dynamically based on search parameters
    let whereConditions = ['1=1']
    const values: any[] = []
    let paramCount = 0

    // Search query
    const q = searchParams.get('q')
    if (q) {
      paramCount++
      whereConditions.push(`(l.name ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`)
      values.push(`%${q}%`)
    }

    // Price range
    const minPrice = searchParams.get('minPrice')
    if (minPrice) {
      paramCount++
      whereConditions.push(`l.price >= $${paramCount}`)
      values.push(minPrice)
    }

    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) {
      paramCount++
      whereConditions.push(`l.price <= $${paramCount}`)
      values.push(maxPrice)
    }

    // Category
    const category = searchParams.get('category')
    if (category && category !== 'All Categories') {
      paramCount++
      if (category === 'Gis Bort') {
        // Handle hardcoded Gis Bort category
        whereConditions.push(`l.category_id = $${paramCount}`)
        values.push(category)
      } else {
        // Handle regular database categories
        whereConditions.push(`l.category_id = $${paramCount}::uuid`)
        values.push(category)
      }
    }

    // Location
    const location = searchParams.get('location')
    if (location) {
      paramCount++
      whereConditions.push(`l.location ILIKE $${paramCount}`)
      values.push(`%${location}%`)
    }

    // Features
    const features = searchParams.get('features')?.split(',')
    if (features?.length) {
      paramCount++
      whereConditions.push(`l.features @> $${paramCount}`)
      values.push(features)
    }

    // Build the GROUP BY clause
    const groupByClause = `
      GROUP BY 
        l.id, 
        l.name, 
        l.description, 
        l.price, 
        l.location, 
        l.created_at,
        l.category_id,
        l.is_sponsored,
        l.sponsored_until,
        u.username,
        u.image_url,
        c.name
    `

    // Rating filter
    const rating = searchParams.get('rating')
    const havingClause = rating 
      ? `HAVING COALESCE(AVG(r.rating), 0) >= ${rating}` 
      : ''

    // Sort order
    let orderByClause = ''
    const sortBy = searchParams.get('sortBy')
    switch (sortBy) {
      case 'price_asc':
        orderByClause = 'ORDER BY l.price ASC'
        break
      case 'price_desc':
        orderByClause = 'ORDER BY l.price DESC'
        break
      case 'rating':
        orderByClause = 'ORDER BY avg_rating DESC, review_count DESC'
        break
      default:
        orderByClause = 'ORDER BY l.created_at DESC'
    }

    // Get total count first
    const countQuery = `
      SELECT COUNT(DISTINCT l.id) as total_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE ${whereConditions.join(' AND ')}
    `

    console.log('Count Query:', countQuery)
    console.log('Values:', values)

    const countResult = await sql.query(countQuery, values)
    const totalCount = parseInt(countResult.rows[0]?.total_count || '0')
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Main query with pagination
    const query = `
      SELECT 
        l.*,
        u.username,
        u.image_url as user_image,
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.name 
        END as category_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count,
        l.is_sponsored,
        l.sponsored_until,
        (
          SELECT lp.url
          FROM listing_photos lp
          WHERE lp.listing_id = l.id
          AND lp.is_main = true
          LIMIT 1
        ) as image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE ${whereConditions.join(' AND ')}
      ${groupByClause}
      ${havingClause}
      ${orderByClause}
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `

    console.log('Main Query:', query)
    console.log('Values:', values)

    const result = await sql.query(query, values)

    // Get category counts for current search
    const categoryCountQuery = `
      SELECT 
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.name 
        END as category_name,
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.id::text 
        END as category_id,
        COUNT(DISTINCT l.id) as count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE ${whereConditions.join(' AND ')}
      ${havingClause ? havingClause.replace('HAVING', 'AND') : ''}
      GROUP BY 
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.name 
        END,
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.id::text 
        END
      HAVING COUNT(DISTINCT l.id) > 0
      ORDER BY COUNT(DISTINCT l.id) DESC, category_name ASC
    `

    console.log('Category Count Query:', categoryCountQuery)
    
    const categoryCountResult = await sql.query(categoryCountQuery, values)
    
    const categoryCount = categoryCountResult.rows.map(row => ({
      name: row.category_name,
      id: row.category_id,
      count: parseInt(row.count)
    }))

    // Transform the results
    const listings = result.rows.map(listing => ({
      id: listing.id,
      name: listing.name,
      description: listing.description,
      price: listing.price,
      image: listing.image || '/placeholder.svg',
      location: listing.location,
      category: listing.category_name,
      username: listing.username,
      userImage: listing.user_image?.startsWith('https://img.clerk.com') ? 
        listing.user_image.replace('img.clerk.com', 'images.clerk.dev') : 
        listing.user_image || '/placeholder.svg',
      rating: Number(listing.avg_rating),
      reviewCount: Number(listing.review_count),
      features: listing.features || [],
      createdAt: listing.created_at,
      isSponsored: listing.is_sponsored || false,
      sponsoredUntil: listing.sponsored_until || null
    }))

    // Get sponsored listing for the first page only to avoid confusion
    let sponsoredListing = null
    let sponsoredPriority = 1
    if (page === 1) {
      const sponsoredData = await getRandomSponsoredListing(category || undefined)
      if (sponsoredData) {
        sponsoredPriority = sponsoredData.position_priority || 1
        sponsoredListing = {
          id: sponsoredData.id,
          name: sponsoredData.name,
          description: sponsoredData.description,
          price: sponsoredData.price,
          image: sponsoredData.image || '/placeholder.svg',
          location: sponsoredData.location,
          category: sponsoredData.category_name,
          username: sponsoredData.username,
          userImage: sponsoredData.user_image?.startsWith('https://img.clerk.com') ? 
            sponsoredData.user_image.replace('img.clerk.com', 'images.clerk.dev') : 
            sponsoredData.user_image || '/placeholder.svg',
          rating: Number(sponsoredData.avg_rating),
          reviewCount: Number(sponsoredData.review_count),
          features: sponsoredData.features || [],
          createdAt: sponsoredData.created_at,
          isSponsored: true,
          sponsoredUntil: null
        }

        // Track impression for analytics
        try {
          await sql`
            UPDATE sponsored_listings 
            SET impressions_count = impressions_count + 1
            WHERE listing_id = ${sponsoredData.id}::uuid
              AND is_active = true
              AND expires_at > CURRENT_TIMESTAMP
          `
        } catch (impressionError) {
          console.error('Error tracking sponsored listing impression:', impressionError)
        }
      }
    }

    // Inject sponsored listing at the top if it exists and isn't already in results
    let finalListings = listings
    if (sponsoredListing && !listings.some(l => l.id === sponsoredListing.id)) {
      // Remove one regular listing to maintain the same total count
      finalListings = [sponsoredListing, ...listings.slice(0, ITEMS_PER_PAGE - 1)]
    }

    return NextResponse.json({
      items: finalListings,
      categoryCount,
      sponsoredListing: sponsoredListing ? {
        id: sponsoredListing.id,
        priority: sponsoredPriority
      } : null,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Search Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 