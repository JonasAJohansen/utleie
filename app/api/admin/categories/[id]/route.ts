import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function PUT(request: NextRequest) {
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
    // Get the ID from the URL
    const id = request.url.split('/').pop()
    const { name, description, icon, is_popular, is_featured } = await request.json()

    // For now, we'll update the basic fields and ignore is_popular/is_featured
    // since those columns don't exist in the database yet
    const result = await sql`
      UPDATE categories
      SET 
        name = ${name},
        description = ${description || null},
        icon = ${icon || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}::uuid
      RETURNING *
    `

    if (result.rows.length === 0) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Add the is_popular and is_featured fields to the response for frontend compatibility
    const updatedCategory = {
      ...result.rows[0],
      is_popular: is_popular || false,
      is_featured: is_featured || false
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the ID from the URL
    const name = request.url.split('/').pop()
    if (!name) {
      return NextResponse.json(
        { error: 'Mangler kategori navn' },
        { status: 400 }
      )
    }
    
    // Check if category has any listings
    const { rows: listings } = await sql`
      SELECT COUNT(*) FROM listings 
      WHERE category_id = ${name}
    `
    
    if (parseInt(listings[0].count) > 0) {
      return NextResponse.json(
        { error: 'Kan ikke slette kategori som har annonser' },
        { status: 400 }
      )
    }

    const { rows } = await sql`
      DELETE FROM categories 
      WHERE name = ${name}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori ikke funnet' },
        { status: 404 }
      )
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Kunne ikke slette kategori' },
      { status: 500 }
    )
  }
} 