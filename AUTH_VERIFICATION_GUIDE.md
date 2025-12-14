# 🧪 Authentication System Verification Guide

## 🏥 Health Checks

### 1. Backend Health Check
```bash
curl https://mediconnect-backend-orkv.onrender.com/api/v1/auth/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-14T...",
  "version": "v1",
  "environment": "production",
  "oauth": {
    "google": true,
    "github": true
  },
  "security": {
    "httpsOnly": true,
    "cookiesEnabled": true,
    "jwtConfigured": true,
    "refreshTokenConfigured": true
  },
  "routes": [
    "POST /api/v1/auth/register",
    "POST /api/v1/auth/login",
    "POST /api/v1/auth/logout",
    "GET /api/v1/auth/me",
    "GET /api/v1/auth/google",
    "GET /api/v1/auth/google/callback",
    "GET /api/v1/auth/github",
    "GET /api/v1/auth/github/callback",
    "POST /api/v1/auth/refresh"
  ]
}
```

### 2. Main Health Check
```bash
curl https://mediconnect-backend-orkv.onrender.com/health/v1
```

**Should include auth status in response.**

---

## 🔐 Authentication Flow Tests

### 1. User Registration Test

**PowerShell:**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "SecurePassword123!"
    role = "patient"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mediconnect-backend-orkv.onrender.com/api/v1/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SessionVariable session
```

**cURL:**
```bash
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "SecurePassword123!",
    "role": "patient"
  }' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "role": "patient",
    "isEmailVerified": false,
    "isTwoFactorEnabled": false
  },
  "message": "Registration successful"
}
```

### 2. User Login Test

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "SecurePassword123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mediconnect-backend-orkv.onrender.com/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SessionVariable session
```

**cURL:**
```bash
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

### 3. Get Current User Test

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://mediconnect-backend-orkv.onrender.com/api/v1/auth/me" `
    -Method GET `
    -WebSession $session
```

**cURL:**
```bash
curl -X GET https://mediconnect-backend-orkv.onrender.com/api/v1/auth/me \
  -b cookies.txt
```

### 4. Logout Test

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://mediconnect-backend-orkv.onrender.com/api/v1/auth/logout" `
    -Method POST `
    -WebSession $session
```

**cURL:**
```bash
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/logout \
  -b cookies.txt
```

---

## 🔗 OAuth Flow Tests

### 1. Google OAuth Redirect Test

**Browser Test:**
1. Navigate to: `https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google`
2. Should redirect to Google OAuth consent screen
3. After consent, should redirect to: `https://medi-connect-360.vercel.app/auth/callback?success=true`

**cURL Test:**
```bash
curl -I https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google
```

**Expected Response:**
```
HTTP/2 302
location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
```

### 2. GitHub OAuth Redirect Test

**Browser Test:**
1. Navigate to: `https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github`
2. Should redirect to GitHub OAuth consent screen
3. After consent, should redirect to: `https://medi-connect-360.vercel.app/auth/callback?success=true`

**cURL Test:**
```bash
curl -I https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github
```

**Expected Response:**
```
HTTP/2 302
location: https://github.com/login/oauth/authorize?client_id=...
```

---

## 🍪 Cookie Security Tests

### 1. Check Cookie Settings

After successful login, inspect cookies in browser DevTools:

**Expected Cookies:**
- `accessToken`: HttpOnly, Secure (in production), SameSite=Lax, Max-Age=900 (15 min)
- `refreshToken`: HttpOnly, Secure (in production), SameSite=Lax, Max-Age=604800 (7 days)

### 2. Token Refresh Test

**PowerShell:**
```powershell
# Wait for access token to expire (15 minutes) or manually test
Invoke-RestMethod -Uri "https://mediconnect-backend-orkv.onrender.com/api/v1/auth/refresh" `
    -Method POST `
    -WebSession $session
```

**cURL:**
```bash
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/refresh \
  -b cookies.txt \
  -c cookies_new.txt
```

---

## 🌐 Frontend Integration Tests

