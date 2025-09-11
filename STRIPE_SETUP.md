# Stripe Setup Guide for Sponsored Listings

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
# Get these from https://dashboard.stripe.com/apikeys

# Public key (safe to expose in client-side code)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret key (keep this secure, server-side only)
STRIPE_SECRET_KEY=sk_test_...

# Webhook endpoint secret (for verifying webhook signatures)
# Get this from https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URL for webhook redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Dashboard Setup

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Complete business verification for Norwegian market
- Enable NOK currency support

### 2. Get API Keys
- Navigate to Developers > API keys
- Copy the Publishable key and Secret key
- Add them to your environment variables

### 3. Create Webhook Endpoint
- Go to Developers > Webhooks
- Click "Add endpoint"
- URL: `https://yourdomain.com/api/webhooks/stripe` (use ngrok for local development)
- Events to listen for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `customer.created`
  - `customer.updated`
- Copy the webhook secret to your environment variables

### 4. Configure Products (Optional)
The system will automatically create Stripe products for sponsorship packages, but you can also create them manually in the Stripe dashboard.

## Database Migration

Run the migration to create the necessary tables:

```bash
# Apply the migration (you'll need to run this SQL on your database)
psql $DATABASE_URL -f migrations/add_sponsored_listings_and_payments.sql
```

## Testing

### Test Cards for Norwegian Market
- Visa: `4000 0027 6000 0016`
- Mastercard: `5555 5555 5555 4444`
- Klarna: Use test mode in Stripe dashboard

### Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Deployment

1. Switch to live mode in Stripe dashboard
2. Update environment variables with live keys
3. Configure production webhook URL
4. Test with small amounts first
5. Monitor payments in Stripe dashboard

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Norwegian Payment Methods](https://stripe.com/docs/payments/payment-methods/overview#norway)
