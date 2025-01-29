import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const listingId = params.id

    const result = await sql`
      DELETE FROM favorites
      WHERE user_id = ${userId} AND listing_id = ${listingId}::uuid
      RETURNING id
    `

    if (result.rows.length === 0) {
      return new NextResponse('Favorite not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return new NextResponse('Error removing from favorites', { status: 500 })
  }
} 