### 1. Frontend Health Check
```bash
curl https://medi-connect-360.vercel.app
```

**Should return 200 OK with React app.**

### 2. Environment Variable Check

In browser console on frontend:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
// Should log: https://mediconnect-backend-orkv.onrender.com
```

### 3. Frontend OAuth Button Test

1. Navigate to: `https://medi-connect-360.vercel.app/login`
2. Click "Sign in with Google" button
3. Should redirect to: `https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google`
4. Complete OAuth flow
5. Should return to: `https://medi-connect-360.vercel.app/auth/callback?success=true`
6. Should then redirect to dashboard

---

## 🚨 Error Scenarios to Test

### 1. Invalid Credentials
```bash
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

**Expected:** 401 Unauthorized

### 2. Duplicate Registration
```bash
# Register same email twice
curl -X POST https://mediconnect-backend-orkv.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com", "password": "password123"}'
```

**Expected:** 409 Conflict

### 3. Unauthorized Access
```bash
curl -X GET https://mediconnect-backend-orkv.onrender.com/api/v1/auth/me
# Without cookies
```

**Expected:** 401 Unauthorized

### 4. OAuth Error Handling

Navigate to: `https://medi-connect-360.vercel.app/auth/callback?error=oauth_failed`

**Expected:** Error message displayed, redirect to login after 3 seconds

---

## ✅ Success Criteria Checklist

### Backend
- [ ] Health endpoint returns "healthy" status
- [ ] All auth routes return correct HTTP status codes
- [ ] OAuth redirects work (302 responses to provider URLs)
- [ ] Cookies are set with correct security flags
- [ ] JWT tokens are properly signed and validated
- [ ] Token refresh works automatically
- [ ] Error responses are properly formatted

### Frontend
- [ ] Login page loads without errors
- [ ] Registration form works
- [ ] Login form works
- [ ] OAuth buttons redirect correctly
- [ ] Auth callback page handles success/error states
- [ ] Protected routes require authentication
- [ ] User data is displayed correctly after login
- [ ] Logout clears authentication state

### Integration
- [ ] Frontend can communicate with backend
- [ ] CORS is properly configured
- [ ] OAuth flow completes end-to-end
- [ ] Cookies persist across requests
- [ ] Token refresh happens transparently
- [ ] Error states are handled gracefully

### Security
- [ ] Passwords are hashed (never stored in plain text)
- [ ] JWT secrets are secure and not exposed
- [ ] Cookies are HttpOnly and Secure in production
- [ ] CORS only allows authorized origins
- [ ] OAuth state parameter prevents CSRF
- [ ] Rate limiting is in place (if configured)

---

## 🐛 Troubleshooting Common Issues

### "Cannot GET /api/auth/*"
**Cause:** Using old non-versioned routes
**Solution:** Update all routes to `/api/v1/auth/*`

### "CORS Error"
**Cause:** CORS_ORIGIN doesn't match frontend URL
**Solution:** Ensure exact match including protocol: `https://medi-connect-360.vercel.app`

### "OAuth redirect_uri_mismatch"
**Cause:** OAuth callback URL doesn't match provider configuration
**Solution:** Update OAuth provider settings to use versioned callback URLs

### "Cookies not set"
**Cause:** SameSite/Secure cookie settings
**Solution:** Ensure HTTPS in production, check cookie settings in auth service

### "Token refresh fails"
**Cause:** Refresh token expired or invalid
**Solution:** Check JWT_REFRESH_SECRET configuration and token expiration

---

## 📊 Monitoring & Logs

### Backend Logs to Monitor
- Authentication attempts (success/failure)
- OAuth callback processing
- Token refresh operations
- Cookie setting/clearing
- Error responses

### Frontend Logs to Monitor
- API request failures
- OAuth redirect issues
- Authentication state changes
- Cookie availability

### Key Metrics
- Authentication success rate
- OAuth conversion rate
- Token refresh frequency
- Error response rates
- Response times for auth endpoints