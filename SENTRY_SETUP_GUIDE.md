# 🐛 Sentry Error Tracking Setup Guide

Complete guide to add error monitoring to MediConnect 360.

---

## 📋 Prerequisites

- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ Email account for Sentry signup

---

# 1️⃣ Create Sentry Account

## Step 1: Sign Up

1. **Go to Sentry**: https://sentry.io/signup/

2. **Sign Up**:
   - Enter email and password
   - Or sign up with GitHub/Google
   - Verify your email

3. **Choose Plan**:
   - Select "Developer" (FREE)
   - 5,000 errors/month
   - 1 user
   - 30-day retention
   - Click "Continue"

---

## Step 2: Create Organization

1. **Organization Name**: `MediConnect` or your company name

2. **Click** "Create Organization"

---

# 2️⃣ Create Projects

You need TWO projects: one for frontend, one for backend.

## Project 1: Frontend (React)

1. **Click** "Create Project"

2. **Select Platform**: 
   - Search for "React"
   - Click "React"

3. **Set Alert Frequency**:
   - Choose "Alert me on every new issue"
   - Click "Create Project"

4. **Project Name**: `mediconnect-frontend`

5. **Click** "Create Project"

6. **Copy DSN**:
   - You'll see: `https://abc123@o123456.ingest.sentry.io/789012`
   - **SAVE THIS!** This is your Frontend DSN

