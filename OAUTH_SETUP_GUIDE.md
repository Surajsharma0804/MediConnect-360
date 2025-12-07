# 🔐 OAuth Setup Guide - Google & GitHub

Complete guide to add social login to MediConnect 360.

---

## 📋 Prerequisites

- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ Google account
- ✅ GitHub account

---

# 1️⃣ Google OAuth Setup

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create New Project**:
   - Click "Select a project" (top bar)
   - Click "New Project"
   - Project name: `MediConnect-360`
   - Click "Create"
   - Wait for project creation (30 seconds)

3. **Select Your Project**:
   - Click "Select a project"
   - Choose "MediConnect-360"

## Step 2: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**:
   - Left menu → "APIs & Services" → "OAuth consent screen"
   - Or direct link: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**:
   - Select "External"
   - Click "Create"

3. **Fill App Information**:
   - **App name**: `MediConnect 360`
   - **User support email**: Your email
   - **App logo**: (optional, skip for now)
   - **Application home page**: `https://medi-connect-360.vercel.app`
   - **Application privacy policy**: `https://medi-connect-360.vercel.app/privacy`
   - **Application terms of service**: `https://medi-connect-360.vercel.app/terms`
   - **Authorized domains**: 
     - `vercel.app`
     - `onrender.com`
   - **Developer contact email**: Your email
   - Click "Save and Continue"

4. **Scopes** (Step 2):
   - Click "Add or Remove Scopes"
   - Select:
     - `userinfo.email`
     - `userinfo.profile`
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (Step 3):
   - Click "Add Users"
   - Add your email for testing
   - Click "Save and Continue"

6. **Summary** (Step 4):
   - Review and click "Back to Dashboard"

## Step 3: Create OAuth Credentials

1. **Go to Credentials**:
   - Left menu → "APIs & Services" → "Credentials"
   - Or: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**:
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `MediConnect 360 Web`

3. **Add Authorized Redirect URIs**:
   - Click "Add URI" under "Authorized redirect URIs"
   - Add these 3 URIs:
     ```
     https://mediconnect-backend-4ujn.onrender.com/api/auth/google/callback
     http://localhost:5000/api/auth/google/callback
     https://medi-connect-360.vercel.app/auth/callback
     ```
   - Click "Create"

4. **Copy Credentials**:
   - You'll see a popup with:
     - **Client ID**: `123456789-abc.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-abc123xyz`
   - **SAVE THESE!** You'll need them next

---

## Step 4: Add to Backend (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Select** `mediconnect-backend` service

3. **Click** "Environment" (left sidebar)

4. **Add New Variables**:

   **Variable 1:**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: `YOUR_CLIENT_ID_FROM_STEP_3`
   
   **Variable 2:**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: `YOUR_CLIENT_SECRET_FROM_STEP_3`
   
   **Variable 3:**
   - Key: `GOOGLE_CALLBACK_URL`
   - Value: `https://mediconnect-backend-4ujn.onrender.com/api/auth/google/callback`

5. **Save Changes** (will auto-redeploy, wait 2-3 minutes)

---

## Step 5: Add to Frontend (Vercel)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Select** your `medi-connect-360` project

3. **Click** "Settings" → "Environment Variables"

4. **Find** `VITE_GOOGLE_CLIENT_ID` and click "Edit"

5. **Update Value** to your Client ID from Step 3

6. **Save**

7. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

---

## ✅ Test Google OAuth

1. Open: https://medi-connect-360.vercel.app
2. Click "Sign in with Google"
3. Choose your Google account
4. Should redirect back and log you in
5. Check dashboard - should see your Google profile

---

# 2️⃣ GitHub OAuth Setup

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**: https://github.com/settings/developers

2. **Click** "OAuth Apps" (left sidebar)

3. **Click** "New OAuth App"

4. **Fill Application Details**:
   - **Application name**: `MediConnect 360`
   - **Homepage URL**: `https://medi-connect-360.vercel.app`
   - **Application description**: `Healthcare platform with AI-powered diagnostics`
   - **Authorization callback URL**: `https://mediconnect-backend-4ujn.onrender.com/api/auth/github/callback`
   - Click "Register application"

5. **Copy Client ID**:
   - You'll see: **Client ID**: `Iv1.abc123xyz`
   - **SAVE THIS!**

