import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing latitude or longitude parameters' },
        { status: 400 }
      )
    }

    // Find the nearest Norwegian location using spatial distance
    const result = await sql`
      SELECT 
        place_name,
        county_name,
        municipality_name,
        postal_code,
        latitude,
        longitude,
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) AS distance_km
      FROM norwegian_locations
      WHERE 
        latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND category IN ('G', 'B') -- Only actual populated areas
      ORDER BY distance_km
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No nearby Norwegian locations found' },
        { status: 404 }
      )
    }

    const location = result.rows[0]
    
    // Format city name properly
    const formatName = (name: string) => {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }

    const response = {
      city: formatName(location.place_name),
      county: formatName(location.county_name),
      municipality: formatName(location.municipality_name),
      postalCode: location.postal_code,
      coordinates: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      },
      distance: Math.round(parseFloat(location.distance_km) * 100) / 100 // Round to 2 decimals
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 