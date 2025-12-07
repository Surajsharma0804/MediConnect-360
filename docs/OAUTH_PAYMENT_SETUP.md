# 🔐 OAuth & Payment Integration Setup Guide

## Complete Setup for Google, GitHub OAuth & Stripe Payments

---

## 🎯 What You're Adding

### 1. Google OAuth ✅
- Sign in with Google
- Automatic account creation
- Profile sync

### 2. GitHub OAuth ✅
- Sign in with GitHub
- Developer-friendly login
- Profile sync

### 3. Stripe Payments ✅
- One-time payments
- Subscriptions
- Secure checkout
- Webhook handling

---

## 🔐 Part 1: Google OAuth Setup

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### Step 2: Create Project (if needed)
1. Click project dropdown (top left)
2. Click **"New Project"**
3. Name: **"MediConnect 360"**
4. Click **"Create"**
5. Wait for project creation

### Step 3: Enable Google+ API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Google+ API"**
3. Click on it
4. Click **"Enable"**

### Step 4: Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select **"External"**
3. Click **"Create"**
4. Fill in:
   - **App name:** MediConnect 360
   - **User support email:** your@email.com
   - **Developer contact:** your@email.com
5. Click **"Save and Continue"**
6. **Scopes:** Click "Save and Continue" (skip)
7. **Test users:** Add your email
8. Click **"Save and Continue"**
9. Click **"Back to Dashboard"**

### Step 5: Create OAuth Client ID
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Application type: **"Web application"**
4. Name: **"MediConnect 360 Web"**
5. **Authorized JavaScript origins:**
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5000`
6. **Authorized redirect URIs:**
   - Add: `http://localhost:5000/api/auth/google/callback`
7. Click **"Create"**
8. **Copy Client ID and Client Secret**

### Step 6: Add to Backend .env
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 🐙 Part 2: GitHub OAuth Setup

### Step 1: Go to GitHub Settings
Visit: https://github.com/settings/developers

### Step 2: Create OAuth App
1. Click **"OAuth Apps"** in left menu
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** MediConnect 360
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
   - **Application description:** Healthcare platform with AI diagnostics
4. Click **"Register application"**

### Step 3: Get Client ID and Secret
1. You'll see your **Client ID** immediately
2. Click **"Generate a new client secret"**
3. **Copy both Client ID and Client Secret** (secret shown only once!)

### Step 4: Add to Backend .env
Edit `backend/.env`:
```env
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

## 💳 Part 3: Stripe Payment Setup

### Step 1: Create Stripe Account
Visit: https://dashboard.stripe.com/register

1. Enter your email
2. Create password
3. Verify email
4. Complete account setup

### Step 2: Get Test API Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (click "Reveal test key", starts with `sk_test_...`)
3. **Copy both keys**

### Step 3: Get Webhook Secret (Optional but Recommended)
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `http://localhost:5000/api/payment/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Click on your new webhook
7. Click **"Reveal"** under "Signing secret"
8. **Copy the webhook secret** (starts with `whsec_...`)

### Step 4: Add to Backend .env
Edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_51Abc...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...xyz
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
```

---

## 🧪 Testing Your Setup

### Test Google OAuth
```bash
# Open in browser:
http://localhost:5000/api/auth/google

# Should redirect to Google login
# After login, redirects back with token
```

### Test GitHub OAuth
```bash
# Open in browser:
http://localhost:5000/api/auth/github

# Should redirect to GitHub login
# After login, redirects back with token
```

### Test Stripe Payment
```bash
# Create payment intent
curl -X POST http://localhost:5000/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 29.99, "currency": "usd"}'

# Response will include clientSecret for frontend
```

---

## 🎨 Frontend Integration

### Update Login Page with OAuth Buttons

The frontend already has Google OAuth button. Now add GitHub:

```typescript
// In src/pages/LoginPage.tsx

// Add GitHub button after Google button:
<button
  onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
  className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
>
  <Github className="w-5 h-5" />
  {isLogin ? "Sign in with GitHub" : "Sign up with GitHub"}
</button>
```

### Add Stripe Checkout

```typescript
// Create new file: src/services/payment.ts

