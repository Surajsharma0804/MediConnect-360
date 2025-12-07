# 🔧 Troubleshooting Guide

## 📋 Overview

Common issues and solutions for MediConnect 360. If you encounter a problem, check this guide first!

---

## 🚀 **Installation & Setup Issues**

### **Issue: "npm install" fails**

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Update Node.js:**
   ```bash
   # Check version
   node --version  # Should be 18+
   
   # Update Node.js
   # Download from: https://nodejs.org/
   ```

4. **Check npm version:**
   ```bash
   npm --version  # Should be 9+
   npm install -g npm@latest
   ```

---

### **Issue: Docker services won't start**

**Symptoms:**
```
Error: Cannot connect to Docker daemon
Error: Port already in use
```

**Solutions:**

1. **Check Docker is running:**
   ```bash
   docker --version
   docker ps
   ```

2. **Start Docker Desktop:**
   - Windows/Mac: Open Docker Desktop app
   - Linux: `sudo systemctl start docker`

3. **Port conflicts:**
   ```bash
   # Check what's using the port
   # Windows
   netstat -ano | findstr :5432
   
   # Mac/Linux
   lsof -i :5432
   
   # Kill the process or change port in docker-compose.yml
   ```

4. **Reset Docker:**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d
   ```

---

### **Issue: "Missing environment variable" error**

**Symptoms:**
```
Error: GEMINI_API_KEY is required
Error: DATABASE_URL is not defined
```

**Solutions:**

1. **Check .env files exist:**
   ```bash
   ls -la .env
   ls -la backend/.env
   ```

2. **Copy from example:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. **Verify variables are set:**
   ```bash
   # Windows
   type backend\.env
   
   # Mac/Linux
   cat backend/.env
   ```

4. **Restart server after changes:**
   ```bash
   # Backend
   cd backend
   npm run start:dev
   ```

---

## 🗄️ **Database Issues**

### **Issue: "Cannot connect to database"**

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed
```

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   docker ps | grep postgres
   # Should show mediconnect-db
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Check connection string:**
   ```bash
   # backend/.env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mediconnect
   
   # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   ```

4. **Test connection:**
   ```bash
   # Install psql client
   # Windows: https://www.postgresql.org/download/windows/
   # Mac: brew install postgresql
   # Linux: sudo apt install postgresql-client
   
   psql postgresql://postgres:password@localhost:5432/mediconnect
   ```

5. **Reset database:**
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   ```

---

### **Issue: "Table does not exist"**

**Symptoms:**
```
Error: relation "users" does not exist
Error: column "email" does not exist
```

**Solutions:**

1. **Enable synchronize (development only):**
   ```typescript
   // backend/src/config/database.config.ts
   synchronize: true,  // Auto-create tables
   ```

2. **Run migrations:**
   ```bash
   cd backend
   npm run migration:run
   ```

3. **Recreate database:**
   ```bash
   docker exec -it mediconnect-db psql -U postgres
   DROP DATABASE mediconnect;
   CREATE DATABASE mediconnect;
   \q
   
   # Restart backend to recreate tables
   ```

---

## 🤖 **AI Service Issues**

### **Issue: "Gemini API key invalid"**

**Symptoms:**
```
Error: API key not valid
Error: 401 Unauthorized
```

**Solutions:**

1. **Verify API key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Check key is active
   - Copy key exactly (no spaces)

2. **Check environment variable:**
   ```bash
   # backend/.env
   GEMINI_API_KEY=AIzaSy...  # Should start with AIzaSy
   ```

3. **Restart backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

---

### **Issue: "Rate limit exceeded"**

**Symptoms:**
```
Error: 429 Too Many Requests
Error: Quota exceeded
```

**Solutions:**

1. **Check quota:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Check usage limits
   - Free tier: 60 requests/minute

2. **Implement rate limiting:**
   ```typescript
   // Add delay between requests
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```

3. **Upgrade to paid tier:**
   - Or switch to OpenAI (see MIGRATION_GUIDE.md)

---

## 📧 **Email Issues**

### **Issue: "Emails not sending"**

**Symptoms:**
```
Error: Invalid API key
Error: Email not sent
```

**Solutions:**

1. **Check Resend API key:**
   - Go to [Resend](https://resend.com/api-keys)
   - Verify key is active
   - Copy key exactly

2. **Verify environment variable:**
   ```bash
   # backend/.env
   RESEND_API_KEY=re_...  # Should start with re_
   FROM_EMAIL=onboarding@resend.dev
   ```

3. **Check email format:**
   ```typescript
   // Must be valid email
   to: 'user@example.com',
   from: 'noreply@yourdomain.com',
   ```

4. **Verify domain (production):**
   - Add domain in Resend dashboard
   - Add DNS records
   - Verify domain

---

## 💳 **Payment Issues**

### **Issue: "Stripe payment fails"**

**Symptoms:**
```
Error: No such customer
Error: Invalid API key
```

**Solutions:**

1. **Check Stripe keys:**
   ```bash
   # backend/.env
   STRIPE_SECRET_KEY=sk_test_...  # Test mode
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   # Frontend .env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Use test cards:**
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   ```

3. **Check webhook secret:**
   ```bash
   # Start Stripe CLI
   stripe listen --forward-to localhost:5000/api/payment/webhook
   
   # Copy webhook secret
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 🔐 **Authentication Issues**

