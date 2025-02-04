import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await sql`
      SELECT b.*, c.name as category_name 
      FROM brands b
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY b.name
    `
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return new NextResponse('Error fetching brands', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { name, categoryId } = body

    if (!name || !categoryId) {
      return new NextResponse('Name and category are required', { status: 400 })
    }

    const result = await sql`
      INSERT INTO brands (name, category_id)
      VALUES (${name}, ${categoryId})
      RETURNING *
    `

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating brand:', error)
    return new NextResponse('Error creating brand', { status: 500 })
  }
} 