6. **Generate Client Secret**:
   - Click "Generate a new client secret"
   - Copy the secret: `abc123xyz456...`
   - **SAVE THIS!** (You can't see it again)

---

## Step 2: Add to Backend (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Select** `mediconnect-backend` service

3. **Click** "Environment" (left sidebar)

4. **Add New Variables**:

   **Variable 1:**
   - Key: `GITHUB_CLIENT_ID`
   - Value: `YOUR_GITHUB_CLIENT_ID`
   
   **Variable 2:**
   - Key: `GITHUB_CLIENT_SECRET`
   - Value: `YOUR_GITHUB_CLIENT_SECRET`
   
   **Variable 3:**
   - Key: `GITHUB_CALLBACK_URL`
   - Value: `https://mediconnect-backend-4ujn.onrender.com/api/auth/github/callback`

5. **Save Changes** (will auto-redeploy, wait 2-3 minutes)

---

## ✅ Test GitHub OAuth

1. Open: https://medi-connect-360.vercel.app
2. Click "Sign in with GitHub"
3. Authorize the app
4. Should redirect back and log you in
5. Check dashboard - should see your GitHub profile

---

# 🐛 Troubleshooting

## Google OAuth Issues

### Error: "redirect_uri_mismatch"
**Solution**: 
- Check that redirect URI in Google Console exactly matches:
  `https://mediconnect-backend-4ujn.onrender.com/api/auth/google/callback`
- No trailing slash
- Must be HTTPS

### Error: "Access blocked: This app's request is invalid"
**Solution**:
- Complete OAuth consent screen configuration
- Add your email as test user
- Make sure scopes include `userinfo.email` and `userinfo.profile`

### Error: "App not verified"
**Solution**:
- This is normal for testing
- Click "Advanced" → "Go to MediConnect 360 (unsafe)"
- For production, submit app for verification

---

## GitHub OAuth Issues

### Error: "The redirect_uri MUST match the registered callback URL"
**Solution**:
- Check callback URL in GitHub OAuth app settings
- Must exactly match: `https://mediconnect-backend-4ujn.onrender.com/api/auth/github/callback`

### Error: "Application suspended"
**Solution**:
- Check GitHub email for suspension notice
- Usually due to incomplete app information
- Add description and homepage URL

---

## General OAuth Issues

### Backend not recognizing OAuth credentials
**Solution**:
- Check Render logs for errors
- Verify environment variables are set correctly
- Wait for backend to fully redeploy (2-3 minutes)
- Check that variables don't have extra spaces

### Frontend not showing OAuth buttons
**Solution**:
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Redeploy frontend after adding env vars
- Clear browser cache

---

# 📊 Environment Variables Summary

## Backend (Render) - 6 new variables:
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_CALLBACK_URL=https://mediconnect-backend-4ujn.onrender.com/api/auth/google/callback

GITHUB_CLIENT_ID=Iv1.abc123xyz
GITHUB_CLIENT_SECRET=abc123xyz456...
GITHUB_CALLBACK_URL=https://mediconnect-backend-4ujn.onrender.com/api/auth/github/callback
```

## Frontend (Vercel) - 1 updated variable:
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

# 🎯 Success Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Google OAuth credentials created
- [ ] Google credentials added to Render
- [ ] Google Client ID added to Vercel
- [ ] Backend redeployed successfully
- [ ] Frontend redeployed successfully
- [ ] Google OAuth tested and working
- [ ] GitHub OAuth app created
- [ ] GitHub credentials added to Render
- [ ] GitHub OAuth tested and working

---

# 🔒 Security Best Practices

1. **Never commit credentials** to Git
2. **Use different credentials** for development and production
3. **Rotate secrets** every 90 days
4. **Monitor OAuth usage** in Google/GitHub dashboards
5. **Limit scopes** to only what you need
6. **Add rate limiting** to OAuth endpoints
7. **Log OAuth attempts** for security monitoring

---

# 📚 Next Steps

After OAuth is working:
1. ✅ Set up Stripe payments
2. ✅ Configure Sentry error tracking
3. ✅ Add custom domain
4. ✅ Submit Google app for verification (for production)

---

**Need help? Check the troubleshooting section or review Render/Vercel logs!**
