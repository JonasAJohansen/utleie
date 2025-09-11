import Stripe from 'stripe'

// Initialize Stripe with Norwegian market configuration (optional for testing)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia', // Latest API version
      typescript: true,
    })
  : null

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Stripe configuration for Norwegian market
export const STRIPE_CONFIG = {
  currency: 'nok' as const,
  country: 'NO' as const,
  paymentMethods: ['card', 'klarna'] as const, // Popular in Norway
  locale: 'nb' as const, // Norwegian Bokmål
}

// Sponsorship package pricing (in NOK øre - Stripe uses smallest currency unit)
export const SPONSORSHIP_PACKAGES = {
  BASIC: {
    id: 'basic',
    name: 'Basic Sponsorship',
    description: 'Featured placement for 7 days in your category',
    priceNOK: 199,
    durationDays: 7,
    priority: 1,
  },
  PREMIUM: {
    id: 'premium', 
    name: 'Premium Sponsorship',
    description: 'Top placement for 30 days with enhanced visibility',
    priceNOK: 699,
    durationDays: 30,
    priority: 2,
  },
  EXTENDED: {
    id: 'extended',
    name: 'Extended Sponsorship', 
    description: 'Maximum visibility for 90 days with priority positioning',
    priceNOK: 1899,
    durationDays: 90,
    priority: 3,
  },
} as const

// Convert NOK to øre (Stripe requires smallest currency unit)
export const nokToOre = (nok: number): number => Math.round(nok * 100)

// Convert øre to NOK for display
export const oreToNok = (ore: number): number => ore / 100

// Format NOK currency for display
export const formatNOK = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(amount)
}

// Create a payment intent for listing sponsorship
export const createSponsorshipPaymentIntent = async (
  packageId: keyof typeof SPONSORSHIP_PACKAGES,
  listingId: string,
  userId: string,
  customerEmail?: string
) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.')
  }

  const package_ = SPONSORSHIP_PACKAGES[packageId]
  
  if (!package_) {
    throw new Error(`Invalid sponsorship package: ${packageId}`)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: nokToOre(package_.priceNOK),
    currency: STRIPE_CONFIG.currency,
    metadata: {
      type: 'listing_sponsorship',
      packageId,
      listingId,
      userId,
      packageName: package_.name,
      durationDays: package_.durationDays.toString(),
    },
    receipt_email: customerEmail,
    description: `${package_.name} for listing sponsorship`,
  })

  return paymentIntent
}

// Verify webhook signature
export const verifyStripeWebhook = (
  rawBody: string,
  signature: string
): Stripe.Event => {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required')
  }

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`)
  }
}

// Get or create Stripe customer
export const getOrCreateCustomer = async (
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> => {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // First try to find existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

// Create Stripe products and prices for sponsorship packages (setup utility)
export const createStripeProducts = async () => {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const results = []

  for (const [key, package_] of Object.entries(SPONSORSHIP_PACKAGES)) {
    try {
      // Create product
      const product = await stripe.products.create({
        id: `sponsorship_${package_.id}`,
        name: package_.name,
        description: package_.description,
        metadata: {
          packageId: package_.id,
          durationDays: package_.durationDays.toString(),
          priority: package_.priority.toString(),
        },
      })

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: nokToOre(package_.priceNOK),
        currency: STRIPE_CONFIG.currency,
        metadata: {
          packageId: package_.id,
        },
      })

      results.push({ product, price, package: package_ })
    } catch (error) {
      console.error(`Error creating Stripe product for ${key}:`, error)
    }
  }

  return results
}
