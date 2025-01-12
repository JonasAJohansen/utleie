import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function PUT(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { imageUrl } = await request.json()

    const result = await sql`
      UPDATE users
      SET image_url = ${imageUrl}
      WHERE id = ${userId}
      RETURNING id, username, image_url
    `

    if (result.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 