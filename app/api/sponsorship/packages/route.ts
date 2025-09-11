import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { SPONSORSHIP_PACKAGES } from '@/lib/stripe'

export async function GET() {
  try {
    // Get packages from database
    const result = await sql`
      SELECT 
        id,
        name,
        description,
        price_nok,
        duration_days,
        position_priority,
        is_active
      FROM sponsorship_packages
      WHERE is_active = true
      ORDER BY position_priority ASC, price_nok ASC
    `

    // If no packages in database, return the default ones
    if (result.rows.length === 0) {
      return NextResponse.json(
        Object.values(SPONSORSHIP_PACKAGES).map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price_nok: pkg.priceNOK,
          duration_days: pkg.durationDays,
          position_priority: pkg.priority,
          is_active: true,
          isDefault: true // Flag to indicate this is from code, not DB
        }))
      )
    }

    return NextResponse.json(result.rows)

  } catch (error) {
    console.error('Error fetching sponsorship packages:', error)
    
    // Fallback to default packages if database error
    return NextResponse.json(
      Object.values(SPONSORSHIP_PACKAGES).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price_nok: pkg.priceNOK,
        duration_days: pkg.durationDays,
        position_priority: pkg.priority,
        is_active: true,
        isDefault: true
      }))
    )
  }
}