### **Issue: "Google OAuth not working"**

**Symptoms:**
```
Error: redirect_uri_mismatch
Error: invalid_client
```

**Solutions:**

1. **Check redirect URI:**
   ```bash
   # Must match exactly in Google Console
   http://localhost:5000/api/auth/google/callback
   
   # No trailing slash!
   # Include http:// or https://
   ```

2. **Verify credentials:**
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=123...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. **Add test users:**
   - Go to Google Cloud Console
   - OAuth consent screen
   - Add test users

---

### **Issue: "JWT token expired"**

**Symptoms:**
```
Error: jwt expired
Error: 401 Unauthorized
```

**Solutions:**

1. **Refresh token:**
   - Frontend should auto-refresh
   - Or re-login

2. **Increase expiry:**
   ```bash
   # backend/.env
   JWT_EXPIRES_IN=7d  # 7 days
   JWT_REFRESH_EXPIRES_IN=30d  # 30 days
   ```

3. **Clear localStorage:**
   ```javascript
   // Browser console
   localStorage.clear();
   // Then re-login
   ```

---

## 🌐 **Frontend Issues**

### **Issue: "Cannot connect to backend"**

**Symptoms:**
```
Error: Network Error
Error: CORS policy blocked
```

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verify API URL:**
   ```bash
   # .env
   VITE_API_URL=http://localhost:5000
   ```

3. **Check CORS settings:**
   ```typescript
   // backend/src/main.ts
   app.enableCors({
     origin: 'http://localhost:5173',
     credentials: true,
   });
   ```

4. **Restart both servers:**
   ```bash
   # Backend
   cd backend && npm run start:dev
   
   # Frontend
   npm run dev
   ```

---

### **Issue: "White screen / blank page"**

**Symptoms:**
- Page loads but shows nothing
- Console errors

**Solutions:**

1. **Check browser console:**
   - Press F12
   - Look for errors
   - Fix reported issues

2. **Clear cache:**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Rebuild:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

---

## 🐳 **Docker Issues**

### **Issue: "Container keeps restarting"**

**Symptoms:**
```
docker ps shows "Restarting"
Container exits immediately
```

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   ```

2. **Check environment variables:**
   ```bash
   docker-compose config
   ```

3. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

### **Issue: "Out of disk space"**

**Symptoms:**
```
Error: no space left on device
```

**Solutions:**

1. **Clean Docker:**
   ```bash
   docker system df  # Check usage
   docker system prune -a --volumes  # Clean everything
   ```

2. **Remove old images:**
   ```bash
   docker image prune -a
   ```

3. **Remove old volumes:**
   ```bash
   docker volume prune
   ```

---

## 🚀 **Performance Issues**

### **Issue: "Slow API responses"**

**Symptoms:**
- Requests take >5 seconds
- Timeouts

**Solutions:**

1. **Check database queries:**
   ```typescript
   // Enable query logging
   logging: true,
   ```

2. **Add indexes:**
   ```typescript
   @Index(['userId', 'createdAt'])
   ```

3. **Enable caching:**
   ```typescript
   // Use Redis for caching
   await this.cacheManager.get(key);
   ```

4. **Optimize queries:**
   ```typescript
   // Use select to limit fields
   .select(['user.id', 'user.name'])
   
   // Use pagination
   .take(10).skip(0)
   ```

---

### **Issue: "High memory usage"**

**Symptoms:**
- Server crashes
- Out of memory errors

**Solutions:**

1. **Check memory usage:**
   ```bash
   docker stats
   ```

2. **Increase Node.js memory:**
   ```bash
   # package.json
   "start:prod": "node --max-old-space-size=4096 dist/main"
   ```

3. **Optimize code:**
   - Close database connections
   - Clear intervals/timeouts
   - Avoid memory leaks

---

## 🔒 **Security Issues**

### **Issue: "CORS errors in production"**

**Symptoms:**
```
Access-Control-Allow-Origin error
```

**Solutions:**

1. **Update CORS origin:**
   ```bash
   # backend/.env
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Allow credentials:**
   ```typescript
   app.enableCors({
     origin: process.env.CORS_ORIGIN,
     credentials: true,
   });
   ```

