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
      SELECT 
        l.*,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as review_count
      FROM listings l
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.user_id = ${userId}
      GROUP BY l.id
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
    const { name, description, price, image, categoryId } = body

    if (!categoryId) {
      return new NextResponse('Category is required', { status: 400 })
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

    // Now create the listing with category
    const result = await sql`
      INSERT INTO listings (name, description, price, image, user_id, category_id)
      VALUES (${name}, ${description}, ${price}, ${image}, ${userId}, ${categoryId})
      RETURNING id
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating listing:', error)
    return new NextResponse('Error creating listing', { status: 500 })
  }
}

