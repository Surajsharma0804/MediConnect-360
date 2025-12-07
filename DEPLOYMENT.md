# MediConnect 360 - Deployment Guide

## Deployment Options

MediConnect 360 can be deployed in multiple ways:

1. **FREE Tier** - Vercel (Frontend) + Render (Backend)
2. **Self-Hosted** - Docker Compose on VPS
3. **Cloud** - AWS/GCP/Azure with Kubernetes
4. **Hybrid** - Mix of managed and self-hosted services

---

## Option 1: FREE Deployment (Recommended for MVP)

### Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Neon PostgreSQL account (free)
- Upstash Redis account (free)

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `mediconnect-db`
   - Plan: Free
   - Click "Create Database"
   - Copy the "External Database URL"

3. **Create Redis Instance**
   - Click "New +" → "Redis"
   - Name: `mediconnect-redis`
   - Plan: Free
   - Click "Create Redis"
   - Copy the "Redis URL"

4. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: `mediconnect-backend`
     - Environment: `Node`
     - Build Command: `cd backend && npm install && npm run build`
     - Start Command: `cd backend && npm run start:prod`
     - Plan: Free

5. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your-postgres-url>
   REDIS_URL=<your-redis-url>
   JWT_SECRET=<generate-random-32-char-string>
   GEMINI_API_KEY=<your-gemini-key>
   RESEND_API_KEY=<your-resend-key>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=https://mediconnect-backend.onrender.com/api/auth/google/callback
   CORS_ORIGIN=https://your-app.vercel.app
   ENCRYPTION_KEY=<generate-random-32-char-string>
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://mediconnect-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `./`

3. **Configure Environment Variables**
   ```
   VITE_API_URL=https://mediconnect-backend.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your app is live at: `https://your-app.vercel.app`

### Step 3: Update CORS Settings

1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable with your Vercel URL
3. Redeploy backend

### Step 4: Test Deployment

1. Visit your Vercel URL
2. Try registering a new account
3. Check email verification
4. Test AI features
5. Monitor logs in Render dashboard

---

## Option 2: Self-Hosted Deployment (VPS)

### Prerequisites

- VPS with Ubuntu 22.04 (DigitalOcean, Linode, Vultr)
- Domain name (optional but recommended)
- SSH access

### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app directory
mkdir -p /opt/mediconnect
cd /opt/mediconnect
```

### Step 2: Clone Repository

```bash
git clone https://github.com/your-username/mediconnect-360.git .
```

### Step 3: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Update with production values:
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/mediconnect
REDIS_URL=redis://:your-redis-password@redis:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
CORS_ORIGIN=https://yourdomain.com
```

### Step 4: Deploy with Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/mediconnect
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/mediconnect /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup Automated Backups

```bash
# Create backup script
nano /opt/mediconnect/scripts/backup.sh
```

Add script:
```bash
#!/bin/bash
BACKUP_DIR="/opt/mediconnect/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec mediconnect-db-prod pg_dump -U postgres mediconnect > "$BACKUP_DIR/db_$DATE.sql"

# Backup Redis
docker exec mediconnect-redis-prod redis-cli --rdb /data/dump.rdb
docker cp mediconnect-redis-prod:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:
```bash
chmod +x /opt/mediconnect/scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/mediconnect/scripts/backup.sh
```

---

## Option 3: AWS Deployment

### Architecture

- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate or EC2
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Storage**: S3
- **CDN**: CloudFront

### Estimated Costs

- **Development**: ~$50/month
- **Production (1K users)**: ~$100/month
- **Production (10K users)**: ~$300/month

### Quick Deploy with AWS CDK

```bash
# Install AWS CDK
npm install -g aws-cdk

# Deploy infrastructure
cd infrastructure
cdk deploy
```

---

## Post-Deployment Checklist

### Security

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database password changed from default
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers added

### Monitoring

- [ ] Error tracking setup (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (Papertrail)
- [ ] Performance monitoring (New Relic)
- [ ] Database monitoring

### Backups

- [ ] Automated database backups
- [ ] Backup restoration tested
- [ ] Backup retention policy set
- [ ] Off-site backup storage

### Performance

- [ ] CDN configured
- [ ] Image optimization
- [ ] Gzip compression enabled
- [ ] Caching strategy implemented
- [ ] Database indexes optimized

### Documentation

- [ ] API documentation updated
- [ ] Deployment runbook created
- [ ] Incident response plan
- [ ] Team access documented

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://your-api.com/api/health

# Database connection
docker exec mediconnect-db-prod pg_isready

# Redis connection
docker exec mediconnect-redis-prod redis-cli ping
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Or use zero-downtime deployment
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
```

---

## Rollback Procedure

```bash
# Rollback to previous version
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build

# Restore database backup
docker exec -i mediconnect-db-prod psql -U postgres mediconnect < backups/db_20240101_020000.sql
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Connection Issues

```bash
# Check database status
docker-compose -f docker-compose.prod.yml ps postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec backend node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => console.log('Connected')).catch(console.error)"
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check GitHub Issues
4. Contact support team

---

## Cost Optimization Tips

1. **Use FREE tiers** for development
2. **Scale gradually** as user base grows
3. **Monitor usage** to avoid surprises
4. **Use spot instances** for non-critical workloads
5. **Implement caching** to reduce database load
6. **Optimize images** and assets
7. **Use CDN** for static content

---

**Deployment Complete! 🚀**

Your MediConnect 360 application is now live and ready to serve users worldwide!
