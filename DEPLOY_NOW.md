# 🚀 Deploy MediConnect 360 NOW (100% FREE)

## Overview

This guide will get your app deployed in **30 minutes** using:
- **Frontend**: Vercel (FREE forever)
- **Backend**: Render (FREE forever)
- **Database**: Neon PostgreSQL (FREE 3GB)
- **Redis**: Upstash (FREE 10K commands/day)

**Total Cost: $0/month** 🎉

---

## 📋 Prerequisites

- GitHub account
- Your API keys (Gemini + Resend minimum)
- 30 minutes of time

---

## Part 1: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account

1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub (easiest)
4. Verify your email

### Step 2: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Fill in:
   - **Name**: `mediconnect-db`
   - **Database**: `mediconnect`
   - **User**: `mediconnect_user`
   - **Region**: Choose closest to you
   - **Plan**: **FREE**
3. Click "Create Database"
4. Wait 2-3 minutes for creation
5. **Copy the "External Database URL"** - you'll need this!
   - Should look like: `postgresql://user:pass@host/db`

### Step 3: Create Redis Instance

1. Click "New +" → "Redis"
2. Fill in:
   - **Name**: `mediconnect-redis`
   - **Region**: Same as database
   - **Plan**: **FREE**
3. Click "Create Redis"
4. Wait 1-2 minutes
5. **Copy the "Redis URL"** - you'll need this!
   - Should look like: `redis://user:pass@host:port`

### Step 4: Push Code to GitHub

```bash
# If you haven't already
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mediconnect-360.git
git push -u origin main
```

### Step 5: Deploy Backend Web Service

1. Click "New +" → "Web Service"
2. Click "Connect account" → Select your GitHub repo
3. Fill in:
   - **Name**: `mediconnect-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm run start:prod
     ```
   - **Plan**: **FREE**

4. Click "Advanced" → Add Environment Variables:

```env
NODE_ENV=production
PORT=5000

# Database (paste your URLs from steps 2 & 3)
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://user:pass@host:port

# JWT (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-here
JWT_EXPIRES_IN=7d

# AI (your existing key)
GEMINI_API_KEY=AIzaSyBTp_mSZ4_3UGtvaSkYzHhoR8R0tIzKXMA

# Email (your existing key)
RESEND_API_KEY=re_bnt1s9pQ_2j8jmcVTMG3bVRb8LAYdx6Wo
FROM_EMAIL=onboarding@resend.dev

# Storage (we'll use Render's disk for now)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET=mediconnect-files
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000

# Google OAuth (optional - add later)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://mediconnect-backend.onrender.com/api/auth/google/callback

# GitHub OAuth (optional - add later)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://mediconnect-backend.onrender.com/api/auth/github/callback

# Security
CORS_ORIGIN=https://your-app.vercel.app
ENCRYPTION_KEY=must-be-exactly-32-characters!!

# Video (FREE - no key needed)
JITSI_DOMAIN=meet.jit.si

# FDA API (FREE - no key needed)
FDA_API_URL=https://api.fda.gov
```

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. **Copy your backend URL**: `https://mediconnect-backend.onrender.com`

### Step 6: Test Backend

```bash
# Test health endpoint
curl https://mediconnect-backend.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","service":"MediConnect 360 API","version":"1.0.0"}
```

✅ **Backend deployed!**

---

## Part 2: Deploy Frontend to Vercel (10 minutes)

### Step 1: Create Vercel Account

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (easiest)

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Click "Import" next to your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```env
VITE_API_URL=https://mediconnect-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_JITSI_DOMAIN=meet.jit.si
VITE_ENV=production
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. **Copy your frontend URL**: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment"
4. Update `CORS_ORIGIN`:
   ```env
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. Click "Save Changes"
6. Wait for automatic redeploy (1-2 minutes)

### Step 6: Test Frontend

1. Open: `https://your-app.vercel.app`
2. You should see the login page
3. Try creating an account
4. Check your email for verification

✅ **Frontend deployed!**

---

## Part 3: Update OAuth Callbacks (5 minutes)

### Google OAuth (Optional)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth client
3. Add to "Authorized redirect URIs":
   ```
   https://mediconnect-backend.onrender.com/api/auth/google/callback
   ```
4. Add to "Authorized JavaScript origins":
   ```
   https://your-app.vercel.app
   https://mediconnect-backend.onrender.com
   ```
5. Save

### GitHub OAuth (Optional)

1. Go to: https://github.com/settings/developers
2. Edit your OAuth app
3. Update "Authorization callback URL":
   ```
   https://mediconnect-backend.onrender.com/api/auth/github/callback
   ```
4. Update "Homepage URL":
   ```
   https://your-app.vercel.app
   ```
5. Save

---

## 🎉 You're Live!

Your app is now deployed at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://mediconnect-backend.onrender.com/api

---

