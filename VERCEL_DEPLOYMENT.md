# 🚀 Frontend Deployment to Vercel (FREE)

## ✅ Prerequisites
- Backend deployed on Render (wait for it to be "Live")
- GitHub account connected to your repository
- Vercel account (sign up at https://vercel.com - FREE)

---

## 📋 Step 1: Get Your Backend URL

Once your Render backend is deployed and showing "Live", copy your backend URL:

```
https://mediconnect-backend.onrender.com
```

**Test it first:**
```bash
curl https://mediconnect-backend.onrender.com/api/health
```

You should see: `{"status":"ok"}`

---

## 🎯 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository: `MediConnect-360`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (Click "Environment Variables")

   Add these 4 variables:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://mediconnect-backend.onrender.com` |
   | `VITE_WS_URL` | `wss://mediconnect-backend.onrender.com` |
   | `VITE_ENV` | `production` |
   | `VITE_GOOGLE_CLIENT_ID` | (leave empty for now) |

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://mediconnect-360.vercel.app`

---

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? mediconnect-360
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_API_URL production
# Enter: https://mediconnect-backend.onrender.com

vercel env add VITE_WS_URL production
# Enter: wss://mediconnect-backend.onrender.com

vercel env add VITE_ENV production
# Enter: production

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Update Backend CORS

Once you have your Vercel URL (e.g., `https://mediconnect-360.vercel.app`):

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select** your `mediconnect-backend` service
3. **Click** "Environment" (left sidebar)
4. **Find** `CORS_ORIGIN` variable
5. **Update** value to: `https://mediconnect-360.vercel.app`
6. **Click** "Save Changes"
7. **Wait** for automatic redeploy (2-3 minutes)

---

## ✅ Step 4: Test Your Deployment

1. **Open your Vercel URL**: `https://mediconnect-360.vercel.app`

2. **Test Registration**:
   - Click "Sign Up"
   - Enter email and password
   - Should successfully create account

3. **Test Login**:
   - Enter credentials
   - Should redirect to dashboard

4. **Test AI Features**:
   - Go to "Symptom Checker"
   - Enter symptoms
   - Should get AI response

5. **Check Browser Console**:
   - Press F12
   - Look for any errors
   - API calls should go to your Render backend

---

## 🎨 Step 5: Custom Domain (Optional)

### Add Custom Domain to Vercel:

1. **Go to** your project in Vercel
2. **Click** "Settings" → "Domains"
3. **Add** your domain (e.g., `mediconnect360.com`)
4. **Follow** DNS configuration instructions
5. **Update** `CORS_ORIGIN` in Render to your custom domain

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Deploys to production
- **Push to other branches** → Creates preview deployments
- **Pull requests** → Creates preview URLs

---

## 📊 Monitor Your Deployment

### Vercel Dashboard:
- **Analytics**: View page views, performance
- **Logs**: Check build and runtime logs
- **Deployments**: See deployment history

### Render Dashboard:
- **Logs**: Check backend API logs
- **Metrics**: View CPU, memory usage
- **Events**: See deployment history

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found`
```bash
# Solution: Check package.json dependencies
npm install
npm run build  # Test locally first
```

**Error**: `Environment variable not set`
```bash
# Solution: Add missing env vars in Vercel dashboard
# Settings → Environment Variables
```

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`

1. **Check Backend URL** in Vercel env vars
   - Should be: `https://mediconnect-backend.onrender.com`
   - NOT: `http://` (must be HTTPS)

2. **Check CORS_ORIGIN** in Render
   - Should match your Vercel URL exactly
   - Include `https://`

3. **Test Backend Directly**:
   ```bash
   curl https://mediconnect-backend.onrender.com/api/health
   ```

### Render Backend Sleeping

**Issue**: First request takes 30+ seconds

**Solution**: Render free tier sleeps after 15 minutes of inactivity
- First request wakes it up (slow)
- Subsequent requests are fast
- Upgrade to paid plan ($7/month) to prevent sleeping

---

## 💰 Cost Summary

### FREE Tier Limits:

**Vercel FREE**:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Custom domains

**Render FREE**:
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ Auto-deploy from Git
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512 MB RAM

**Total Cost**: $0/month 🎉

---

## 🚀 Next Steps

After successful deployment:

1. ✅ **Test all features** thoroughly
2. ✅ **Set up monitoring** (Sentry - optional)
3. ✅ **Add OAuth** (Google, GitHub - optional)
4. ✅ **Configure payments** (Stripe - optional)
5. ✅ **Add custom domain** (optional)
6. ✅ **Set up analytics** (Google Analytics - FREE)

---

## 📝 Environment Variables Reference

### Frontend (Vercel)
```env
VITE_API_URL=https://mediconnect-backend.onrender.com
VITE_WS_URL=wss://mediconnect-backend.onrender.com
VITE_ENV=production
VITE_GOOGLE_CLIENT_ID=  # Add later for OAuth
```

### Backend (Render)
```env
# Already configured - just update CORS_ORIGIN
CORS_ORIGIN=https://mediconnect-360.vercel.app
```

---

## 🎯 Success Checklist

- [ ] Backend is "Live" on Render
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Frontend deployed to Vercel
- [ ] All 4 environment variables added to Vercel
- [ ] CORS_ORIGIN updated in Render
- [ ] Can access frontend URL
- [ ] Can register new account
- [ ] Can login successfully
- [ ] AI features work (symptom checker)
- [ ] No console errors

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Vercel Logs**: Dashboard → Deployments → Click deployment → View logs
2. **Check Render Logs**: Dashboard → Service → Logs tab
3. **Check Browser Console**: F12 → Console tab
4. **Test Backend**: `curl https://your-backend.onrender.com/api/health`

---

**🎉 Congratulations! Your MediConnect 360 platform is now live!**
