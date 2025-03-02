import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

const ITEMS_PER_PAGE = 50

// Helper function to add random offset within radius (for privacy)
function addPrivacyOffset(lat: number, lng: number, radiusKm: number = 2): { lat: number, lng: number } {
  // Convert km to approximate degrees (rough estimate)
  // 1 degree is approximately 111km at the equator
  const radiusDegrees = radiusKm / 111;
  
  // Generate random offset (from -0.5 to 0.5 of radius)
  const randomOffsetLat = (Math.random() - 0.5) * radiusDegrees;
  const randomOffsetLng = (Math.random() - 0.5) * radiusDegrees;
  
  return {
    lat: lat + randomOffsetLat,
    lng: lng + randomOffsetLng
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radiusKm = searchParams.get('radius')
    const location = searchParams.get('location')
    const category = searchParams.get('category')
    
    // Get map bounds parameters
    const north = searchParams.get('north')
    const south = searchParams.get('south')
    const east = searchParams.get('east')
    const west = searchParams.get('west')
    const centerLat = searchParams.get('centerLat')
    const centerLng = searchParams.get('centerLng')
    
    // Build query conditions
    const conditions = []
    const queryParams: any[] = []
    let paramCounter = 0
    
    // Add category filter if provided
    if (category) {
      paramCounter++
      conditions.push(`l.category_id = $${paramCounter}`)
      queryParams.push(category)
    }
    
    // Add location filter if provided (text-based)
    if (location) {
      paramCounter++
      conditions.push(`l.location ILIKE $${paramCounter}`)
      queryParams.push(`%${location}%`)
    }
    
    // Add bounds filter if provided
    let hasBoundsFilter = false
    if (north && south && east && west) {
      try {
        // Check if latitude/longitude columns exist
        await sql`SELECT latitude, longitude FROM listings LIMIT 1`;
        
        // Add bounds filter
        paramCounter++
        conditions.push(`l.latitude <= $${paramCounter}`)
        queryParams.push(parseFloat(north))
        
        paramCounter++
        conditions.push(`l.latitude >= $${paramCounter}`)
        queryParams.push(parseFloat(south))
        
        paramCounter++
        conditions.push(`l.longitude <= $${paramCounter}`)
        queryParams.push(parseFloat(east))
        
        paramCounter++
        conditions.push(`l.longitude >= $${paramCounter}`)
        queryParams.push(parseFloat(west))
        
        hasBoundsFilter = true
      } catch (e) {
        console.log('Coordinate columns not found in listings table. Skipping bounds filter.');
      }
    }
    
    // Create the WHERE clause
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')} AND l.status = 'active'` 
      : 'WHERE l.status = \'active\''
    
    try {
      // First, check if latitude/longitude columns exist
      let hasCoordinateColumns = true;
      try {
        await sql`SELECT latitude, longitude FROM listings LIMIT 1`;
      } catch (e) {
        console.log('Coordinate columns not found in listings table. Using fallback query.');
        hasCoordinateColumns = false;
      }
      
      // Query for listings
      const query = `
        SELECT 
          l.*,
          u.username,
          u.image_url as user_image,
          c.name as category_name,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as review_count,
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id
            AND lp.is_main = true
            LIMIT 1
          ) as image
        FROM listings l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN categories c ON l.category_id = c.id::text
        LEFT JOIN reviews r ON l.id = r.listing_id
        ${whereClause}
        GROUP BY 
          l.id, 
          l.name, 
          l.description, 
          l.price, 
          l.location, 
          l.user_id, 
          l.status, 
          l.created_at,
          l.category_id,
          ${hasCoordinateColumns ? 'l.latitude, l.longitude, l.radius,' : ''}
          u.username,
          u.image_url,
          c.name
        ORDER BY 
          l.created_at DESC
        LIMIT ${ITEMS_PER_PAGE}
      `;
      
      console.log('Map Search Query:', query);
      console.log('Query params:', queryParams);
      
      const result = await sql.query(query, queryParams);
      
      // Transform results to include privacy-enhanced coordinates
      const transformedListings = result.rows.map(listing => {
        // Default coordinates (Oslo)
        let latitude = 59.9139;
        let longitude = 10.7522;
        let radius = 2.0; // Default radius in km
        
        // If the listing has stored coordinates, use those
        if (listing.latitude && listing.longitude) {
          latitude = parseFloat(listing.latitude);
          longitude = parseFloat(listing.longitude);
          radius = listing.radius ? parseFloat(listing.radius) : 2.0;
          
          // Apply privacy offset if not already applied
          if (!listing._privacy_applied) {
            const { lat, lng } = addPrivacyOffset(latitude, longitude, radius);
            latitude = lat;
            longitude = lng;
          }
        } 
        // If we have map bounds but no coordinates, use center of map
        else if (centerLat && centerLng && !listing.latitude && !listing.longitude) {
          const centerLatFloat = parseFloat(centerLat);
          const centerLngFloat = parseFloat(centerLng);
          
          // Add small random offset from map center
          const { lat, lng } = addPrivacyOffset(centerLatFloat, centerLngFloat, 2.0);
          latitude = lat;
          longitude = lng;
        }
        // Fallback for listings without stored coordinates
        else if (listing.location) {
          // Try to match location with known coordinates
          const locationCoordinates = getLocationCoordinates(listing.location);
          if (locationCoordinates) {
            // Use known coordinates with a small random offset
            const { lat, lng } = addPrivacyOffset(
              locationCoordinates.lat,
              locationCoordinates.lng,
              locationCoordinates.radius || 2.0
            );
            latitude = lat;
            longitude = lng;
          } else {
            // Add small random offset from default coordinates
            const randomLat = (Math.random() - 0.5) * 0.1;
            const randomLng = (Math.random() - 0.5) * 0.1;
            
            if (lat && lng) {
              latitude = parseFloat(lat) + randomLat;
              longitude = parseFloat(lng) + randomLng;
            } else {
              latitude += randomLat;
              longitude += randomLng;
            }
          }
        }
        
        return {
          ...listing,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          radius: radius.toString(),
          price: Number(listing.price),
          // Mark that privacy has been applied
          _privacy_applied: true
        };
      });
      
      // Return structured response
      return NextResponse.json({
        items: transformedListings,
        pagination: {
          totalItems: transformedListings.length,
          itemsPerPage: ITEMS_PER_PAGE
        }
      });
    } catch (dbError) {
      console.error('Database error in map-search:', dbError);
      return NextResponse.json(
        { 
          error: 'database_error', 
          message: 'Error executing database query',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in map-search API:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get coordinates for known locations
function getLocationCoordinates(locationName: string): { lat: number, lng: number, radius: number } | null {
  const locations = [
    { name: 'oslo', lat: 59.9139, lng: 10.7522, radius: 2 },
    { name: 'bergen', lat: 60.3913, lng: 5.3221, radius: 2 },
    { name: 'trondheim', lat: 63.4305, lng: 10.3951, radius: 2 },
    { name: 'stavanger', lat: 58.9700, lng: 5.7331, radius: 2 },
    { name: 'tromsø', lat: 69.6492, lng: 18.9553, radius: 2 },
    { name: 'nordland', lat: 67.0000, lng: 14.0000, radius: 5 },
    { name: 'troms og finnmark', lat: 70.0000, lng: 23.0000, radius: 5 }
  ];
  
  const lowercaseLocation = locationName.toLowerCase();
  for (const loc of locations) {
    if (lowercaseLocation.includes(loc.name)) {
      return loc;
    }
  }
  
  return null;
} 