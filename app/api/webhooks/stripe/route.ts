import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sql } from '@vercel/postgres'
import { verifyStripeWebhook, SPONSORSHIP_PACKAGES, stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = verifyStripeWebhook(body, signature)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing successful payment:', paymentIntent.id)

    // Get payment method information
    let paymentMethodType = null
    if (paymentIntent.latest_charge && stripe) {
      try {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string)
        paymentMethodType = charge.payment_method_details?.type || null
      } catch (error) {
        console.error('Error retrieving charge details:', error)
      }
    }

    // Update payment record
    const paymentResult = await sql`
      UPDATE payments 
      SET 
        status = 'succeeded',
        stripe_webhook_received = true,
        payment_method_type = ${paymentMethodType},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
      RETURNING id, user_id, listing_id, metadata
    `

    if (paymentResult.rows.length === 0) {
      console.error('Payment record not found for payment intent:', paymentIntent.id)
      return
    }

    const payment = paymentResult.rows[0]
    const metadata = payment.metadata as any

    // Get package details
    const packageId = paymentIntent.metadata.packageId as keyof typeof SPONSORSHIP_PACKAGES
    const package_ = SPONSORSHIP_PACKAGES[packageId]

    if (!package_) {
      console.error('Invalid package ID in payment intent:', packageId)
      return
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + package_.durationDays)

    // Get package record from database
    const packageResult = await sql`
      SELECT id FROM sponsorship_packages 
      WHERE name = ${package_.name}
      LIMIT 1
    `

    let packageDbId
    if (packageResult.rows.length > 0) {
      packageDbId = packageResult.rows[0].id
    } else {
      // Create package record if it doesn't exist
      const newPackageResult = await sql`
        INSERT INTO sponsorship_packages (
          name, description, price_nok, duration_days, position_priority
        ) VALUES (
          ${package_.name},
          ${package_.description},
          ${package_.priceNOK},
          ${package_.durationDays},
          ${package_.priority}
        )
        RETURNING id
      `
      packageDbId = newPackageResult.rows[0].id
    }

    // Create sponsored listing record
    await sql`
      INSERT INTO sponsored_listings (
        listing_id,
        payment_id,
        package_id,
        user_id,
        category_id,
        expires_at,
        position_priority,
        is_active
      ) VALUES (
        ${payment.listing_id}::uuid,
        ${payment.id}::uuid,
        ${packageDbId}::uuid,
        ${payment.user_id},
        ${metadata.category || null},
        ${expiresAt.toISOString()},
        ${package_.priority},
        true
      )
    `

    // Update the listing record (this will be handled by the trigger)
    // But we can also do it manually for immediate effect
    await sql`
      UPDATE listings 
      SET 
        is_sponsored = true,
        sponsored_until = ${expiresAt.toISOString()}
      WHERE id = ${payment.listing_id}::uuid
    `

    console.log(`Successfully activated sponsorship for listing ${payment.listing_id}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing failed payment:', paymentIntent.id)

    await sql`
      UPDATE payments 
      SET 
        status = 'failed',
        stripe_webhook_received = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `

    console.log(`Payment failed for payment intent: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing canceled payment:', paymentIntent.id)

    await sql`
      UPDATE payments 
      SET 
        status = 'canceled',
        stripe_webhook_received = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `

    console.log(`Payment canceled for payment intent: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Error handling payment cancellation:', error)
    throw error
  }
}
