import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, assuming admin role checking would be added here
    // TODO: Add proper admin role verification

    // Get sponsored listings with analytics
    const result = await sql`
      SELECT 
        sl.*,
        l.name as listing_name,
        l.price as listing_price,
        l.location as listing_location,
        CASE 
          WHEN l.category_id = 'Gis Bort' THEN 'Gis Bort'
          ELSE c.name 
        END as category_name,
        u.username,
        u.email,
        sp.name as package_name,
        sp.price_nok as package_price,
        p.status as payment_status,
        p.stripe_payment_intent_id,
        p.amount_nok as paid_amount,
        (
          SELECT url 
          FROM listing_photos lp 
          WHERE lp.listing_id = l.id 
          AND lp.is_main = true 
          LIMIT 1
        ) as listing_image
      FROM sponsored_listings sl
      JOIN listings l ON sl.listing_id = l.id
      JOIN users u ON sl.user_id = u.id
      LEFT JOIN categories c ON (l.category_id != 'Gis Bort' AND l.category_id::uuid = c.id)
      JOIN payments p ON sl.payment_id = p.id
      JOIN sponsorship_packages sp ON sl.package_id = sp.id
      ORDER BY sl.created_at DESC
    `

    // Get summary statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_sponsored,
        COUNT(CASE WHEN sl.is_active = true AND sl.expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_sponsored,
        SUM(p.amount_nok) as total_revenue,
        SUM(sl.impressions_count) as total_impressions,
        SUM(sl.clicks_count) as total_clicks,
        ROUND(
          CASE 
            WHEN SUM(sl.impressions_count) > 0 
            THEN (SUM(sl.clicks_count)::float / SUM(sl.impressions_count)) * 100 
            ELSE 0 
          END, 
          2
        ) as avg_ctr
      FROM sponsored_listings sl
      JOIN payments p ON sl.payment_id = p.id
      WHERE p.status = 'succeeded'
    `

    const stats = statsResult.rows[0]

    return NextResponse.json({
      sponsoredListings: result.rows,
      stats: {
        totalSponsored: parseInt(stats.total_sponsored || '0'),
        activeSponsored: parseInt(stats.active_sponsored || '0'),
        totalRevenue: parseFloat(stats.total_revenue || '0'),
        totalImpressions: parseInt(stats.total_impressions || '0'),
        totalClicks: parseInt(stats.total_clicks || '0'),
        averageCTR: parseFloat(stats.avg_ctr || '0')
      }
    })

  } catch (error) {
    console.error('Error fetching sponsored listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sponsored listings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sponsoredListingId, action } = body

    if (!sponsoredListingId || !action) {
      return NextResponse.json(
        { error: 'Sponsored listing ID and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'deactivate':
        await sql`
          UPDATE sponsored_listings 
          SET is_active = false
          WHERE id = ${sponsoredListingId}::uuid
        `
        break

      case 'activate':
        await sql`
          UPDATE sponsored_listings 
          SET is_active = true
          WHERE id = ${sponsoredListingId}::uuid
            AND expires_at > CURRENT_TIMESTAMP
        `
        break

      case 'extend':
        const { additionalDays } = body
        if (!additionalDays || additionalDays <= 0) {
          return NextResponse.json(
            { error: 'Additional days must be a positive number' },
            { status: 400 }
          )
        }

        await sql`
          UPDATE sponsored_listings 
          SET expires_at = expires_at + INTERVAL '${additionalDays} days'
          WHERE id = ${sponsoredListingId}::uuid
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating sponsored listing:', error)
    return NextResponse.json(
      { error: 'Failed to update sponsored listing' },
      { status: 500 }
    )
  }
}
