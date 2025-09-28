import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = sql`
      SELECT name as id, name, description, icon, is_popular, is_featured
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `

    if (type === 'popular') {
      query = sql`
        SELECT name as id, name, description, icon, is_popular, is_featured
        FROM categories
        WHERE is_active = true AND is_popular = true
        ORDER BY name ASC
      `
    } else if (type === 'featured') {
      query = sql`
        SELECT name as id, name, description, icon, is_popular, is_featured
        FROM categories
        WHERE is_active = true AND is_featured = true
        ORDER BY name ASC
      `
    }

    const result = await Promise.race([
      query,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 8000)
      )
    ]) as any
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return empty array instead of error to prevent page crashes
    return NextResponse.json([])
  }
} 