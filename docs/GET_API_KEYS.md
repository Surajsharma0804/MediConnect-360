# 🔑 API Keys Guide - Get All Required Keys

## 📋 Overview

This guide shows you how to get all API keys needed for MediConnect 360. Most services offer FREE tiers!

---

## 🤖 **1. Google Gemini AI (Required - FREE)**

**What it's for:** AI symptom checker, health assistant, voice chat

**Cost:** FREE (60 requests/minute, no credit card needed)

### Steps:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Add to `.env` files:
   ```bash
   GEMINI_API_KEY=AIzaSy_your_key_here
   ```

**Alternative: OpenAI (Paid)**
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create account and add payment method
- Create API key
- Cost: ~$0.002 per request (expensive!)

---

## 📧 **2. Resend Email (Required - FREE)**

**What it's for:** Email notifications, appointment reminders

**Cost:** FREE (3,000 emails/month, no credit card to start)

### Steps:
1. Go to [Resend](https://resend.com/signup)
2. Sign up with email
3. Verify your email
4. Go to [API Keys](https://resend.com/api-keys)
5. Click "Create API Key"
6. Copy the key (starts with `re_...`)
7. Add to `backend/.env`:
   ```bash
   RESEND_API_KEY=re_your_key_here
   FROM_EMAIL=onboarding@resend.dev
   ```

**Alternative: Brevo (formerly Sendinblue)**
- Go to [Brevo](https://www.brevo.com/)
- Free: 300 emails/day
- Get API key from Settings > SMTP & API

---

## 💳 **3. Stripe Payments (Required - FREE Test Mode)**

**What it's for:** Payment processing, subscriptions

**Cost:** FREE for testing (use test keys)

### Steps:
1. Go to [Stripe](https://dashboard.stripe.com/register)
2. Create account
3. Go to [Test API Keys](https://dashboard.stripe.com/test/apikeys)
4. Copy both keys:
   - Publishable key (starts with `pk_test_...`)
   - Secret key (starts with `sk_test_...`)
5. Add to `.env` files:
   ```bash
   # Frontend .env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   
   # Backend .env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

### Webhook Setup:
1. Install Stripe CLI: [Download](https://stripe.com/docs/stripe-cli)
2. Run: `stripe listen --forward-to localhost:5000/api/payment/webhook`
3. Copy webhook secret (starts with `whsec_...`)
4. Add to `backend/.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

## 🔐 **4. Google OAuth (Optional)**

**What it's for:** Sign in with Google

**Cost:** FREE

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure consent screen:
   - User Type: External
   - App name: MediConnect 360
   - Support email: your email
   - Authorized domains: localhost (for dev)
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (dev)
     - `https://your-domain.com/api/auth/google/callback` (prod)
7. Copy Client ID and Client Secret
8. Add to `backend/.env`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
9. Add Client ID to frontend `.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

---

## 🐙 **5. GitHub OAuth (Optional)**

**What it's for:** Sign in with GitHub

**Cost:** FREE

### Steps:
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" > "New OAuth App"
3. Fill in:
   - Application name: MediConnect 360
   - Homepage URL: `http://localhost:5173` (dev)
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy Client ID
6. Generate Client Secret
7. Add to `backend/.env`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   ```

---

## 🗄️ **6. Database (PostgreSQL)**

### Option A: Local (Docker - FREE)
Already configured in `docker-compose.yml`:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/mediconnect
```

### Option B: Neon (Cloud - FREE)
1. Go to [Neon](https://neon.tech/)
2. Sign up (FREE tier: 0.5GB storage)
3. Create new project
4. Copy connection string
5. Add to `backend/.env`:
   ```bash
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/mediconnect?sslmode=require
   ```

### Option C: Supabase (Cloud - FREE)
1. Go to [Supabase](https://supabase.com/)
2. Create project (FREE tier: 500MB)
3. Go to Settings > Database
4. Copy connection string
5. Add to `backend/.env`

---

## 🔴 **7. Redis (Cache)**

### Option A: Local (Docker - FREE)
Already configured in `docker-compose.yml`:
```bash
REDIS_URL=redis://localhost:6379
```

### Option B: Upstash (Cloud - FREE)
1. Go to [Upstash](https://upstash.com/)
2. Create account (FREE tier: 10K commands/day)
3. Create Redis database
4. Copy connection string
5. Add to `backend/.env`:
   ```bash
   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
   ```

---

## 📦 **8. File Storage (S3-Compatible)**

### Option A: MinIO (Local - FREE)
Already configured in `docker-compose.yml`:
```bash
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET=mediconnect-files
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000
```

### Option B: AWS S3 (Cloud - Paid)
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create S3 bucket
3. Create IAM user with S3 access
4. Generate access keys
5. Add to `backend/.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   AWS_ENDPOINT=  # Leave empty for real AWS
   ```

### Option C: Cloudflare R2 (Cloud - FREE 10GB)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Create R2 bucket
3. Generate API tokens
4. Add to `backend/.env` (S3-compatible)

---

## 📱 **9. SMS (Optional)**

### Option A: Console Log (Dev - FREE)
Already configured:
```bash
SMS_PROVIDER=console_log
```

### Option B: Twilio (Production - Paid)
1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up (FREE trial: $15 credit)
3. Get phone number
4. Copy Account SID and Auth Token
5. Add to `backend/.env`:
   ```bash
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

## 🎥 **10. Video Calls**

### Option A: Jitsi (Public - FREE)
Already configured:
```bash
VIDEO_PROVIDER=jitsi
JITSI_DOMAIN=meet.jit.si
```

### Option B: Self-Hosted Jitsi (FREE)
1. Deploy Jitsi on your server
2. Update domain:
   ```bash
   JITSI_DOMAIN=meet.yourdomain.com
   ```

### Option C: Twilio Video (Paid)
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Enable Video API
3. Get API credentials
4. Add to `backend/.env`:
   ```bash
   VIDEO_PROVIDER=twilio
   TWILIO_API_KEY=your_api_key
   TWILIO_API_SECRET=your_api_secret
   ```

---

## ✅ **Quick Setup Checklist**

### Required (FREE):
- [ ] Google Gemini API key
- [ ] Resend email API key
- [ ] Stripe test keys
- [ ] PostgreSQL (Docker or Neon)
- [ ] Redis (Docker or Upstash)
- [ ] MinIO (Docker) or S3

### Optional:
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Twilio SMS
- [ ] Custom video provider

---

## 🔒 **Security Best Practices**

1. **Never commit API keys to Git**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate keys regularly**
   - Change keys every 90 days
   - Immediately if compromised

3. **Use different keys for dev/prod**
   - Test keys for development
   - Production keys for live site

4. **Restrict API key permissions**
   - Only grant necessary permissions
   - Use IP restrictions when possible

5. **Monitor API usage**
   - Set up billing alerts
   - Track unusual activity

---

## 💰 **Cost Summary**

### Development (Local):
- **Total: $0/month** (all free services)

### Production (1,000 users):
- Gemini: FREE
- Resend: FREE (3,000 emails/month)
- Stripe: 2.9% + $0.30 per transaction
- Neon: FREE (0.5GB)
- Upstash: FREE (10K commands/day)
- **Total: ~$0-20/month**

### Production (10,000 users):
- Gemini: FREE
- Resend Pro: $20/month
- Stripe: Transaction fees
- Neon: $19/month (3GB)
- Upstash: $10/month
- **Total: ~$50-100/month**

---

## 🆘 **Troubleshooting**

### API Key Not Working?
1. Check for typos
2. Verify key is active
3. Check API quotas/limits
4. Restart backend server
5. Clear cache

### Rate Limit Errors?
1. Check API usage dashboard
2. Upgrade to paid tier
3. Implement caching
4. Add retry logic

### Need Help?
- Check service documentation
- Contact support
- Ask in community forums

---

## 📚 **Additional Resources**

- [Environment Variables Guide](.env.example)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [OAuth Setup](OAUTH_PAYMENT_SETUP.md)
- [Main README](../README.md)

---

**Last Updated:** December 2025  
**Status:** Complete & Tested ✅

