import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Since is_popular and is_featured columns don't exist yet, 
    // we'll return all active categories for now
    let query = sql`
      SELECT name as id, name, description, icon, 
             false as is_popular, false as is_featured
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `

    // For now, return the same results regardless of type
    // until the database schema is updated with is_popular and is_featured columns
    if (type === 'popular' || type === 'featured') {
      query = sql`
        SELECT name as id, name, description, icon, 
               false as is_popular, false as is_featured
        FROM categories
        WHERE is_active = true
        ORDER BY name ASC
        LIMIT 6
      `
    }

    const result = await query
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new NextResponse('Error fetching categories', { status: 500 })
  }
} 