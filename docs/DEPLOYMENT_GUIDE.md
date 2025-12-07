# 🚀 Deployment Guide - Deploy MediConnect 360 to Production

## 📋 Overview

This guide shows you how to deploy MediConnect 360 to production using **FREE or low-cost services**. Total cost: **$0-21/month** for 1,000 users!

---

## 🎯 **Deployment Options**

| Option | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| **Option 1: Vercel + Render** | $0-21/month | Easy | Recommended for beginners |
| **Option 2: VPS (DigitalOcean)** | $20/month | Medium | Full control, scalable |
| **Option 3: AWS/GCP** | $50+/month | Hard | Enterprise, high traffic |
| **Option 4: Docker VPS** | $20/month | Medium | Docker experience |

---

## ✅ **Pre-Deployment Checklist**

Before deploying, ensure you have:

- [ ] All API keys ready (see [GET_API_KEYS.md](GET_API_KEYS.md))
- [ ] GitHub repository with latest code
- [ ] Production environment variables prepared
- [ ] Database backup strategy planned
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (free with Let's Encrypt)
- [ ] Monitoring setup (optional)

---

## 🌟 **OPTION 1: Vercel + Render (Recommended)**

**Cost:** $0-21/month  
**Difficulty:** ⭐ Easy  
**Best for:** Quick deployment, automatic scaling

### **Architecture:**
- **Frontend:** Vercel (FREE)
- **Backend:** Render (FREE or $7/month)
- **Database:** Neon PostgreSQL (FREE)
- **Redis:** Upstash (FREE)
- **Storage:** AWS S3 or Cloudflare R2 (FREE 10GB)

### **Step 1: Deploy Database (Neon)**

1. Go to [Neon](https://neon.tech/)
2. Sign up (FREE tier: 0.5GB storage, 1 project)
3. Create new project:
   - Name: `mediconnect-360`
   - Region: Choose closest to your users
4. Copy connection string:
   ```
   postgresql://user:pass@ep-xxx.neon.tech/mediconnect?sslmode=require
   ```
5. Save for later

### **Step 2: Deploy Redis (Upstash)**

1. Go to [Upstash](https://upstash.com/)
2. Sign up (FREE tier: 10K commands/day)
3. Create Redis database:
   - Name: `mediconnect-redis`
   - Region: Same as Neon
4. Copy connection string:
   ```
   rediss://default:xxx@xxx.upstash.io:6379
   ```
5. Save for later

### **Step 3: Setup Storage (Cloudflare R2)**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create bucket:
   - Name: `mediconnect-files`
   - Location: Automatic
4. Create API token:
   - Permissions: Object Read & Write
5. Copy credentials:
   ```
   Access Key ID: xxx
   Secret Access Key: xxx
   Endpoint: https://xxx.r2.cloudflarestorage.com
   ```

### **Step 4: Deploy Backend (Render)**

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   ```
   Name: mediconnect-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Instance Type: Free (or Starter $7/month for better performance)
   ```

6. Add Environment Variables:
   ```bash
   NODE_ENV=production
   PORT=5000
   
   # Database (from Neon)
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/mediconnect?sslmode=require
   
   # Redis (from Upstash)
   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
   
   # JWT Secrets (generate new ones!)
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # AI (Gemini - FREE)
   AI_PROVIDER=gemini
   GEMINI_API_KEY=<your-gemini-key>
   
   # Email (Resend - FREE 3K/month)
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=<your-resend-key>
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=MediConnect 360
   
   # Storage (Cloudflare R2)
   AWS_ACCESS_KEY_ID=<r2-access-key>
   AWS_SECRET_ACCESS_KEY=<r2-secret-key>
   AWS_S3_BUCKET=mediconnect-files
   AWS_REGION=auto
   AWS_ENDPOINT=https://xxx.r2.cloudflarestorage.com
   
   # Stripe (Production keys!)
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   
   # OAuth (Production URLs!)
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=https://mediconnect-backend.onrender.com/api/auth/google/callback
   
   GITHUB_CLIENT_ID=<your-github-client-id>
   GITHUB_CLIENT_SECRET=<your-github-client-secret>
   GITHUB_CALLBACK_URL=https://mediconnect-backend.onrender.com/api/auth/github/callback
   
   # Security
   ENCRYPTION_KEY=<32-character-key>
   CORS_ORIGIN=https://yourdomain.com
   CORS_CREDENTIALS=true
   
   # Video (Jitsi - FREE)
   VIDEO_PROVIDER=jitsi
   JITSI_DOMAIN=meet.jit.si
   
   # SMS (Console for now, upgrade later)
   SMS_PROVIDER=console_log
   
   # Features
   ENABLE_REGISTRATION=true
   ENABLE_EMAIL_VERIFICATION=true
   ENABLE_AI_DIAGNOSTICS=true
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL: `https://mediconnect-backend.onrender.com`

### **Step 5: Deploy Frontend (Vercel)**

1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. Add Environment Variables:
   ```bash
   VITE_API_URL=https://mediconnect-backend.onrender.com
   VITE_WS_URL=wss://mediconnect-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   VITE_ENV=production
   ```

7. Click "Deploy"
8. Wait for deployment (2-5 minutes)
9. Your site is live! `https://your-project.vercel.app`

### **Step 6: Configure Custom Domain (Optional)**

**On Vercel:**
1. Go to Project Settings → Domains
2. Add your domain: `mediconnect360.com`
3. Follow DNS instructions
4. SSL certificate auto-generated (FREE)

**On Render:**
1. Go to Service Settings → Custom Domain
2. Add: `api.mediconnect360.com`
3. Update DNS records
4. SSL certificate auto-generated (FREE)

**Update Environment Variables:**
- Vercel: `VITE_API_URL=https://api.mediconnect360.com`
- Render: `CORS_ORIGIN=https://mediconnect360.com`

### **Step 7: Setup Stripe Webhooks**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://api.mediconnect360.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook secret
6. Update Render env: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

### **Step 8: Test Production**

1. Visit your site: `https://mediconnect360.com`
2. Test registration
3. Test login
4. Test AI symptom checker
5. Test appointment booking
6. Test payment (use Stripe test card: 4242 4242 4242 4242)
7. Check backend logs on Render
8. Monitor errors

---

## 💻 **OPTION 2: VPS Deployment (DigitalOcean/Linode)**

**Cost:** $20/month  
**Difficulty:** ⭐⭐ Medium  
**Best for:** Full control, custom configuration

### **Step 1: Create VPS**

1. Go to [DigitalOcean](https://www.digitalocean.com/) or [Linode](https://www.linode.com/)
2. Create Droplet/Linode:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $20/month (4GB RAM, 2 vCPUs)
   - **Region:** Closest to your users
   - **SSH Key:** Add your public key
3. Note your server IP: `123.456.789.0`

### **Step 2: Initial Server Setup**

```bash
# SSH into server
ssh root@123.456.789.0

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
apt install -y docker-compose

# Install Nginx
apt install -y nginx

# Install Certbot (for SSL)
apt install -y certbot python3-certbot-nginx

# Create app user
adduser --disabled-password --gecos "" mediconnect
usermod -aG docker mediconnect
```

### **Step 3: Setup Application**

```bash
# Switch to app user
su - mediconnect

# Clone repository
git clone https://github.com/yourusername/mediconnect-360.git
cd mediconnect-360

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files with production values
nano .env
nano backend/.env

# Start Docker services
docker-compose up -d

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build backend
cd backend && npm run build && cd ..

# Build frontend
npm run build
```

### **Step 4: Setup PM2 (Process Manager)**

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/main.js --name mediconnect-backend

# Save PM2 config
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs mediconnect-backend
```

### **Step 5: Configure Nginx**

```bash
# Exit to root user
exit

# Create Nginx config
nano /etc/nginx/sites-available/mediconnect
```

Add this configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.mediconnect360.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name mediconnect360.com www.mediconnect360.com;

    root /home/mediconnect/mediconnect-360/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:

```bash
# Enable site
ln -s /etc/nginx/sites-available/mediconnect /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### **Step 6: Setup SSL (Let's Encrypt)**

```bash
# Get SSL certificates
certbot --nginx -d mediconnect360.com -d www.mediconnect360.com -d api.mediconnect360.com

# Follow prompts
# Email: your-email@example.com
# Agree to terms: Yes
# Redirect HTTP to HTTPS: Yes

# Auto-renewal is configured automatically
# Test renewal:
certbot renew --dry-run
```

### **Step 7: Setup Firewall**

```bash
# Configure UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Check status
ufw status
```

### **Step 8: Setup Monitoring**

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Setup log rotation
nano /etc/logrotate.d/mediconnect
```

Add:

```
/home/mediconnect/mediconnect-360/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 mediconnect mediconnect
    sharedscripts
}
```

### **Step 9: Setup Backups**

```bash
# Create backup script
nano /home/mediconnect/backup.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/mediconnect/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec mediconnect-db pg_dump -U postgres mediconnect > $BACKUP_DIR/db_$DATE.sql

# Backup MinIO
docker exec mediconnect-minio mc mirror myminio/mediconnect-files $BACKUP_DIR/files_$DATE

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql $BACKUP_DIR/files_$DATE

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

# Upload to cloud (optional)
# aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-backup-bucket/
```

Make executable and schedule:

```bash
chmod +x /home/mediconnect/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add:

```
0 2 * * * /home/mediconnect/backup.sh
```

---

## ☁️ **OPTION 3: AWS/GCP Deployment**

**Cost:** $50+/month  
**Difficulty:** ⭐⭐⭐ Hard  
**Best for:** Enterprise, high availability

### **AWS Architecture:**

- **Frontend:** S3 + CloudFront
- **Backend:** ECS Fargate or EC2
- **Database:** RDS PostgreSQL
- **Cache:** ElastiCache Redis
- **Storage:** S3
- **Load Balancer:** ALB
- **DNS:** Route 53
- **SSL:** ACM (FREE)

### **Quick AWS Setup:**

1. **Create RDS PostgreSQL:**
   - Engine: PostgreSQL 16
   - Instance: db.t3.micro ($15/month)
   - Storage: 20GB SSD
   - Multi-AZ: No (for cost savings)

2. **Create ElastiCache Redis:**
   - Node: cache.t3.micro ($12/month)
   - Replicas: 0 (for cost savings)

3. **Create S3 Buckets:**
   - `mediconnect-frontend` (static site)
   - `mediconnect-files` (user uploads)

4. **Deploy Backend to ECS:**
   - Create ECR repository
   - Build Docker image
   - Push to ECR
   - Create ECS service

5. **Setup CloudFront:**
   - Origin: S3 bucket
   - SSL: ACM certificate
   - Custom domain

6. **Configure Route 53:**
   - Create hosted zone
   - Add A records for CloudFront

---

## 🐳 **OPTION 4: Docker VPS Deployment**

**Cost:** $20/month  
**Difficulty:** ⭐⭐ Medium  
**Best for:** Docker experience, easy updates

### **docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis
    networks:
      - mediconnect-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - mediconnect-network

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mediconnect-network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - mediconnect-network

  minio:
    image: minio/minio:latest
    restart: always
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - mediconnect-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  mediconnect-network:
    driver: bridge
```

### **Deploy:**

```bash
# On VPS
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Update
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 **Post-Deployment**

### **1. Monitoring**

**Free Options:**
- **UptimeRobot:** Monitor uptime (FREE 50 monitors)
- **Sentry:** Error tracking (FREE 5K events/month)
- **Google Analytics:** User analytics (FREE)
- **LogRocket:** Session replay (FREE 1K sessions/month)

**Setup Sentry:**

```bash
# Install
npm install @sentry/node @sentry/react

# Configure backend (backend/src/main.ts)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});

# Configure frontend (src/main.tsx)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### **2. Analytics**

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **3. Performance**

- Enable Gzip compression
- Setup CDN (Cloudflare FREE)
- Optimize images
- Enable browser caching
- Minify assets

### **4. Security**

- [ ] Change all default passwords
- [ ] Enable HTTPS only
- [ ] Setup rate limiting
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Setup WAF (Cloudflare FREE)
- [ ] Regular security updates

---

## 🔧 **Troubleshooting**

### **Backend won't start:**

```bash
# Check logs
pm2 logs mediconnect-backend
# or
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### **Database connection failed:**

```bash
# Test connection
psql -h your-db-host -U postgres -d mediconnect

# Check firewall
# Check DATABASE_URL format
# Verify credentials
```

### **SSL certificate issues:**

```bash
# Renew certificate
certbot renew

# Check certificate
certbot certificates

# Force renewal
certbot renew --force-renewal
```

### **High memory usage:**

```bash
# Check processes
htop

# Restart services
pm2 restart all
# or
docker-compose restart
```

---

## 💰 **Cost Comparison**

### **Option 1: Vercel + Render**
- Vercel: FREE
- Render: FREE or $7/month
- Neon: FREE
- Upstash: FREE
- R2: FREE (10GB)
- **Total: $0-7/month**

### **Option 2: VPS**
- DigitalOcean: $20/month
- Domain: $12/year ($1/month)
- **Total: $21/month**

### **Option 3: AWS**
- RDS: $15/month
- ElastiCache: $12/month
- EC2: $20/month
- S3: $5/month
- CloudFront: $5/month
- **Total: $57/month**

### **Option 4: Docker VPS**
- VPS: $20/month
- Domain: $1/month
- **Total: $21/month**

---

## 📚 **Additional Resources**

- [GET_API_KEYS.md](GET_API_KEYS.md) - Get all API keys
- [OAUTH_PAYMENT_SETUP.md](OAUTH_PAYMENT_SETUP.md) - OAuth & Stripe setup
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development guidelines
- [Main README](../README.md) - Project overview

---

## 🆘 **Need Help?**

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/MediConnect-360/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/MediConnect-360/discussions)
- **Email:** support@mediconnect360.com

---

**Congratulations! Your app is now live! 🎉**

**Last Updated:** December 2025  
**Status:** Complete & Tested ✅