export const createCheckoutSession = async (priceId: string) => {
  const response = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      priceId,
      successUrl: 'http://localhost:5173/payment/success',
      cancelUrl: 'http://localhost:5173/payment/cancel',
    }),
  });
  
  const session = await response.json();
  window.location.href = session.url;
};
```

---

## 📊 Available API Endpoints

### Authentication Endpoints
```
GET  /api/auth/google              - Initiate Google OAuth
GET  /api/auth/google/callback     - Google OAuth callback
GET  /api/auth/github              - Initiate GitHub OAuth
GET  /api/auth/github/callback     - GitHub OAuth callback
POST /api/auth/register            - Email/password registration
POST /api/auth/login               - Email/password login
```

### Payment Endpoints
```
POST /api/payment/create-intent              - Create payment intent
POST /api/payment/create-checkout-session    - Create Stripe checkout
POST /api/payment/create-customer            - Create Stripe customer
POST /api/payment/create-subscription        - Create subscription
POST /api/payment/cancel-subscription/:id    - Cancel subscription
GET  /api/payment/intent/:id                 - Get payment intent
POST /api/payment/webhook                    - Stripe webhook handler
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different keys for dev/prod
- ✅ Rotate secrets regularly

### 2. OAuth Security
- ✅ Validate redirect URIs
- ✅ Use state parameter (handled by Passport)
- ✅ Verify tokens server-side

### 3. Payment Security
- ✅ Never expose secret keys to frontend
- ✅ Validate webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement idempotency keys

---

## 💰 Stripe Pricing Plans

### Recommended Plans for MediConnect 360

#### Free Tier
```typescript
// No payment needed
- AI symptom checker
- Basic health tracking
- Limited consultations
```

#### Premium Plan ($9.99/month)
```typescript
const PREMIUM_PRICE_ID = 'price_1234...'; // Create in Stripe Dashboard

Features:
- Unlimited AI consultations
- Video consultations
- Health records storage
- Priority support
```

#### Pro Plan ($29.99/month)
```typescript
const PRO_PRICE_ID = 'price_5678...'; // Create in Stripe Dashboard

Features:
- Everything in Premium
- Family accounts (up to 5 members)
- Advanced analytics
- Dedicated health coach
- API access
```

### Create Prices in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Name: "MediConnect 360 Premium"
4. Price: $9.99
5. Billing period: Monthly
6. Click **"Save product"**
7. Copy the **Price ID** (starts with `price_...`)

---

## 🧪 Test Cards for Stripe

### Successful Payment
```
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Payment Requires Authentication
```
Card: 4000 0025 0000 3155
Exp: Any future date
CVC: Any 3 digits
```

### Payment Declined
```
Card: 4000 0000 0000 0002
Exp: Any future date
CVC: Any 3 digits
```

---

## 🚀 Production Deployment

### Before Going Live:

#### 1. Google OAuth
- Switch to production credentials
- Update redirect URIs to production domain
- Complete OAuth consent screen verification

#### 2. GitHub OAuth
- Create new OAuth app for production
- Update callback URL to production domain

#### 3. Stripe
- Switch from test keys to live keys
- Update webhook endpoint to production URL
- Complete Stripe account verification
- Set up proper error handling

#### 4. Environment Variables
```env
# Production .env
GOOGLE_CLIENT_ID=prod-client-id
GOOGLE_CLIENT_SECRET=prod-secret
GITHUB_CLIENT_ID=prod-client-id
GITHUB_CLIENT_SECRET=prod-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📝 Quick Reference

### Backend .env Template
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
```

### Testing Checklist
- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] Payment intent creation works
- [ ] Checkout session creation works
- [ ] Webhook receives events
- [ ] User accounts link properly
- [ ] Tokens are generated correctly

---

## 🎉 You're All Set!

### What You Can Do Now:
1. ✅ Users can sign in with Google
2. ✅ Users can sign in with GitHub
3. ✅ Accept one-time payments
4. ✅ Create subscriptions
5. ✅ Handle webhooks
6. ✅ Manage customers

### Next Steps:
1. Test all OAuth flows
2. Test payment flows
3. Implement subscription UI
4. Add payment success/cancel pages
5. Deploy to production!

---

<div align="center">

**🔐 OAuth & Payments Fully Integrated! 🔐**

**Built with ❤️ for secure, seamless user experience**

</div>
