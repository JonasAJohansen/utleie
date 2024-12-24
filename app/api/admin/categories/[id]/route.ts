import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    // First, update any listings that use this category to have null category_id
    await sql`
      UPDATE listings
      SET category_id = NULL
      WHERE category_id = ${id}
    `

    // Then delete the category
    const result = await sql`
      DELETE FROM categories
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rowCount === 0) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error deleting category:', error)
    return new NextResponse('Error deleting category', { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params
    const { name, description, icon, is_popular, is_featured } = await request.json()

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