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
    const { name, description, icon } = await request.json()

    const result = await sql`
      UPDATE categories
      SET 
        name = ${name},
        description = ${description},
        icon = ${icon},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}::uuid
      RETURNING *
    `

    if (result.rows.length === 0) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    // First check if there are any listings using this category
    const listingsCheck = await sql`
      SELECT COUNT(*) FROM listings 
      WHERE category_id::uuid = ${id}::uuid
    `

    if (parseInt(listingsCheck.rows[0].count) > 0) {
      return new NextResponse(
        'Cannot delete category that has listings. Please remove or reassign the listings first.',
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM categories
      WHERE id = ${id}::uuid
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 