---

### **Issue: "SSL certificate errors"**

**Symptoms:**
```
Error: certificate has expired
Error: self signed certificate
```

**Solutions:**

1. **Renew certificate:**
   ```bash
   certbot renew
   ```

2. **Check certificate:**
   ```bash
   certbot certificates
   ```

3. **Force renewal:**
   ```bash
   certbot renew --force-renewal
   ```

---

## 📱 **Mobile/Browser Issues**

### **Issue: "Not working on mobile"**

**Solutions:**

1. **Check responsive design:**
   - Use browser dev tools
   - Test different screen sizes

2. **Check mobile console:**
   - Use remote debugging
   - Chrome: chrome://inspect
   - Safari: Develop menu

3. **Test on real devices:**
   - iOS Safari
   - Android Chrome

---

### **Issue: "Not working in Safari"**

**Solutions:**

1. **Check Safari console:**
   - Enable Develop menu
   - Check for errors

2. **Use polyfills:**
   ```bash
   npm install core-js
   ```

3. **Test browser compatibility:**
   - Use caniuse.com
   - Add fallbacks

---

## 🆘 **Getting Help**

### **Before asking for help:**

1. **Check this guide** - Your issue might be here
2. **Search GitHub issues** - Someone might have had the same problem
3. **Check logs** - Error messages are helpful
4. **Try to reproduce** - Can you make it happen again?

### **When asking for help:**

Include:
- **Operating System:** Windows 11, macOS 14, Ubuntu 22.04
- **Node version:** `node --version`
- **npm version:** `npm --version`
- **Docker version:** `docker --version`
- **Error message:** Full error with stack trace
- **Steps to reproduce:** What did you do?
- **Expected behavior:** What should happen?
- **Actual behavior:** What actually happened?
- **Screenshots:** If applicable

### **Where to get help:**

- **GitHub Issues:** https://github.com/YOUR_USERNAME/MediConnect-360/issues
- **GitHub Discussions:** https://github.com/YOUR_USERNAME/MediConnect-360/discussions
- **Email:** support@mediconnect360.com

---

## 📚 **Additional Resources**

- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development setup
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment guide
- [GET_API_KEYS.md](GET_API_KEYS.md) - API keys guide
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration guide

---

## 🔍 **Quick Diagnostics**

### **Health Check**

```bash
# Check backend health
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-07T...",
  "service": "MediConnect 360 API",
  "version": "1.0.0",
  "uptime": 123.45,
  "environment": "development",
  "checks": {
    "database": "configured",
    "ai": "configured",
    "email": "configured"
  }
}
```

### **Check Services**

```bash
# Docker services
docker-compose ps

# Should show:
# mediconnect-db       Up
# mediconnect-redis    Up
# mediconnect-minio    Up
```

### **Check Ports**

```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5000
lsof -i :5173
lsof -i :5432
```

### **Check Logs**

```bash
# Backend logs
cd backend
npm run start:dev
# Watch for errors

# Docker logs
docker-compose logs -f
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

## ✅ **Common Solutions Checklist**

When something doesn't work, try these in order:

- [ ] Restart backend server
- [ ] Restart frontend server
- [ ] Restart Docker services
- [ ] Clear npm cache and reinstall
- [ ] Check .env files
- [ ] Check logs for errors
- [ ] Clear browser cache
- [ ] Try incognito/private mode
- [ ] Check firewall/antivirus
- [ ] Update dependencies
- [ ] Restart computer
- [ ] Ask for help

---

**Last Updated:** December 2025  
**Status:** Complete ✅
