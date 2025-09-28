import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Check if user has admin role
  const userRole = user.privateMetadata.role
  if (userRole !== 'org:admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    // First, let's check if we have any listings at all
    const countResult = await sql`SELECT COUNT(*) FROM listings`
    console.log('Total listings:', countResult.rows[0].count)

    // Now get the listings with basic information
    const result = await sql`
      SELECT 
        l.id,
        l.name,
        l.price,
        l.status,
        l.created_at,
        l.user_id,
        l.category_id
      FROM listings l
      ORDER BY l.created_at DESC
    `
    console.log('Listings found:', result.rows.length)
    console.log('First listing:', result.rows[0])

    // If we have listings, let's get the related data
    if (result.rows.length > 0) {
      const listingsWithDetails = await Promise.all(
        result.rows.map(async (listing) => {
          const [userResult, categoryResult] = await Promise.all([
            sql`SELECT username FROM users WHERE id = ${listing.user_id}`,
            sql`SELECT name FROM categories WHERE name = ${listing.category_id}`
          ])

          return {
            ...listing,
            username: userResult.rows[0]?.username || 'Unknown User',
            category_name: categoryResult.rows[0]?.name || 'Uncategorized'
          }
        })
      )

      return NextResponse.json(listingsWithDetails)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 