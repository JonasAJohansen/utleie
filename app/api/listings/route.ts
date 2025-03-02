import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { getAuth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    const { userId: authenticatedUserId } = await auth()

    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const result = await sql`
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
        COALESCE(lr.avg_rating, 0) as rating,
        COALESCE(lr.review_count, 0) as review_count,
        lp.photos
      FROM listings l
      LEFT JOIN listing_reviews lr ON l.id = lr.listing_id
      LEFT JOIN listing_photos_agg lp ON l.id = lp.listing_id
      WHERE l.user_id = ${userId}
      ORDER BY l.created_at DESC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching listings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      photos, 
      categoryId, 
      location, 
      condition, 
      brandId,
      latitude,
      longitude,
      radius 
    } = body

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return new NextResponse('Name, description, price, and category are required', { status: 400 })
    }

    // Get the user's data from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Check if user exists in our database
    const userResult = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    // If user doesn't exist, create them
    if (userResult.rowCount === 0) {
      await sql`
        INSERT INTO users (id, username, email, image_url)
        VALUES (
          ${userId}, 
          ${user.username || ''}, 
          ${user.emailAddresses[0]?.emailAddress || ''}, 
          ${user.imageUrl || ''}
        )
      `
    }

    // Create the listing with location coordinates
    const listingResult = await sql`
      INSERT INTO listings (
        name, 
        description, 
        price, 
        user_id, 
        category_id, 
        location, 
        condition,
        brand_id,
        latitude,
        longitude,
        radius
      )
      VALUES (
        ${name}, 
        ${description}, 
        ${price}, 
        ${userId}, 
        ${categoryId}, 
        ${location}, 
        ${condition || null},
        ${brandId || null},
        ${latitude || null},
        ${longitude || null},
        ${radius || 2.0}
      )
      RETURNING id
    `

    const listingId = listingResult.rows[0].id

    // If photos are provided, insert them
    if (photos && photos.length > 0) {
      if (photos.length > 4) {
        return new NextResponse('Maximum 4 photos allowed', { status: 400 })
      }

      await Promise.all(photos.map(async (photo: any) => {
        await sql`
          INSERT INTO listing_photos (
            listing_id,
            url,
            description,
            is_main,
            display_order
          ) VALUES (
            ${listingId},
            ${photo.url},
            ${photo.description || ''},
            ${photo.isMain || false},
            ${photo.displayOrder || 0}
          )
        `
      }))
    }

    return NextResponse.json({ id: listingId })
  } catch (error) {
    console.error('Error creating listing:', error)
    return new NextResponse('Error creating listing', { status: 500 })
  }
}

