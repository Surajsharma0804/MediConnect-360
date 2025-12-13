# MediConnect 360 - Deployment Guide

## 🏗️ Architecture Overview

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (NestJS/Node.js)
- **Database**: Render PostgreSQL + Redis
- **CI/CD**: GitHub Actions

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Service**: 
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select this repository: `MediConnect-360`
   - Render will automatically detect `render.yaml`
3. **Deploy**: Click "Apply" - Render will create:
   - PostgreSQL database (`mediconnect-db`)
   - Redis cache (`mediconnect-redis`)
   - Backend web service (`mediconnect-backend`)

### Step 2: Get Backend URL

After deployment completes:
1. Go to your `mediconnect-backend` service
2. Copy the service URL (e.g., `https://mediconnect-backend-xxxx.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import from GitHub: `MediConnect-360`
   - Vercel will auto-detect Vite framework
3. **Set Environment Variables**:
   ```bash
   VITE_API_URL=https://mediconnect-backend-xxxx.onrender.com
   VITE_WS_URL=wss://mediconnect-backend-xxxx.onrender.com
   VITE_ENV=production
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
   ```
4. **Deploy**: Click "Deploy"

### Step 4: Configure API Keys in Render

Go to your Render backend service → Environment:

```bash
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
```

## 🔧 Required API Keys

### 1. Google OAuth
- **Get from**: https://console.cloud.google.com/apis/credentials
- **Add to Render**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Add to Vercel**: `VITE_GOOGLE_CLIENT_ID`

### 2. Gemini AI (FREE)
- **Get from**: https://aistudio.google.com/app/apikey
- **Add to Render**: `GEMINI_API_KEY`

### 3. Resend Email (FREE)
- **Get from**: https://resend.com/api-keys
- **Add to Render**: `RESEND_API_KEY`

### 4. Stripe (Test Mode)
- **Get from**: https://dashboard.stripe.com/test/apikeys
- **Add to Render**: `STRIPE_SECRET_KEY`
- **Add to Vercel**: `VITE_STRIPE_PUBLISHABLE_KEY`

## 🎯 Deployment URLs

After successful deployment:
- **Frontend**: `https://medi-connect-360.vercel.app`
- **Backend**: `https://mediconnect-backend-xxxx.onrender.com`
- **Database**: Managed by Render (internal connection)

## 🔄 Auto-Deployment

Both services auto-deploy when you push to `main` branch:
- **Vercel**: Automatically rebuilds frontend
- **Render**: Automatically rebuilds backend
- **GitHub Actions**: Runs tests before deployment

## 🐛 Troubleshooting

### Frontend Issues
- Check Vercel build logs
- Verify environment variables are set
- Ensure `VITE_API_URL` points to correct Render URL

### Backend Issues
- Check Render service logs
- Verify database connection
- Ensure all API keys are configured

### Database Issues
- Check Render database status
- Verify connection string in backend logs
- Database auto-created by `render.yaml`

## 📊 Monitoring

- **Frontend**: Vercel Analytics (automatic)
- **Backend**: Render Metrics (automatic)
- **Database**: Render Database Metrics
- **Logs**: Available in both Vercel and Render dashboards

## 💰 Cost Breakdown

**Free Tier Limits:**
- **Render**: 750 hours/month (backend + database)
- **Vercel**: 100GB bandwidth, 6,000 build minutes
- **Total Cost**: $0/month for development and small-scale production

**Scaling:**
- **Render Pro**: $7/month (more resources)
- **Vercel Pro**: $20/month (more bandwidth)
- **Total**: ~$27/month for production scale