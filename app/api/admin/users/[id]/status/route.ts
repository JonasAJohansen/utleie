import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function PATCH(request: NextRequest) {
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
    const id = request.url.split('/').slice(-2)[0]
    const { status } = await request.json()

    if (!['active', 'banned'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const result = await sql`
      UPDATE users
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, username, email, created_at, status, image_url
    `

    if (result.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Database Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 