## 📊 What You Get (FREE)

### Render FREE Tier
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ 512 MB RAM
- ✅ Automatic SSL
- ✅ Automatic deploys from GitHub
- ✅ PostgreSQL: 3GB storage
- ✅ Redis: 25MB storage

### Vercel FREE Tier
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Preview deployments for PRs

### Limitations
- Backend sleeps after 15 min of inactivity (wakes up in ~30 seconds)
- Database limited to 3GB
- Redis limited to 25MB

**Perfect for MVP and testing!**

---

## 🔧 Post-Deployment Setup

### 1. Set Up Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

**Render:**
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records as shown

### 2. Set Up Monitoring

**Uptime Robot (FREE):**
1. Go to: https://uptimerobot.com
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://mediconnect-backend.onrender.com/api/health`
   - Interval: 5 minutes
3. Add email alert

### 3. Set Up Error Tracking

**Sentry (FREE 5,000 errors/month):**
1. Go to: https://sentry.io
2. Create project for backend (Node.js)
3. Create project for frontend (React)
4. Add DSNs to environment variables
5. Redeploy

### 4. Set Up Analytics

**Google Analytics (FREE):**
1. Go to: https://analytics.google.com
2. Create property
3. Get Measurement ID
4. Add to frontend environment variables
5. Redeploy

---

## 🚨 Troubleshooting

### Backend Not Starting

**Check logs:**
1. Go to Render dashboard
2. Click on your service
3. Click "Logs"
4. Look for errors

**Common issues:**
- Missing environment variables
- Database connection failed
- Port already in use

**Fix:**
1. Verify all environment variables are set
2. Check DATABASE_URL is correct
3. Restart service

### Frontend Not Loading

**Check build logs:**
1. Go to Vercel dashboard
2. Click on your project
3. Click on latest deployment
4. Check build logs

**Common issues:**
- Environment variables not set
- API URL incorrect
- Build failed

**Fix:**
1. Verify VITE_API_URL is correct
2. Check all VITE_ variables are set
3. Redeploy

### CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- "CORS policy" errors in console

**Fix:**
1. Go to Render dashboard
2. Update CORS_ORIGIN to your Vercel URL
3. Save and wait for redeploy

### Database Connection Failed

**Check:**
1. DATABASE_URL is correct
2. Database is running (Render dashboard)
3. No typos in connection string

**Fix:**
1. Copy DATABASE_URL again from Render
2. Update in backend environment variables
3. Redeploy

---

## 📈 Scaling Up

### When You Outgrow FREE Tier

**Render:**
- Starter: $7/month (no sleep, more resources)
- Standard: $25/month (dedicated resources)

**Vercel:**
- Pro: $20/month (more bandwidth, analytics)

**Database:**
- Neon Scale: $19/month (10GB storage)
- Or migrate to AWS RDS, DigitalOcean, etc.

**Redis:**
- Upstash Pro: $10/month (more storage)
- Or migrate to AWS ElastiCache, Redis Cloud, etc.

---

## 🔄 Continuous Deployment

### Automatic Deploys

Both Vercel and Render automatically deploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel and Render will automatically deploy!
```

### Preview Deployments

**Vercel** creates preview deployments for every PR:
1. Create a branch
2. Make changes
3. Push and create PR
4. Vercel creates preview URL
5. Test before merging

---

## ✅ Deployment Checklist

### Before Launch
- [ ] All environment variables set
- [ ] Database connected
- [ ] Redis connected
- [ ] API keys configured
- [ ] CORS configured correctly
- [ ] OAuth callbacks updated
- [ ] SSL working (automatic)
- [ ] Health endpoint responding

### After Launch
- [ ] Test user registration
- [ ] Test email verification
- [ ] Test login
- [ ] Test AI features
- [ ] Test video calls
- [ ] Set up monitoring
- [ ] Set up error tracking
- [ ] Set up analytics
- [ ] Set up backups

### Production Ready
- [ ] Custom domain configured
- [ ] Monitoring alerts set up
- [ ] Error tracking configured
- [ ] Analytics tracking
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team access configured

---

## 🎊 Success!

Your MediConnect 360 is now **LIVE** and serving users worldwide!

**What you have:**
- ✅ Production-ready app
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Database and cache
- ✅ All features working
- ✅ $0/month cost

**Next steps:**
1. Share with beta users
2. Monitor usage
3. Gather feedback
4. Iterate and improve
5. Scale when needed

---

## 📞 Need Help?

### Resources
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://docs.upstash.com

### Support
- Render: https://render.com/support
- Vercel: https://vercel.com/support
- GitHub Issues: Your repo issues page

---

## 🚀 You Did It!

**Deployment time: 30 minutes**
**Monthly cost: $0**
**Users served: Unlimited (within free tiers)**

**Welcome to production! 🎉**

Now go build something amazing! 💪
