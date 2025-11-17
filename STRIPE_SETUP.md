# Stripe Payment Integration Setup Guide

This guide will help you configure Stripe payments for Studio 535, enabling customers to purchase products/services and pay project deposits/balances.

## Features Implemented

✅ **Product/Service Purchases** - Shop page with catalog of items  
✅ **Project Deposits** - 10% deposit payment when accepting quotes  
✅ **Balance Payments** - 90% final payment upon project completion  
✅ **Webhook Handler** - Automatic order tracking and fulfillment  
✅ **Payment Success Page** - Confirmation page after successful checkout

---

## Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a free Stripe account
3. Complete business verification (required for live payments)

---

## Step 2: Get API Keys

### Test Mode Keys (for development)

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

### Live Mode Keys (for production)

1. Toggle **View test data** OFF in the Stripe dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)

---

## Step 3: Configure Webhook

Webhooks allow Stripe to notify your server when payments succeed or fail.

1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   - **Test mode**: `https://your-dev-url.com/api/stripe/webhook`
   - **Live mode**: `https://studio535.yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

---

## Step 4: Add Environment Variables

Add these variables to your deployment platform (Vercel, Railway, etc.):

```bash
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_..." # Use sk_live_ for production
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Use pk_live_ for production

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### For Local Development

Create a `.env.local` file in the project root:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## Step 5: Test Payments

### Test Credit Cards

Stripe provides test cards that simulate different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0069` | Expired card |

**Test Card Details:**
- **Expiration**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Testing Workflow

1. **Test Product Purchase**:
   - Go to `/shop`
   - Click "Purchase Now" on any product
   - Use test card `4242 4242 4242 4242`
   - Complete checkout
   - Verify redirect to `/payment/success`

2. **Test Webhook** (local development):
   ```bash
   # Install Stripe CLI
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   
   # Test webhook
   stripe trigger checkout.session.completed
   ```

3. **Verify in Stripe Dashboard**:
   - Go to **Payments** to see test transactions
   - Go to **Developers** → **Webhooks** to see webhook events

---

## Step 6: Customize Product Catalog

Edit `server/products.ts` to add/modify your actual products and services:

```typescript
export const PRODUCTS: ProductDefinition[] = [
  {
    id: "your-product-id",
    name: "Your Product Name",
    description: "Product description",
    price: 10000, // $100.00 (in cents)
    currency: "USD",
    category: "product", // or "service"
    imageUrl: "/products/your-image.jpg",
  },
  // Add more products...
];
```

**Important**: Prices are in **cents** (e.g., $150.00 = 15000 cents)

---

## Step 7: Go Live

### Pre-Launch Checklist

- [ ] Business verification completed in Stripe
- [ ] Live API keys configured in production environment
- [ ] Webhook endpoint configured with live URL
- [ ] Product catalog updated with real products and prices
- [ ] Test purchases completed successfully
- [ ] Webhook events verified in Stripe dashboard

### Switch to Live Mode

1. Replace test API keys with live keys in environment variables
2. Update webhook URL to production domain
3. Toggle **View test data** OFF in Stripe dashboard
4. Monitor first real transactions closely

---

## Payment Flow Diagrams

### Product Purchase Flow

```
Customer → Shop Page → Click "Purchase" → Stripe Checkout
  ↓
Stripe processes payment
  ↓
Webhook notifies server → Create order record
  ↓
Redirect to Success Page → Email confirmation
```

### Project Deposit Flow (10%)

```
Admin creates quote → Client accepts quote → Click "Pay Deposit"
  ↓
Stripe Checkout (10% of total)
  ↓
Webhook creates order → Links to project
  ↓
Project status updated → Work begins
```

### Balance Payment Flow (90%)

```
Project completed → Admin requests balance payment
  ↓
Client clicks "Pay Balance" → Stripe Checkout (90% of total)
  ↓
Webhook creates order → Project marked complete
  ↓
Final delivery and fulfillment
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is publicly accessible
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Check server logs for webhook errors
4. Use Stripe CLI to test locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Payment Fails Immediately

1. Verify `STRIPE_SECRET_KEY` is correct
2. Check API key is for correct mode (test vs. live)
3. Ensure Stripe account is activated

### Checkout Session Not Creating

1. Check browser console for errors
2. Verify user is authenticated
3. Confirm `VITE_STRIPE_PUBLISHABLE_KEY` is set
4. Check network tab for failed API calls

---

## Security Best Practices

✅ **Never expose secret keys** - Only use `VITE_STRIPE_PUBLISHABLE_KEY` in frontend  
✅ **Validate webhook signatures** - Always verify `stripe-signature` header  
✅ **Use HTTPS in production** - Required for PCI compliance  
✅ **Store minimal payment data** - Let Stripe handle sensitive card information  
✅ **Implement idempotency** - Handle duplicate webhook events gracefully

---

## Support Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Next Steps

1. **Claim Stripe Test Sandbox** - Check the Manus dashboard for your pre-configured test environment
2. **Add Product Images** - Upload real product photos to `/client/public/products/`
3. **Customize Email Notifications** - Set up Stripe email templates for receipts
4. **Enable Promo Codes** - Configure discount codes in Stripe dashboard
5. **Set Up Subscriptions** - If offering recurring services, configure subscription products

---

**Need Help?** Contact Stripe support or consult the [Stripe API Reference](https://stripe.com/docs/api) for detailed documentation.
