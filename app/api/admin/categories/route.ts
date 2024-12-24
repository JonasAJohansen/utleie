import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await sql`
      SELECT id, name, description, icon, is_popular, is_featured, created_at, updated_at
      FROM categories
      ORDER BY name ASC
    `
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new NextResponse('Error fetching categories', { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { name, description, icon, is_popular, is_featured } = await request.json()

    const result = await sql`
      INSERT INTO categories (name, description, icon, is_popular, is_featured)
      VALUES (${name}, ${description}, ${icon}, ${is_popular}, ${is_featured})
      RETURNING *
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating category:', error)
    return new NextResponse('Error creating category', { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { id, name, description, icon, is_popular, is_featured } = await request.json()

    const result = await sql`
      UPDATE categories
      SET 
        name = ${name},
        description = ${description},
        icon = ${icon},
        is_popular = ${is_popular},
        is_featured = ${is_featured},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rowCount === 0) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    return new NextResponse('Error updating category', { status: 500 })
  }
} 