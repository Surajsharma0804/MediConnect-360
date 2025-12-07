# 🔑 How to Get Your FREE API Keys

## 🤖 Google Gemini API Key (REQUIRED)

### Step 1: Go to Google AI Studio
Visit: https://aistudio.google.com/app/apikey

### Step 2: Sign In
- Use your Google account
- Accept terms if prompted

### Step 3: Create API Key
1. Click **"Create API Key"** button
2. Select **"Create API key in new project"** (or use existing)
3. Copy the key (starts with `AIza...`)

### Step 4: Enable the API
**IMPORTANT:** You may need to enable the Generative Language API:
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click **"Enable"**
3. Wait 1-2 minutes for activation

### Step 5: Verify Your Key
Test your key here: https://aistudio.google.com/app/prompts/new_chat

### Step 6: Add to Backend
Edit `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy... # Your actual key here
```

### Common Issues:

**"API key not valid"**
- Make sure you copied the FULL key
- Check for extra spaces
- Verify the API is enabled (Step 4)
- Wait 1-2 minutes after creating

**"Quota exceeded"**
- Free tier: 60 requests/minute
- Wait a minute and try again

**"API not enabled"**
- Go to Step 4 above
- Enable the Generative Language API

---

## 📧 Resend API Key (REQUIRED for emails)

### Step 1: Sign Up
Visit: https://resend.com/signup

### Step 2: Verify Email
Check your email and click verification link

### Step 3: Create API Key
1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Give it a name (e.g., "MediConnect Dev")
4. Copy the key (starts with `re_...`)

### Step 4: Add to Backend
Edit `backend/.env`:
```env
RESEND_API_KEY=re_... # Your actual key here
```

### Free Tier:
- 3,000 emails per month
- 100 emails per day
- No credit card required

---

## 🔐 Google OAuth (OPTIONAL - for Google login)

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### Step 2: Create Project (if needed)
1. Click project dropdown
2. Click "New Project"
3. Name it "MediConnect 360"
4. Click "Create"

### Step 3: Configure OAuth Consent Screen
1. Click "OAuth consent screen" in left menu
2. Select "External"
3. Fill in:
   - App name: MediConnect 360
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Add test users (your email)
7. Click "Save and Continue"

### Step 4: Create OAuth Client ID
1. Click "Credentials" in left menu
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "MediConnect 360 Web"
5. Authorized redirect URIs:
   - Add: `http://localhost:5000/api/auth/google/callback`
   - Add: `http://localhost:5173/auth/callback` (for frontend)
6. Click "Create"
7. Copy Client ID and Client Secret

### Step 5: Add to Backend
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

## 💳 Stripe API Keys (OPTIONAL - for payments)

### Step 1: Sign Up
Visit: https://dashboard.stripe.com/register

### Step 2: Get Test Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (starts with `pk_test_...`)
3. Click "Reveal test key" for Secret key
4. Copy "Secret key" (starts with `sk_test_...`)

### Step 3: Add to Backend
Edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Note:
- Test mode is FREE
- No real charges
- Switch to live keys when ready

---

## ✅ Verification Checklist

After adding all keys, verify:

### 1. Check Backend .env File
```bash
cd backend
cat .env
```

Should see:
```env
GEMINI_API_KEY=AIzaSy... (not "your-gemini-key-here")
RESEND_API_KEY=re_... (not "your-resend-key-here")
```

### 2. Restart Backend
The backend should auto-reload, but if not:
```bash
# Stop (Ctrl+C) and restart
npm run start:dev
```

### 3. Test Health Check
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok",...}`

### 4. Test AI (if Gemini key added)
```bash
curl -X POST http://localhost:5000/api/ai/symptom-check \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"headache"}'
```

Should return AI response (not error)

### 5. Test Registration (if Resend key added)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

Should send verification email

---

## 🆘 Troubleshooting

### Gemini API Not Working?

**Error: "API key not valid"**
1. Double-check you copied the FULL key
2. Make sure no extra spaces
3. Enable the API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
4. Wait 1-2 minutes after enabling
5. Try creating a new key

**Error: "Quota exceeded"**
- Free tier: 60 requests/minute
- Wait 60 seconds and try again

### Resend Not Working?

**Error: "Invalid API key"**
1. Check you copied the full key (starts with `re_`)
2. Verify email is confirmed
3. Check API key is active in dashboard

**Emails not sending?**
1. Check spam folder
2. Verify sender email in Resend dashboard
3. Check daily limit (100 emails/day free)

### Backend Not Reloading?

```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
npm run start:dev
```

---

## 📞 Need Help?

### Gemini API Issues:
- Docs: https://ai.google.dev/docs
- Support: https://developers.google.com/generative-ai/support

### Resend Issues:
- Docs: https://resend.com/docs
- Support: https://resend.com/support

### General Issues:
- Check backend logs in terminal
- Look for error messages
- Verify all keys are correct
- Restart backend after changes

---

## 🎉 Success!

Once all keys are added and working:

1. ✅ Health check returns 200 OK
2. ✅ AI symptom checker works
3. ✅ Email verification sends
4. ✅ No errors in backend logs

**You're ready to build! 🚀**

---

## 💡 Pro Tips

1. **Keep keys secret!**
   - Never commit .env to Git
   - Don't share keys publicly
   - Rotate keys regularly

2. **Use test keys in development**
   - Stripe: Use test keys
   - Google: Use test users

3. **Monitor usage**
   - Gemini: 60 req/min free
   - Resend: 3,000 emails/month free
   - Check dashboards regularly

4. **Upgrade when needed**
   - Gemini: Pay-as-you-go available
   - Resend: $20/month for 50K emails
   - Stripe: 2.9% + $0.30 per transaction

---

**Need the keys? Start here:**
1. Gemini: https://aistudio.google.com/app/apikey
2. Resend: https://resend.com/signup

**Then add them to `backend/.env` and restart!**
