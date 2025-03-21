import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

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

    // Delete the listing
    const result = await sql`
      DELETE FROM listings
      WHERE id = ${id}::uuid
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Listing not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 