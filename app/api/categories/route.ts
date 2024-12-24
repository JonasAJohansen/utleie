import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = sql`
      SELECT id, name, description, icon, is_popular, is_featured
      FROM categories
    `

    if (type === 'popular') {
      query = sql`
        SELECT id, name, description, icon, is_popular, is_featured
        FROM categories
        WHERE is_popular = true
        ORDER BY name ASC
      `
    } else if (type === 'featured') {
      query = sql`
        SELECT id, name, description, icon, is_popular, is_featured
        FROM categories
        WHERE is_featured = true
        ORDER BY name ASC
      `
    } else {
      query = sql`
        SELECT id, name, description, icon, is_popular, is_featured
        FROM categories
        ORDER BY name ASC
      `
    }

    const result = await query
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new NextResponse('Error fetching categories', { status: 500 })
  }
} 