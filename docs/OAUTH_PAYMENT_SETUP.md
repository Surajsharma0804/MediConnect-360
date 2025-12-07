# 🔐 OAuth & Payment Setup Guide

## 📋 Overview

Complete guide to configure Google OAuth, GitHub OAuth, and Stripe payments for MediConnect 360.

---

## 🔑 **Part 1: Google OAuth Setup**

### **What You'll Get:**
- Sign in with Google button
- Access to user's Google profile
- Email verification (automatic)

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `MediConnect 360`
4. Click "Create"
5. Wait for project creation (30 seconds)

### **Step 2: Enable Google+ API**

1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it
4. Click "Enable"
5. Wait for activation

### **Step 3: Configure OAuth Consent Screen**

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (for public users)
3. Click "Create"

**Fill in the form:**

```
App name: MediConnect 360
User support email: your-email@example.com
App logo: (optional - upload your logo)

App domain:
  - Application home page: https://mediconnect360.com
  - Application privacy policy: https://mediconnect360.com/privacy
  - Application terms of service: https://mediconnect360.com/terms

Authorized domains:
  - mediconnect360.com
  - localhost (for development)

Developer contact: your-email@example.com
```

4. Click "Save and Continue"

**Scopes:**
5. Click "Add or Remove Scopes"
6. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Update" → "Save and Continue"

**Test users (for development):**
8. Add your email and test users
9. Click "Save and Continue"
10. Review and click "Back to Dashboard"

### **Step 4: Create OAuth Credentials**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: `MediConnect 360 Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:5000
https://mediconnect360.com
https://api.mediconnect360.com
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
https://api.mediconnect360.com/api/auth/google/callback
```

5. Click "Create"
6. **Copy your credentials:**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123xyz`

### **Step 5: Add to Environment Variables**

**Backend (.env):**
```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Frontend (.env):**
```bash
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

**Production:**
```bash
# Backend
GOOGLE_CALLBACK_URL=https://api.mediconnect360.com/api/auth/google/callback

# Frontend - no changes needed
```

### **Step 6: Test Google OAuth**

1. Start your app
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected back and logged in!

### **Troubleshooting:**

**"redirect_uri_mismatch" error:**
- Check that redirect URI in code matches Google Console exactly
- Include http:// or https://
- No trailing slashes

**"Access blocked" error:**
- Add your email to test users in OAuth consent screen
- Or publish your app (requires verification for production)

**"invalid_client" error:**
- Check Client ID and Secret are correct
- Restart backend server after changing .env

---

## 🐙 **Part 2: GitHub OAuth Setup**

### **What You'll Get:**
- Sign in with GitHub button
- Access to user's GitHub profile
- Email from GitHub account

### **Step 1: Create OAuth App**

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"

**Fill in the form:**

```
Application name: MediConnect 360
Homepage URL: http://localhost:5173
Application description: AI-Powered Healthcare Platform
Authorization callback URL: http://localhost:5000/api/auth/github/callback
```

3. Click "Register application"

### **Step 2: Get Credentials**

