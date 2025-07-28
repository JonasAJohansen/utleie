import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM categories 
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, icon, is_popular, is_featured } = await req.json()
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Kategorinavn er påkrevd' },
        { status: 400 }
      )
    }
    
    // Check if category already exists
    const { rows: existing } = await sql`
      SELECT name FROM categories WHERE name = ${name}
    `
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Kategori finnes allerede' },
        { status: 400 }
      )
    }

    const { rows } = await sql`
      INSERT INTO categories (name, description, icon, is_active, is_popular, is_featured)
      VALUES (${name}, ${description || null}, ${icon || null}, true, ${is_popular || false}, ${is_featured || false})
      RETURNING *
    `

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette kategori' },
      { status: 500 }
    )
  }
} 