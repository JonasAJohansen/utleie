import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const limit = parseInt(searchParams.get('limit') || '8')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get suggestions from listing titles and descriptions
    const result = await sql`
      WITH ranked_suggestions AS (
        SELECT DISTINCT
          name as suggestion,
          'listing' as type,
          COUNT(*) as frequency,
          CASE 
            WHEN name ILIKE ${`${query}%`} THEN 1
            WHEN name ILIKE ${`% ${query}%`} THEN 2
            WHEN description ILIKE ${`${query}%`} THEN 3
            WHEN description ILIKE ${`% ${query}%`} THEN 4
            ELSE 5
          END as relevance_score
        FROM listings 
        WHERE 
          status = 'active' 
          AND (
            name ILIKE ${`%${query}%`} 
            OR description ILIKE ${`%${query}%`}
          )
        GROUP BY name, description
        
        UNION ALL
        
        -- Category suggestions
        SELECT DISTINCT
          name as suggestion,
          'category' as type,
          1 as frequency,
          CASE 
            WHEN name ILIKE ${`${query}%`} THEN 1
            WHEN name ILIKE ${`% ${query}%`} THEN 2
            ELSE 3
          END as relevance_score
        FROM categories 
        WHERE 
          is_active = true 
          AND name ILIKE ${`%${query}%`}
        
        UNION ALL
        
        -- Popular search terms (based on common words in listings)
        SELECT DISTINCT
          CASE 
            WHEN word ILIKE 'kamera%' THEN 'kamera'
            WHEN word ILIKE 'verktøy%' THEN 'verktøy'
            WHEN word ILIKE 'bil%' THEN 'bil'
            WHEN word ILIKE 'laptop%' THEN 'laptop'
            WHEN word ILIKE 'telefon%' THEN 'telefon'
            WHEN word ILIKE 'iphone%' THEN 'iphone'
            WHEN word ILIKE 'samsung%' THEN 'samsung'
            WHEN word ILIKE 'apple%' THEN 'apple'
            WHEN word ILIKE 'sony%' THEN 'sony'
            WHEN word ILIKE 'canon%' THEN 'canon'
            WHEN word ILIKE 'nike%' THEN 'nike'
            WHEN word ILIKE 'adidas%' THEN 'adidas'
            ELSE word
          END as suggestion,
          'brand' as type,
          COUNT(*) as frequency,
          CASE 
            WHEN word ILIKE ${`${query}%`} THEN 1
            ELSE 2
          END as relevance_score
        FROM (
          SELECT unnest(string_to_array(lower(name), ' ')) as word
          FROM listings 
          WHERE status = 'active'
        ) words
        WHERE 
          length(word) > 2
          AND word ILIKE ${`%${query}%`}
        GROUP BY word
        HAVING COUNT(*) > 1
      )
      SELECT 
        suggestion,
        type,
        SUM(frequency) as total_frequency
      FROM ranked_suggestions 
      WHERE length(suggestion) > 2
      GROUP BY suggestion, type, relevance_score
      ORDER BY 
        relevance_score ASC,
        total_frequency DESC,
        suggestion ASC
      LIMIT ${limit}
    `

    const suggestions = result.rows.map(row => ({
      text: row.suggestion,
      type: row.type,
      frequency: parseInt(row.total_frequency)
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error in autocomplete search:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error getting search suggestions' },
      { status: 500 }
    )
  }
} 