# 💳 Stripe Payment Setup Guide

Complete guide to add payment processing to MediConnect 360.

---

## 📋 Prerequisites

- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ Stripe account (sign up at https://stripe.com)

---

# 1️⃣ Create Stripe Account

## Step 1: Sign Up

1. **Go to Stripe**: https://stripe.com
2. **Click** "Start now" or "Sign up"
3. **Enter**:
   - Email address
   - Full name
   - Country
   - Password
4. **Verify** your email
5. **Complete** business profile (can skip for testing)

---

## Step 2: Get Test API Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com

2. **Enable Test Mode**:
   - Look for toggle in top-right corner
   - Make sure it says "Test mode" (not "Live mode")

3. **Get API Keys**:
   - Click "Developers" (top-right)
   - Click "API keys"
   - Or direct link: https://dashboard.stripe.com/test/apikeys

4. **Copy Keys**:
   - **Publishable key**: `pk_test_51...`
   - **Secret key**: Click "Reveal test key" → `sk_test_51...`
   - **SAVE BOTH!**

---

## Step 3: Create Webhook Endpoint

Webhooks notify your backend when payments succeed/fail.

1. **Go to Webhooks**: https://dashboard.stripe.com/test/webhooks

2. **Click** "Add endpoint"

3. **Enter Endpoint URL**:
   ```
   https://mediconnect-backend-4ujn.onrender.com/api/payment/webhook
   ```

4. **Select Events to Listen To**:
   - Click "Select events"
   - Choose these events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add events"

5. **Click** "Add endpoint"

6. **Copy Webhook Secret**:
   - Click on your newly created endpoint
   - Click "Reveal" under "Signing secret"
   - Copy: `whsec_...`
   - **SAVE THIS!**

---

# 2️⃣ Add to Backend (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Select** `mediconnect-backend` service

3. **Click** "Environment" (left sidebar)

4. **Add New Variables**:

   **Variable 1:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51...` (your secret key)
   
   **Variable 2:**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (your webhook secret)

5. **Save Changes** (will auto-redeploy, wait 2-3 minutes)

---

# 3️⃣ Add to Frontend (Vercel)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Select** your `medi-connect-360` project

3. **Click** "Settings" → "Environment Variables"

4. **Add New Variable**:
   - Key: `VITE_STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_test_51...` (your publishable key)
   - Environment: Production, Preview, Development (select all)
   - Click "Save"

5. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

---

# 4️⃣ Create Products and Prices

## Option A: Via Stripe Dashboard (Recommended)

1. **Go to Products**: https://dashboard.stripe.com/test/products

2. **Create Basic Plan**:
   - Click "Add product"
   - **Name**: `Basic Plan`
   - **Description**: `Access to basic features`
   - **Pricing model**: Standard pricing
   - **Price**: `$9.99`
   - **Billing period**: Monthly
   - Click "Save product"
   - **Copy Price ID**: `price_...` (you'll need this)

3. **Create Premium Plan**:
   - Click "Add product"
   - **Name**: `Premium Plan`
   - **Description**: `Access to all features including AI diagnostics`
   - **Pricing model**: Standard pricing
   - **Price**: `$29.99`
   - **Billing period**: Monthly
   - Click "Save product"
   - **Copy Price ID**: `price_...`

4. **Create One-Time Consultation**:
   - Click "Add product"
   - **Name**: `Video Consultation`
   - **Description**: `30-minute video consultation with a doctor`
   - **Pricing model**: Standard pricing
   - **Price**: `$49.99`
   - **Billing period**: One time
   - Click "Save product"
   - **Copy Price ID**: `price_...`

---

## Option B: Via API (Advanced)

You can create products programmatically using the Stripe API in your backend.

---

# 5️⃣ Test Payments

## Test Card Numbers

Stripe provides test cards that simulate different scenarios:

### Successful Payment:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Payment Requires Authentication (3D Secure):
```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Payment Declined:
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Insufficient Funds:
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## Test Subscription Flow

1. **Open Your App**: https://medi-connect-360.vercel.app

2. **Navigate to Pricing** or **Subscription Page**

3. **Select a Plan** (e.g., Premium Plan)

4. **Enter Test Card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

5. **Submit Payment**

6. **Verify Success**:
   - Should redirect to success page
   - Check Stripe dashboard for payment
   - Check your backend logs

---

## Test One-Time Payment

1. **Navigate to Consultation Booking**

2. **Select Time Slot**

3. **Enter Test Card** (same as above)

4. **Complete Payment**

5. **Verify**:
   - Payment appears in Stripe dashboard
   - Webhook received by backend
   - Booking confirmed in app

---

# 6️⃣ Monitor Payments

## Stripe Dashboard

1. **Payments**: https://dashboard.stripe.com/test/payments
   - View all payment attempts
   - See success/failure status
   - Refund payments

2. **Customers**: https://dashboard.stripe.com/test/customers
   - View customer list
   - See payment history
   - Manage subscriptions

3. **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
   - View active subscriptions
   - Cancel/pause subscriptions
   - Update billing

4. **Webhooks**: https://dashboard.stripe.com/test/webhooks
   - View webhook delivery status
   - Retry failed webhooks
   - Debug webhook issues

---

# 7️⃣ Go Live (When Ready)

## Before Going Live:

1. **Complete Stripe Account Setup**:
   - Add business details
   - Verify bank account
   - Complete identity verification
   - Add tax information

2. **Switch to Live Mode**:
   - Toggle "Test mode" to "Live mode" in dashboard
   - Get live API keys
   - Update environment variables

3. **Update Backend (Render)**:
   - Replace `STRIPE_SECRET_KEY` with live key: `sk_live_...`
   - Create new webhook for live mode
   - Replace `STRIPE_WEBHOOK_SECRET` with live webhook secret

4. **Update Frontend (Vercel)**:
   - Replace `VITE_STRIPE_PUBLISHABLE_KEY` with live key: `pk_live_...`

5. **Test with Real Card**:
   - Use your own card for small test payment
   - Verify everything works
   - Refund test payment

---

# 🐛 Troubleshooting

## Payment Not Processing

**Check**:
1. Stripe keys are correct (test vs live)
2. Backend logs for errors
3. Browser console for errors
4. Stripe dashboard for payment attempts

**Common Issues**:
- Wrong API key (using live key in test mode)
- CORS errors (check backend CORS settings)
- Webhook secret mismatch
- Network timeout (Render free tier sleeping)

---

## Webhook Not Receiving Events

**Check**:
1. Webhook URL is correct
2. Webhook secret matches environment variable
3. Events are selected in Stripe dashboard
4. Backend endpoint is accessible

**Test Webhook**:
1. Go to Stripe webhook settings
2. Click "Send test webhook"
3. Check backend logs for received event

---

## Subscription Not Creating

**Check**:
1. Price ID is correct
2. Customer exists in Stripe
3. Payment method attached to customer
4. Backend logs for errors

---

## 3D Secure Not Working

**Solution**:
- Use test card: `4000 0025 0000 3155`
- Complete authentication in popup
- Check that popup isn't blocked
- Verify Stripe.js is loaded

---

# 📊 Environment Variables Summary

## Backend (Render) - 2 new variables:
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Frontend (Vercel) - 1 new variable:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

---

# 💰 Pricing Strategy

## Recommended Plans:

### Free Tier:
- Basic symptom checker
- Limited AI consultations (5/month)
- Health record storage
- **Price**: $0

### Basic Plan ($9.99/month):
- Unlimited symptom checker
- 20 AI consultations/month
- Video consultations (pay per use)
- Health record storage
- Email support

### Premium Plan ($29.99/month):
- Everything in Basic
- Unlimited AI consultations
- 2 free video consultations/month
- Priority support
- Advanced analytics
- Family account (up to 4 members)

### One-Time Services:
- Video Consultation: $49.99
- Specialist Referral: $19.99
- Medical Report Analysis: $29.99

---

# 🎯 Success Checklist

- [ ] Stripe account created
- [ ] Test mode enabled
- [ ] API keys copied
- [ ] Webhook endpoint created
- [ ] Webhook secret copied
- [ ] Backend environment variables added
- [ ] Frontend environment variable added
- [ ] Backend redeployed
- [ ] Frontend redeployed
- [ ] Products created in Stripe
- [ ] Test payment successful
- [ ] Webhook received
- [ ] Subscription tested
- [ ] Payment appears in dashboard

---

# 🔒 Security Best Practices

1. **Never expose secret key** in frontend
2. **Always validate webhooks** using signature
3. **Use HTTPS** for all payment pages
4. **Store minimal card data** (let Stripe handle it)
5. **Implement idempotency** for payment requests
6. **Log all payment attempts** for audit
7. **Set up fraud detection** in Stripe dashboard
8. **Enable 3D Secure** for European customers
9. **Comply with PCI DSS** (Stripe handles most of this)
10. **Rotate API keys** regularly

---

# 📚 Next Steps

After Stripe is working:
1. ✅ Set up Sentry error tracking
2. ✅ Add subscription management UI
3. ✅ Implement refund flow
4. ✅ Add invoice generation
5. ✅ Set up email receipts
6. ✅ Configure tax collection (if needed)

---

**Need help? Check Stripe documentation: https://stripe.com/docs**
