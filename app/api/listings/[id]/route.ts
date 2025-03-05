import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  const listingId = params.id

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Check if the listing exists and belongs to the user
    const { rows, rowCount } = await sql`
      SELECT id FROM listings
      WHERE id = ${listingId}::uuid AND user_id = ${userId}
    `

    if (rowCount === 0) {
      return new NextResponse('Not found or not authorized', { status: 404 })
    }

    // Delete all photos for this listing
    await sql`
      DELETE FROM listing_photos
      WHERE listing_id = ${listingId}::uuid
    `

    // Delete the listing
    await sql`
      DELETE FROM listings
      WHERE id = ${listingId}::uuid
    `

    return new NextResponse('Listing deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return new NextResponse('Error deleting listing', { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id
    
    const result = await sql`
      SELECT 
        l.id,
        l.name,
        l.description,
        l.price,
        l.location,
        l.user_id,
        l.status,
        l.created_at,
        l.condition,
        u.username as owner_username,
        u.image_url as owner_image,
        COALESCE(AVG(r.rating)::numeric(10,2), 0)::float as rating,
        COUNT(DISTINCT r.id) as review_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.id = ${listingId}::uuid
      GROUP BY l.id, l.name, l.description, l.price, l.location, l.user_id, l.status, l.created_at, l.condition, u.username, u.image_url
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get listing photos
    const photosResult = await sql`
      SELECT id, url, is_main, display_order
      FROM listing_photos
      WHERE listing_id = ${listingId}::uuid
      ORDER BY display_order
    `

    // Format the listing data
    const listing = {
      ...result.rows[0],
      photos: photosResult.rows,
      rating: parseFloat(result.rows[0].rating) || 0
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Error fetching listing' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  const listingId = params.id
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
  }
  
  try {
    // Check if the listing exists and belongs to the user
    const { rowCount } = await sql`
      SELECT id FROM listings
      WHERE id = ${listingId}::uuid AND user_id = ${userId}
    `
    
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Listing not found or not authorized' }, { status: 404 })
    }
    
    const body = await request.json()
    
    // Update the listing
    const result = await sql`
      UPDATE listings
      SET 
        name = ${body.name || null},
        description = ${body.description || null},
        price = ${body.price || null},
        location = ${body.location || null},
        status = ${body.status || null},
        condition = ${body.condition || null}
      WHERE id = ${listingId}::uuid
      RETURNING id
    `
    
    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      id: result.rows[0].id 
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
} 