7. **Skip** the installation guide for now (we'll do it manually)

---

## Project 2: Backend (Node.js)

1. **Click** "Projects" (left sidebar)

2. **Click** "Create Project" (top-right)

3. **Select Platform**:
   - Search for "Node.js"
   - Click "Node.js"

4. **Set Alert Frequency**:
   - Choose "Alert me on every new issue"

5. **Project Name**: `mediconnect-backend`

6. **Click** "Create Project"

7. **Copy DSN**:
   - You'll see: `https://xyz789@o123456.ingest.sentry.io/456789`
   - **SAVE THIS!** This is your Backend DSN

---

# 3️⃣ Install Sentry in Backend

## Step 1: Add Sentry Package

The Sentry package should already be in your dependencies. Let's verify:

1. **Check** `backend/package.json` for `@sentry/node`

2. **If missing**, add it:
   ```bash
   cd backend
   npm install @sentry/node @sentry/profiling-node
   ```

---

## Step 2: Initialize Sentry in Backend

Your backend already has Sentry configured in `backend/src/main.ts`. Just need to add the DSN.

---

## Step 3: Add to Backend Environment (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Select** `mediconnect-backend` service

3. **Click** "Environment" (left sidebar)

4. **Add New Variable**:
   - Key: `SENTRY_DSN`
   - Value: `https://xyz789@o123456.ingest.sentry.io/456789` (your backend DSN)

5. **Save Changes** (will auto-redeploy, wait 2-3 minutes)

---

# 4️⃣ Install Sentry in Frontend

## Step 1: Verify Sentry Package

The Sentry package should already be in your dependencies.

1. **Check** `package.json` for `@sentry/react`

2. **If missing**, add it:
   ```bash
   npm install @sentry/react
   ```

---

## Step 2: Frontend Already Configured

Your frontend already has Sentry configured in `src/services/sentry.ts`.

---

## Step 3: Add to Frontend Environment (Vercel)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Select** your `medi-connect-360` project

3. **Click** "Settings" → "Environment Variables"

4. **Add New Variable**:
   - Key: `VITE_SENTRY_DSN`
   - Value: `https://abc123@o123456.ingest.sentry.io/789012` (your frontend DSN)
   - Environment: Production, Preview, Development (select all)
   - Click "Save"

5. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

---

# 5️⃣ Test Error Tracking

## Test Backend Errors

1. **Trigger Test Error**:
   - Open: `https://mediconnect-backend-4ujn.onrender.com/api/test-error`
   - Or use curl:
     ```bash
     curl https://mediconnect-backend-4ujn.onrender.com/api/test-error
     ```

2. **Check Sentry**:
   - Go to: https://sentry.io
   - Click "Issues" (left sidebar)
   - Select `mediconnect-backend` project
   - You should see the test error

---

## Test Frontend Errors

1. **Open Browser Console** (F12)

2. **Trigger Test Error**:
   ```javascript
   throw new Error("Test error from console");
   ```

3. **Or Add Test Button** (temporary):
   - Add this to any component:
   ```jsx
   <button onClick={() => { throw new Error("Test Sentry"); }}>
     Test Error
   </button>
   ```

4. **Check Sentry**:
   - Go to: https://sentry.io
   - Select `mediconnect-frontend` project
   - You should see the test error

---

# 6️⃣ Configure Alerts

## Email Alerts

1. **Go to Project Settings**:
   - Select project (frontend or backend)
   - Click "Settings" (left sidebar)
   - Click "Alerts"

2. **Create Alert Rule**:
   - Click "Create Alert"
   - **Alert name**: `Critical Errors`
   - **When**: `An event is seen`
   - **If**: `The event's level is equal to error`
   - **Then**: `Send a notification via email`
   - **To**: Your email
   - Click "Save Rule"

---

## Slack Alerts (Optional)

1. **Install Slack Integration**:
   - Go to "Settings" → "Integrations"
   - Search for "Slack"
   - Click "Install"
   - Authorize Slack workspace
   - Choose channel (e.g., `#alerts`)

2. **Update Alert Rules**:
   - Edit existing alert rules
   - Add "Send notification to Slack"
   - Select channel

---

# 7️⃣ Configure Performance Monitoring

## Enable Performance Monitoring

1. **Go to Project Settings**:
   - Select project
   - Click "Settings" → "Performance"

2. **Enable Tracing**:
   - Toggle "Enable Performance Monitoring"
   - Set sample rate: `0.1` (10% of transactions)
   - Click "Save"

3. **View Performance**:
   - Click "Performance" (left sidebar)
   - See slow transactions
   - Identify bottlenecks

---

# 8️⃣ Set Up Source Maps (Frontend)

Source maps help Sentry show readable stack traces.

## Option A: Upload via Sentry CLI (Recommended)

1. **Install Sentry CLI**:
   ```bash
   npm install -g @sentry/cli
   ```

2. **Create Auth Token**:
   - Go to: https://sentry.io/settings/account/api/auth-tokens/
   - Click "Create New Token"
   - Name: `MediConnect Upload`
   - Scopes: `project:releases`, `project:write`
   - Click "Create Token"
   - Copy token: `sntrys_...`

3. **Add to Vercel**:
   - Go to Vercel project settings
   - Environment Variables
   - Add:
     - Key: `SENTRY_AUTH_TOKEN`
     - Value: Your auth token
     - Key: `SENTRY_ORG`
     - Value: Your org name (e.g., `mediconnect`)
     - Key: `SENTRY_PROJECT`
     - Value: `mediconnect-frontend`

4. **Update Build Command** in Vercel:
   ```bash
   npm run build && sentry-cli sourcemaps upload --org=mediconnect --project=mediconnect-frontend ./dist
   ```

---

## Option B: Manual Upload (Simpler)

Just enable source maps in Vite config (already done in your project).

---

# 9️⃣ Monitor Your App

## Sentry Dashboard

1. **Issues**: https://sentry.io/issues/
   - View all errors
   - See error frequency
   - Track error trends
   - Assign to team members

2. **Performance**: https://sentry.io/performance/
   - View slow transactions
   - Identify bottlenecks
   - See database query performance

3. **Releases**: https://sentry.io/releases/
   - Track errors by release
   - See which version has most errors
   - Compare releases

4. **Discover**: https://sentry.io/discover/
   - Custom queries
   - Advanced filtering
   - Export data

---

## Key Metrics to Monitor

1. **Error Rate**:
   - Errors per minute
   - Error trends over time
   - Most common errors

2. **User Impact**:
   - How many users affected
   - Which users experiencing errors
   - User sessions with errors

3. **Performance**:
   - Average response time
   - Slow transactions
   - Database query time

4. **Browser/Device**:
   - Errors by browser
   - Errors by device
   - Errors by OS

---

# 🐛 Troubleshooting

## Errors Not Appearing in Sentry

**Check**:
1. DSN is correct in environment variables
2. Sentry is initialized in code
3. Environment variables are loaded
4. No ad blockers blocking Sentry
5. Check browser console for Sentry errors

**Test**:
```javascript
// In browser console
Sentry.captureMessage("Test message");
```

---

## Source Maps Not Working

**Check**:
1. Source maps are generated during build
2. Source maps are uploaded to Sentry
3. Release version matches
4. Auth token has correct permissions

---

## Too Many Errors

**Solutions**:
1. **Filter noise**:
   - Settings → Inbound Filters
   - Ignore known errors
   - Filter by browser/OS

2. **Sample errors**:
   - Settings → General
   - Set sample rate to 50%

3. **Upgrade plan**:
   - If you need more than 5,000 errors/month

---

## Performance Data Not Showing

**Check**:
1. Performance monitoring enabled
2. Sample rate > 0
3. Transactions are being sent
4. Check browser network tab

---

# 📊 Environment Variables Summary

## Backend (Render) - 1 new variable:
```env
SENTRY_DSN=https://xyz789@o123456.ingest.sentry.io/456789
```

## Frontend (Vercel) - 1 new variable:
```env
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
```

## Optional (for source maps):
```env
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=mediconnect
SENTRY_PROJECT=mediconnect-frontend
```

---

# 🎯 Success Checklist

- [ ] Sentry account created
- [ ] Organization created
- [ ] Frontend project created
- [ ] Backend project created
- [ ] Frontend DSN copied
- [ ] Backend DSN copied
- [ ] Backend environment variable added
- [ ] Frontend environment variable added
- [ ] Backend redeployed
- [ ] Frontend redeployed
- [ ] Test error sent from backend
- [ ] Test error sent from frontend
- [ ] Errors appear in Sentry dashboard
- [ ] Email alerts configured
- [ ] Performance monitoring enabled

---

# 💰 Sentry Pricing

## Free (Developer) Plan:
- ✅ 5,000 errors/month
- ✅ 1 user
- ✅ 30-day retention
- ✅ Performance monitoring
- ✅ Email alerts
- ✅ Source maps
- **Cost**: $0/month

## Team Plan ($26/month):
- 50,000 errors/month
- Unlimited users
- 90-day retention
- Priority support
- Advanced features

## Business Plan ($80/month):
- 100,000 errors/month
- Everything in Team
- SSO
- Custom retention
- SLA

---

# 🔒 Security & Privacy

## Data Scrubbing

Sentry automatically scrubs sensitive data:
- Passwords
- Credit card numbers
- Social security numbers
- API keys

## Custom Scrubbing

Add custom patterns in Settings → Security & Privacy:
```javascript
// Example: Scrub email addresses
beforeSend(event) {
  if (event.message) {
    event.message = event.message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email]');
  }
  return event;
}
```

---

# 📚 Next Steps

After Sentry is working:
1. ✅ Set up custom error boundaries
2. ✅ Add user context to errors
3. ✅ Configure release tracking
4. ✅ Set up performance budgets
5. ✅ Create custom dashboards
6. ✅ Integrate with CI/CD

---

# 📖 Useful Resources

- **Sentry Docs**: https://docs.sentry.io/
- **React Integration**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Node.js Integration**: https://docs.sentry.io/platforms/node/
- **Best Practices**: https://docs.sentry.io/product/best-practices/

---

**Need help? Check Sentry documentation or contact support!**
