import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'
import { createSponsorshipPaymentIntent, getOrCreateCustomer, SPONSORSHIP_PACKAGES } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, listingId, userEmail, userName } = body

    // Validate required fields
    if (!packageId || !listingId) {
      return NextResponse.json(
        { error: 'Package ID and Listing ID are required' },
        { status: 400 }
      )
    }

    // Validate package exists
    if (!(packageId in SPONSORSHIP_PACKAGES)) {
      return NextResponse.json(
        { error: 'Invalid sponsorship package' },
        { status: 400 }
      )
    }

    // Verify user owns the listing
    const listingResult = await sql`
      SELECT id, user_id, name, category_id 
      FROM listings 
      WHERE id = ${listingId}::uuid AND user_id = ${userId}
    `

    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found or access denied' },
        { status: 404 }
      )
    }

    const listing = listingResult.rows[0]

    // Check if listing is already sponsored
    const existingSponsorshipResult = await sql`
      SELECT id FROM sponsored_listings 
      WHERE listing_id = ${listingId}::uuid 
        AND is_active = true 
        AND expires_at > CURRENT_TIMESTAMP
    `

    if (existingSponsorshipResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Listing is already sponsored' },
        { status: 409 }
      )
    }

    // Get or create Stripe customer
    let customer
    if (userEmail) {
      customer = await getOrCreateCustomer(userId, userEmail, userName)
    }

    // Create payment intent
    const paymentIntent = await createSponsorshipPaymentIntent(
      packageId as keyof typeof SPONSORSHIP_PACKAGES,
      listingId,
      userId,
      userEmail
    )

    // Store payment record in database
    const paymentResult = await sql`
      INSERT INTO payments (
        user_id,
        listing_id,
        stripe_payment_intent_id,
        stripe_customer_id,
        amount_nok,
        status,
        metadata
      ) VALUES (
        ${userId},
        ${listingId}::uuid,
        ${paymentIntent.id},
        ${customer?.id || null},
        ${SPONSORSHIP_PACKAGES[packageId as keyof typeof SPONSORSHIP_PACKAGES].priceNOK},
        'pending',
        ${JSON.stringify({
          packageId,
          packageName: SPONSORSHIP_PACKAGES[packageId as keyof typeof SPONSORSHIP_PACKAGES].name,
          listingName: listing.name,
          category: listing.category_id
        })}
      )
      RETURNING id
    `

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: paymentResult.rows[0].id,
      amount: SPONSORSHIP_PACKAGES[packageId as keyof typeof SPONSORSHIP_PACKAGES].priceNOK,
      package: SPONSORSHIP_PACKAGES[packageId as keyof typeof SPONSORSHIP_PACKAGES]
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
