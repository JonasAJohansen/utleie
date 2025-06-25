import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Most popular Norwegian cities (based on population and rental activity)
const POPULAR_CITIES = [
  'OSLO', 'BERGEN', 'TRONDHEIM', 'STAVANGER', 'KRISTIANSAND', 'FREDRIKSTAD',
  'SANDNES', 'TROMSØ', 'DRAMMEN', 'ASKER', 'LILLESTRØM', 'HALDEN', 
  'BODØ', 'MOLDE', 'ARENDAL', 'HAUGESUND', 'TØNSBERG', 'ÅLESUND',
  'MOSS', 'SKIEN', 'HAMAR', 'LILLEHAMMER', 'SARPSBORG', 'SANDEFJORD'
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '200');
  
  try {
    let result;
    
    if (query) {
      // Search for places matching the query
      result = await sql`
        SELECT DISTINCT 
          place_name,
          county_name,
          CASE 
            WHEN UPPER(place_name) IN ('OSLO', 'BERGEN', 'TRONDHEIM', 'STAVANGER', 'KRISTIANSAND', 'FREDRIKSTAD', 'SANDNES', 'TROMSØ', 'DRAMMEN', 'ASKER', 'LILLESTRØM', 'HALDEN', 'BODØ', 'MOLDE', 'ARENDAL', 'HAUGESUND', 'TØNSBERG', 'ÅLESUND', 'MOSS', 'SKIEN', 'HAMAR', 'LILLEHAMMER', 'SARPSBORG', 'SANDEFJORD')
            THEN 1 
            ELSE 0 
          END as is_popular,
          CASE 
            WHEN LOWER(place_name) LIKE ${`${query}%`} THEN 1
            WHEN LOWER(place_name) LIKE ${`%${query}%`} THEN 2
            WHEN LOWER(county_name) LIKE ${`${query}%`} THEN 3
            ELSE 4
          END as sort_order
        FROM norwegian_locations 
        WHERE 
          category IN ('G', 'B') 
          AND (
            LOWER(place_name) LIKE ${`%${query}%`}
            OR LOWER(county_name) LIKE ${`%${query}%`}
          )
        ORDER BY 
          is_popular DESC,
          sort_order,
          place_name
        LIMIT ${limit}
      `;
    } else {
      // Return all places with popular ones first
      result = await sql`
        SELECT DISTINCT 
          place_name,
          county_name,
          CASE 
            WHEN UPPER(place_name) IN ('OSLO', 'BERGEN', 'TRONDHEIM', 'STAVANGER', 'KRISTIANSAND', 'FREDRIKSTAD', 'SANDNES', 'TROMSØ', 'DRAMMEN', 'ASKER', 'LILLESTRØM', 'HALDEN', 'BODØ', 'MOLDE', 'ARENDAL', 'HAUGESUND', 'TØNSBERG', 'ÅLESUND', 'MOSS', 'SKIEN', 'HAMAR', 'LILLEHAMMER', 'SARPSBORG', 'SANDEFJORD')
            THEN 1 
            ELSE 0 
          END as is_popular,
          CASE 
            WHEN UPPER(place_name) = 'OSLO' THEN 1
            WHEN UPPER(place_name) = 'BERGEN' THEN 2
            WHEN UPPER(place_name) = 'TRONDHEIM' THEN 3
            WHEN UPPER(place_name) = 'STAVANGER' THEN 4
            WHEN UPPER(place_name) = 'KRISTIANSAND' THEN 5
            WHEN UPPER(place_name) = 'FREDRIKSTAD' THEN 6
            WHEN UPPER(place_name) = 'SANDNES' THEN 7
            WHEN UPPER(place_name) = 'TROMSØ' THEN 8
            WHEN UPPER(place_name) = 'DRAMMEN' THEN 9
            WHEN UPPER(place_name) = 'ASKER' THEN 10
            WHEN UPPER(place_name) = 'LILLESTRØM' THEN 11
            WHEN UPPER(place_name) = 'HALDEN' THEN 12
            WHEN UPPER(place_name) = 'BODØ' THEN 13
            WHEN UPPER(place_name) = 'MOLDE' THEN 14
            WHEN UPPER(place_name) = 'ARENDAL' THEN 15
            WHEN UPPER(place_name) = 'HAUGESUND' THEN 16
            WHEN UPPER(place_name) = 'TØNSBERG' THEN 17
            WHEN UPPER(place_name) = 'ÅLESUND' THEN 18
            WHEN UPPER(place_name) = 'MOSS' THEN 19
            WHEN UPPER(place_name) = 'SKIEN' THEN 20
            WHEN UPPER(place_name) = 'HAMAR' THEN 21
            WHEN UPPER(place_name) = 'LILLEHAMMER' THEN 22
            WHEN UPPER(place_name) = 'SARPSBORG' THEN 23
            WHEN UPPER(place_name) = 'SANDEFJORD' THEN 24
            ELSE 999
          END as popular_order
        FROM norwegian_locations 
        WHERE category IN ('G', 'B')
        ORDER BY 
          is_popular DESC,
          popular_order,
          place_name
        LIMIT ${limit}
      `;
    }

    // Format the data for frontend consumption
    const cities = result.rows.map(row => {
      // Capitalize first letter and lowercase the rest for better display
      const formatName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      };

      const cityName = formatName(row.place_name);
      const countyName = formatName(row.county_name);
      
      return {
        name: cityName,
        municipality: countyName,
        county: countyName,
        countyCode: '',
        displayName: countyName && countyName !== cityName ? `${cityName}, ${countyName}` : cityName,
        isPopular: row.is_popular === 1
      };
    });

    // Remove duplicates based on display name
    const uniqueCities = cities.filter((city, index, self) => 
      index === self.findIndex(c => c.displayName === city.displayName)
    );

    return NextResponse.json({
      cities: uniqueCities,
      total: uniqueCities.length,
      query: query || null,
      hasMore: uniqueCities.length >= limit
    });

  } catch (error) {
    console.error('Error fetching Norwegian cities:', error);
    
    // Fallback to hardcoded popular cities if database fails
    const fallbackCities = [
      'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Fredrikstad',
      'Sandnes', 'Tromsø', 'Drammen', 'Asker', 'Lillestrøm', 'Halden', 
      'Bodø', 'Molde', 'Arendal', 'Haugesund', 'Tønsberg', 'Ålesund',
      'Moss', 'Skien', 'Hamar', 'Lillehammer', 'Sarpsborg', 'Sandefjord'
    ]
      .filter(city => !query || city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map((city, index) => ({
        name: city,
        municipality: city,
        county: '',
        countyCode: '',
        displayName: city,
        isPopular: index < 24
      }));

    return NextResponse.json({
      cities: fallbackCities,
      total: fallbackCities.length,
      query: query || null,
      fallback: true,
      hasMore: false
    });
  }
} 