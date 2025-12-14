# 🔐 Environment Variables Configuration

## Backend Environment Variables (Render)

Create these environment variables in your Render backend service:

### Core Authentication
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-min-32-chars
NODE_ENV=production
PORT=10000
```

### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### CORS Configuration
```bash
CORS_ORIGIN=https://medi-connect-360.vercel.app
```

### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google/callback
```

### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github/callback
```

### Redis (Optional - for caching)
```bash
REDIS_URL=redis://localhost:6379
```

---

## Frontend Environment Variables (Vercel)

Create these environment variables in your Vercel frontend project:

### API Configuration
```bash
VITE_API_URL=https://mediconnect-backend-orkv.onrender.com
```

---

## 🚨 Common Mistakes & Solutions

### Backend (Render)

1. **JWT_SECRET too short**
   - ❌ Wrong: `JWT_SECRET=secret123`
   - ✅ Correct: `JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars-long`
   - **Why**: Short secrets are vulnerable to brute force attacks

2. **Incorrect CORS_ORIGIN**
   - ❌ Wrong: `CORS_ORIGIN=medi-connect-360.vercel.app` (missing https://)
   - ✅ Correct: `CORS_ORIGIN=https://medi-connect-360.vercel.app`
   - **Why**: CORS requires exact protocol match

3. **Wrong OAuth Callback URLs**
   - ❌ Wrong: `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
   - ✅ Correct: `GOOGLE_CALLBACK_URL=https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google/callback`
   - **Why**: Must match production URL and use versioned routes

4. **Missing NODE_ENV**
   - ❌ Wrong: Not setting NODE_ENV
   - ✅ Correct: `NODE_ENV=production`
   - **Why**: Affects security settings (HTTPS cookies, error handling)

### Frontend (Vercel)

1. **Incorrect API URL**
   - ❌ Wrong: `VITE_API_URL=mediconnect-backend-orkv.onrender.com` (missing https://)
   - ✅ Correct: `VITE_API_URL=https://mediconnect-backend-orkv.onrender.com`
   - **Why**: Frontend needs full URL with protocol

2. **Hardcoded API paths**
   - ❌ Wrong: Using `/api/v1` directly in frontend code
   - ✅ Correct: Always use `${VITE_API_URL}/api/v1`
   - **Why**: Environment flexibility and deployment portability

---

## 🔧 OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - `https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to environment variables

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: `MediConnect-360`
   - Homepage URL: `https://medi-connect-360.vercel.app`
   - Authorization callback URL: `https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github/callback`
4. Copy Client ID and Client Secret to environment variables

---

## 🧪 Testing Environment Variables

### Backend Health Check
```bash
curl https://mediconnect-backend-orkv.onrender.com/api/v1/auth/health
```

Expected response:
```json
{
  "status": "healthy",
  "oauth": {
    "google": true,
    "github": true
  },
  "security": {
    "httpsOnly": true,
    "cookiesEnabled": true,
    "jwtConfigured": true,
    "refreshTokenConfigured": true
  }
}
```

### OAuth Redirect Test
```bash
# Test Google OAuth redirect
curl -I https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google

# Test GitHub OAuth redirect  
curl -I https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github
```

Expected: `302 Found` with `Location` header pointing to OAuth provider

---

## 🔒 Security Best Practices

1. **JWT Secrets**: Use cryptographically secure random strings (32+ characters)
2. **Environment Isolation**: Never use production secrets in development
3. **HTTPS Only**: All OAuth callbacks must use HTTPS in production
4. **CORS Strict**: Only allow your frontend domain in CORS_ORIGIN
5. **Secret Rotation**: Regularly rotate JWT secrets and OAuth credentials

---

## 📝 Environment Variable Checklist

### Before Deployment
- [ ] All backend environment variables set in Render
- [ ] All frontend environment variables set in Vercel
- [ ] OAuth providers configured with correct callback URLs
- [ ] CORS_ORIGIN matches frontend domain exactly
- [ ] JWT secrets are 32+ characters long
- [ ] NODE_ENV set to "production"
- [ ] All URLs use HTTPS protocol

### After Deployment
- [ ] Backend health check returns "healthy"
- [ ] OAuth redirects work (302 responses)
- [ ] Frontend can reach backend API
- [ ] Login/register forms work
- [ ] OAuth login buttons redirect correctly
- [ ] Cookies are set after successful authentication