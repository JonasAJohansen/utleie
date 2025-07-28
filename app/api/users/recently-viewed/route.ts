import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

const MAX_RECENT_ITEMS = 10

// Get recently viewed items for the current user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        rv.listing_id as id,
        rv.viewed_at,
        l.name,
        l.price,
        l.location,
        COALESCE(lp.url, '') as image
      FROM recently_viewed rv
      JOIN listings l ON rv.listing_id = l.id
      LEFT JOIN (
        SELECT DISTINCT ON (listing_id) 
          listing_id, 
          url
        FROM listing_photos
        WHERE is_main = true
        ORDER BY listing_id, display_order
      ) lp ON l.id = lp.listing_id
      WHERE rv.user_id = ${userId} AND l.status = 'active'
      ORDER BY rv.viewed_at DESC
      LIMIT ${MAX_RECENT_ITEMS}
    `

    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      location: row.location,
      image: row.image,
      viewedAt: row.viewed_at
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching recently viewed items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add item to recently viewed
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listingId, name, price, location, image } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Check if listing exists and is active
    const listingCheck = await sql`
      SELECT id FROM listings 
      WHERE id = ${listingId} AND status = 'active'
    `

    if (listingCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Insert or update recently viewed record
    await sql`
      INSERT INTO recently_viewed (user_id, listing_id, viewed_at)
      VALUES (${userId}, ${listingId}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, listing_id) 
      DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
    `

    // Clean up old entries (keep only the most recent MAX_RECENT_ITEMS)
    await sql`
      DELETE FROM recently_viewed 
      WHERE user_id = ${userId} 
      AND listing_id NOT IN (
        SELECT listing_id 
        FROM recently_viewed 
        WHERE user_id = ${userId}
        ORDER BY viewed_at DESC 
        LIMIT ${MAX_RECENT_ITEMS}
      )
    `

    // Return updated list
    const result = await sql`
      SELECT 
        rv.listing_id as id,
        rv.viewed_at,
        l.name,
        l.price,
        l.location,
        COALESCE(lp.url, '') as image
      FROM recently_viewed rv
      JOIN listings l ON rv.listing_id = l.id
      LEFT JOIN (
        SELECT DISTINCT ON (listing_id) 
          listing_id, 
          url
        FROM listing_photos
        WHERE is_main = true
        ORDER BY listing_id, display_order
      ) lp ON l.id = lp.listing_id
      WHERE rv.user_id = ${userId} AND l.status = 'active'
      ORDER BY rv.viewed_at DESC
      LIMIT ${MAX_RECENT_ITEMS}
    `

    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      location: row.location,
      image: row.image,
      viewedAt: row.viewed_at
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error adding recently viewed item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Clear all recently viewed items
export async function DELETE() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await sql`
      DELETE FROM recently_viewed 
      WHERE user_id = ${userId}
    `

    return NextResponse.json({ items: [] })
  } catch (error) {
    console.error('Error clearing recently viewed items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 