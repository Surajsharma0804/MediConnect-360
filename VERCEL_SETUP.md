# Vercel + Render Deployment Setup Guide

## 🚨 Current Issue: Missing Environment Variables

Your Vercel deployment is failing because it needs environment variables to connect to your Render backend.

## 🏗️ Your Setup:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (NestJS/Node.js)
- **Database**: Render PostgreSQL + Redis

## 🔧 Required Environment Variables for Vercel

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/surajshrama0804s-projects/medi-connect-360
- Go to Settings → Environment Variables

### 2. Add These Variables:

```bash
# Backend Connection (UPDATE WITH YOUR RENDER URL)
VITE_API_URL=https://mediconnect-backend.onrender.com
VITE_WS_URL=wss://mediconnect-backend.onrender.com
VITE_ENV=production

# Google OAuth (get from Google Console)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Optional but recommended
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key
```

## 🚀 Step-by-Step Fix:

### Step 1: Get Your Render Backend URL
1. Go to your Render dashboard
2. Find your `mediconnect-backend` service
3. Copy the URL (should be like: `https://mediconnect-backend-xxxx.onrender.com`)

### Step 2: Set Vercel Environment Variables
Add these in Vercel dashboard with YOUR actual Render URL:

```bash
VITE_API_URL=https://your-actual-render-url.onrender.com
VITE_WS_URL=wss://your-actual-render-url.onrender.com
VITE_ENV=production
VITE_GOOGLE_CLIENT_ID=placeholder-for-now
```

### Step 2: Redeploy
After adding the environment variables:
1. Go to Deployments tab in Vercel
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 3: Get Real API Keys (Later)
Once the basic deployment works, get real API keys:

1. **Google OAuth**: https://console.cloud.google.com/apis/credentials
2. **Stripe**: https://dashboard.stripe.com/test/apikeys
3. **Backend URL**: Deploy your backend first, then update VITE_API_URL

## 🔍 Common Vercel Issues & Solutions:

### Issue 1: Build Fails
- **Cause**: Missing environment variables
- **Solution**: Add all VITE_* variables in Vercel dashboard

### Issue 2: App Loads but Features Don't Work
- **Cause**: Wrong API URLs or missing keys
- **Solution**: Update environment variables with correct values

### Issue 3: OAuth Doesn't Work
- **Cause**: Wrong Google Client ID or redirect URLs
- **Solution**: 
  1. Update Google OAuth settings
  2. Add your Vercel domain to authorized origins
  3. Update VITE_GOOGLE_CLIENT_ID

## 📋 Vercel Dashboard Checklist:

- [ ] Environment Variables added
- [ ] Build Command: `npm run build` (should be automatic)
- [ ] Output Directory: `dist` (should be automatic)
- [ ] Node.js Version: 18.x or 20.x
- [ ] Framework Preset: Vite (should be detected)

## 🎯 Next Steps After Deployment:

1. **Test the deployed app**
2. **Set up your backend** (separate deployment)
3. **Update VITE_API_URL** to point to your backend
4. **Get real Google OAuth credentials**
5. **Test all features**

## 🆘 If Still Not Working:

1. Check Vercel build logs for specific errors
2. Ensure all environment variables are set
3. Try redeploying after adding variables
4. Check if there are any TypeScript errors in the build

## 📞 Backend Deployment:

Your frontend is trying to connect to a backend. You'll need to:
1. Deploy your backend (Railway, Render, or Heroku)
2. Update VITE_API_URL to the backend URL
3. Set up database and other services

Would you like help setting up the backend deployment next?