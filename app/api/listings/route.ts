import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = sql`
      SELECT l.*, u.username
      FROM listings l
      JOIN users u ON l.user_id = u.id
    `

    if (userId) {
      query = sql`
        SELECT l.*, u.username
        FROM listings l
        JOIN users u ON l.user_id = u.id
        WHERE l.user_id = ${userId}
      `
    }

    const result = await query
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching listings:', error)
    return new NextResponse('Error fetching listings', { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, price, image } = body

    // Get the user's data from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

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
          ${clerkUser.username || ''}, 
          ${clerkUser.emailAddresses[0]?.emailAddress || ''}, 
          ${clerkUser.imageUrl || ''}
        )
      `
    }

    // Now create the listing
    const result = await sql`
      INSERT INTO listings (name, description, price, image, user_id)
      VALUES (${name}, ${description}, ${price}, ${image}, ${userId})
      RETURNING id
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating listing:', error)
    return new NextResponse('Error creating listing', { status: 500 })
  }
}

