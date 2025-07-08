import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brandName, categoryId, description } = await request.json()

    if (!brandName || !categoryId) {
      return NextResponse.json(
        { error: 'Merkenavn og kategori er påkrevd' },
        { status: 400 }
      )
    }

    // Check if brand request already exists
    const { rows: existing } = await sql`
      SELECT id FROM brand_requests 
      WHERE brand_name = ${brandName} AND category_id = ${categoryId}
    `

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Denne merkeforespørselen finnes allerede' },
        { status: 400 }
      )
    }

    // For now, we'll store it in a simple way since we don't have the brand_requests table
    // We'll just return success and log it
    console.log('Brand request:', { brandName, categoryId, description, userId })

    return NextResponse.json({
      success: true,
      message: 'Merkeforespørsel mottatt. Vi vil vurdere den så snart som mulig.'
    })

  } catch (error) {
    console.error('Error creating brand request:', error)
    return NextResponse.json(
      { error: 'Kunne ikke sende merkeforespørsel' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return empty array since we don't have the table
    // In a real implementation, this would fetch from brand_requests table
    return NextResponse.json([])

  } catch (error) {
    console.error('Error fetching brand requests:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente merkeforespørsler' },
      { status: 500 }
    )
  }
} 