1. You'll see your **Client ID**
2. Click "Generate a new client secret"
3. **Copy immediately** (you can't see it again):
   - Client ID: `Iv1.abc123xyz`
   - Client Secret: `abc123xyz789...`

### **Step 3: Add to Environment Variables**

**Backend (.env):**
```bash
GITHUB_CLIENT_ID=Iv1.abc123xyz
GITHUB_CLIENT_SECRET=abc123xyz789...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

**Production:**
```bash
GITHUB_CALLBACK_URL=https://api.mediconnect360.com/api/auth/github/callback
```

### **Step 4: Update for Production**

1. Go back to your OAuth App settings
2. Update URLs:
   ```
   Homepage URL: https://mediconnect360.com
   Authorization callback URL: https://api.mediconnect360.com/api/auth/github/callback
   ```
3. Click "Update application"

### **Step 5: Test GitHub OAuth**

1. Start your app
2. Click "Sign in with GitHub"
3. Authorize the app
4. You should be redirected back and logged in!

### **Troubleshooting:**

**"redirect_uri_mismatch" error:**
- Check callback URL matches exactly
- Update in GitHub OAuth App settings

**"bad_verification_code" error:**
- Check Client ID and Secret are correct
- Restart backend server

**No email returned:**
- User's email might be private
- Request `user:email` scope
- Handle missing email gracefully

---

## 💳 **Part 3: Stripe Payment Setup**

### **What You'll Get:**
- Accept credit/debit cards
- Subscription management
- Payment history
- Refunds
- Webhooks for events

### **Step 1: Create Stripe Account**

1. Go to [Stripe](https://dashboard.stripe.com/register)
2. Sign up with email
3. Verify email
4. Complete business profile (can skip for testing)

### **Step 2: Get Test API Keys**

1. Go to [Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Click "Reveal test key" for secret key
4. Copy both keys

### **Step 3: Add to Environment Variables**

**Backend (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_51abc123...
STRIPE_PUBLISHABLE_KEY=pk_test_51abc123...
```

**Frontend (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc123...
```

### **Step 4: Setup Webhook (Development)**

**Option A: Stripe CLI (Recommended)**

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop install stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`)

5. Add to backend/.env:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

**Option B: ngrok (Alternative)**

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 5000
   ```
3. Copy the HTTPS URL: `https://abc123.ngrok.io`
4. Go to Stripe Dashboard → Webhooks
5. Add endpoint: `https://abc123.ngrok.io/api/payment/webhook`
6. Select events (see Step 5)
7. Copy webhook secret

### **Step 5: Setup Webhook (Production)**

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://api.mediconnect360.com/api/payment/webhook`
4. Description: `MediConnect 360 Production`

**Select events to listen to:**
```
✓ payment_intent.succeeded
✓ payment_intent.payment_failed
✓ payment_intent.canceled
✓ charge.succeeded
✓ charge.failed
✓ charge.refunded
✓ customer.created
✓ customer.updated
✓ customer.deleted
✓ customer.subscription.created
✓ customer.subscription.updated
✓ customer.subscription.deleted
✓ customer.subscription.trial_will_end
✓ invoice.paid
✓ invoice.payment_failed
✓ invoice.finalized
```

5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to production environment:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

### **Step 6: Create Products & Prices**

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"

**Free Plan:**
```
Name: Free Plan
Description: Basic features for individuals
Pricing: $0.00 / month
Recurring: Monthly
```

**Pro Plan:**
```
Name: Pro Plan
Description: Advanced features for power users
Pricing: $9.99 / month
Recurring: Monthly
```

**Family Plan:**
```
Name: Family Plan
Description: Up to 5 family members
Pricing: $19.99 / month
Recurring: Monthly
```

3. Copy the **Price ID** for each (starts with `price_`)
4. Add to your code:
   ```typescript
   // backend/src/config/stripe.config.ts
   export const STRIPE_PRICES = {
     FREE: 'price_free',
     PRO: 'price_1abc123',
     FAMILY: 'price_1xyz789',
   };
   ```

### **Step 7: Test Payments**

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
3D Secure: 4000 0025 0000 3155

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Test Flow:**
1. Start your app
2. Go to subscription page
3. Select a plan
4. Enter test card: `4242 4242 4242 4242`
5. Complete payment
6. Check Stripe Dashboard → Payments
7. Verify webhook received in backend logs

### **Step 8: Go Live (Production)**

1. Complete business profile in Stripe Dashboard
2. Add bank account for payouts
3. Verify identity (may require documents)
4. Switch to live mode (toggle in top right)
5. Get live API keys from [API Keys](https://dashboard.stripe.com/apikeys)
6. Update production environment:
   ```bash
   STRIPE_SECRET_KEY=sk_live_abc123...
   STRIPE_PUBLISHABLE_KEY=pk_live_abc123...
   ```
7. Update frontend:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_abc123...
   ```
8. Setup production webhook (see Step 5)
9. Test with real card (small amount)
10. Refund test payment

### **Step 9: Handle Webhooks in Code**

**Backend webhook handler (already implemented):**

```typescript
// backend/src/payment/payment.controller.ts
@Post('webhook')
async handleWebhook(
  @Req() req: Request,
  @Headers('stripe-signature') signature: string,
) {
  const event = this.stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await this.handlePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.created':
      await this.handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await this.handleSubscriptionCanceled(event.data.object);
      break;
    // ... more events
  }

  return { received: true };
}
```

### **Troubleshooting:**

**"No such customer" error:**
- Create customer first before charging
- Store Stripe customer ID in database

**Webhook signature verification failed:**
- Check STRIPE_WEBHOOK_SECRET is correct
- Ensure raw body is passed to webhook handler
- Don't parse JSON before verification

**Payment succeeded but webhook not received:**
- Check webhook endpoint is accessible
- Verify URL in Stripe Dashboard
- Check firewall/security rules
- Look for errors in Stripe Dashboard → Webhooks → Attempts

**3D Secure not working:**
- Use test card: 4000 0025 0000 3155
- Ensure return_url is set in payment intent
- Handle requires_action status

---

## 🔒 **Security Best Practices**

### **OAuth:**

1. **Never expose client secrets:**
   - Keep in backend .env only
   - Never commit to Git
   - Never send to frontend

2. **Validate redirect URIs:**
   - Whitelist exact URLs
   - No wildcards in production
   - Use HTTPS in production

3. **Verify tokens:**
   - Always verify OAuth tokens on backend
   - Don't trust frontend data
   - Check token expiration

4. **Handle errors gracefully:**
   - Don't expose error details to users
   - Log errors for debugging
   - Show user-friendly messages

### **Stripe:**

1. **Never expose secret key:**
   - Backend only
   - Never in frontend code
   - Never in Git

2. **Always verify webhooks:**
   - Use signature verification
   - Check event type
   - Idempotency (handle duplicates)

3. **Use HTTPS in production:**
   - Required for PCI compliance
   - Protects card data
   - Required for webhooks

4. **Store minimal card data:**
   - Never store full card numbers
   - Use Stripe tokens/payment methods
   - Let Stripe handle PCI compliance

5. **Test thoroughly:**
   - Use test mode first
   - Test all card scenarios
   - Test webhook events
   - Test refunds

---

## 📊 **Testing Checklist**

### **Google OAuth:**
- [ ] Sign in with Google works
- [ ] User profile data received
- [ ] Email verified automatically
- [ ] Logout works
- [ ] Re-login works
- [ ] Error handling works

### **GitHub OAuth:**
- [ ] Sign in with GitHub works
- [ ] User profile data received
- [ ] Email received (if public)
- [ ] Logout works
- [ ] Re-login works
- [ ] Error handling works

### **Stripe Payments:**
- [ ] Successful payment (4242...)
- [ ] Declined payment (4000 0000 0000 0002)
- [ ] Insufficient funds (4000 0000 0000 9995)
- [ ] 3D Secure (4000 0025 0000 3155)
- [ ] Subscription creation
- [ ] Subscription cancellation
- [ ] Webhook received
- [ ] Payment history shows
- [ ] Refund works
- [ ] Invoice generated

---

## 💰 **Pricing Strategy**

### **Recommended Plans:**

**Free Plan ($0/month):**
- Basic AI symptom checker
- 3 appointments/month
- Basic health tracking
- 1 family member
- Email support

**Pro Plan ($9.99/month):**
- Unlimited AI features
- Unlimited appointments
- Advanced health tracking
- 3 family members
- Priority support
- Lab result analysis
- Prescription management

**Family Plan ($19.99/month):**
- Everything in Pro
- Up to 5 family members
- Shared health records
- Family calendar
- Dedicated support

**Enterprise (Custom):**
- Custom features
- Unlimited users
- API access
- White-label option
- SLA guarantee

### **Stripe Fees:**
- 2.9% + $0.30 per transaction
- No monthly fees
- No setup fees
- Instant payouts available

**Example:**
- $9.99 subscription
- Stripe fee: $0.59
- Your revenue: $9.40

---

## 📚 **Additional Resources**

### **Google OAuth:**
- [Official Docs](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Playground](https://developers.google.com/oauthplayground/)
- [Scopes Reference](https://developers.google.com/identity/protocols/oauth2/scopes)

### **GitHub OAuth:**
- [Official Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Scopes Reference](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

### **Stripe:**
- [Official Docs](https://stripe.com/docs)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [API Reference](https://stripe.com/docs/api)

### **Related Guides:**
- [GET_API_KEYS.md](GET_API_KEYS.md) - Get all API keys
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deploy to production
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development setup

---

## 🆘 **Need Help?**

**Common Issues:**
- Check environment variables are set correctly
- Restart backend server after .env changes
- Verify URLs match exactly (no trailing slashes)
- Check firewall/security rules
- Look for errors in browser console
- Check backend logs

**Still stuck?**
- [GitHub Issues](https://github.com/YOUR_USERNAME/MediConnect-360/issues)
- [GitHub Discussions](https://github.com/YOUR_USERNAME/MediConnect-360/discussions)
- Email: support@mediconnect360.com

---

**Congratulations! OAuth and payments are now configured! 🎉**

**Last Updated:** December 2025  
**Status:** Complete & Tested ✅
