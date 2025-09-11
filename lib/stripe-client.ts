import { loadStripe } from '@stripe/stripe-js'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the Stripe object on every render.
let stripePromise: Promise<any>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey, {
      locale: 'nb', // Norwegian locale
    })
  }
  
  return stripePromise
}

// Check if Stripe is configured on client side
export const isStripeConfiguredClient = () => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}

// Client-side configuration
export const STRIPE_CLIENT_CONFIG = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#10b981', // emerald-500 to match your brand
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
      },
      '.Input:focus': {
        borderColor: '#10b981',
        boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)',
      },
      '.Label': {
        fontWeight: '500',
        marginBottom: '8px',
      },
    },
  },
  clientSecret: undefined as string | undefined,
}

// Payment element options for Norwegian market
export const PAYMENT_ELEMENT_OPTIONS = {
  layout: {
    type: 'tabs' as const,
    defaultCollapsed: false,
  },
  paymentMethodOrder: ['card', 'klarna'], // Popular payment methods in Norway
  business: {
    name: 'Utleie Platform',
  },
  fields: {
    billingDetails: {
      name: 'auto' as const,
      email: 'auto' as const,
      phone: 'auto' as const,
      address: {
        country: 'never' as const, // Norway only
        line1: 'auto' as const,
        line2: 'auto' as const,
        city: 'auto' as const,
        state: 'never' as const, // Not used in Norway
        postalCode: 'auto' as const,
      },
    },
  },
}

// Common Stripe Elements styles
export const STRIPE_ELEMENTS_STYLES = {
  base: {
    fontSize: '16px',
    color: '#1f2937',
    fontFamily: 'system-ui, sans-serif',
    '::placeholder': {
      color: '#9ca3af',
    },
  },
  invalid: {
    color: '#ef4444',
    iconColor: '#ef4444',
  },
}
