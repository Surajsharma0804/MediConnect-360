# MediConnect 360 - Quick Reference Guide

## 🚀 Getting Started

### First Time Setup

```bash
# Windows
scripts\setup.bat

# macOS/Linux
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

### Access Applications

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

---

## 📝 Common Commands

### Backend

```bash
cd backend

# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests

# Build
npm run build              # Build for production
npm run start:prod         # Start production server

# Code Quality
npm run lint               # Run linter
npm run format             # Format code
```

### Frontend

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run linter
```

### Docker

```bash
# Development
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose logs -f                  # View logs
docker-compose ps                       # Check status
docker-compose restart <service>        # Restart service

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
```

---

## 🧪 Testing

### Quick Test

```bash
# Backend
cd backend && npm run test

# E2E
cd backend && npm run test:e2e
```

### Manual API Testing

```bash
# Health Check
curl http://localhost:5000/api/health

# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# AI Symptom Check
curl -X POST http://localhost:5000/api/ai/symptom-check \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"headache and fever"}'
```

---

## 🚀 Deployment

### FREE Deployment (Vercel + Render)

1. **Backend to Render**
   - Create account at render.com
   - Create PostgreSQL database (FREE)
   - Create Redis instance (FREE)
   - Deploy web service from GitHub
   - Add environment variables

2. **Frontend to Vercel**
   - Create account at vercel.com
   - Import GitHub repository
   - Add environment variables
   - Deploy

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions**

### Self-Hosted (VPS)

```bash
# On your server
git clone <your-repo>
cd MediConnect-360
cp .env.example .env
# Edit .env with production values
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔑 Environment Variables

### Required for Backend

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-secret-min-32-chars

# AI (FREE)
GEMINI_API_KEY=get-from-aistudio.google.com

# Email (FREE 3000/month)
RESEND_API_KEY=get-from-resend.com

# Security
CORS_ORIGIN=http://localhost:5173
ENCRYPTION_KEY=exactly-32-characters-long!!!
```

### Required for Frontend

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check Docker services
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart
```

### Database Connection Error

```bash
# Check PostgreSQL
docker exec -it mediconnect-db psql -U postgres -d mediconnect

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port Already in Use

```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Tests Failing

```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Reset test database
docker-compose down -v
docker-compose up -d
```

---

## 📊 Project Structure

```
MediConnect-360/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication
│   │   ├── entities/          # Database models
│   │   ├── services/          # Business logic
│   │   ├── common/            # Shared utilities
│   │   └── main.ts            # Entry point
│   ├── test/                  # E2E tests
│   ├── Dockerfile             # Production build
│   └── package.json
│
├── src/                       # React Frontend
│   ├── components/            # UI components
│   ├── pages/                 # Route pages
│   ├── services/              # API clients
│   ├── hooks/                 # Custom hooks
│   └── App.tsx                # Main app
│
├── scripts/                   # Utility scripts
│   ├── setup.sh              # Linux/Mac setup
│   └── setup.bat             # Windows setup
│
├── .github/workflows/         # CI/CD
│   └── ci.yml                # GitHub Actions
│
├── docs/                      # Documentation
├── docker-compose.yml         # Development
├── docker-compose.prod.yml    # Production
├── TESTING_GUIDE.md          # Testing docs
├── DEPLOYMENT.md             # Deployment docs
└── IMPROVEMENTS_SUMMARY.md   # Changelog
```

---

## 🔐 Security Checklist

### Development

- [ ] Use `.env` files (never commit)
- [ ] Use strong passwords locally
- [ ] Keep dependencies updated
- [ ] Run security audits: `npm audit`

### Production

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable SSL/TLS
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Use strong JWT secrets (32+ chars)

---

## 📈 Performance Tips

1. **Enable Redis caching**
2. **Use CDN for static assets**
3. **Optimize images**
4. **Enable gzip compression**
5. **Use database indexes**
6. **Implement pagination**
7. **Use connection pooling**

---

## 🆘 Getting Help

### Documentation

1. [README.md](README.md) - Project overview
2. [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment
4. [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) - What's new

### Support Channels

1. Check documentation first
2. Search GitHub Issues
3. Create new issue with details
4. Contact development team

### Useful Links

- **Gemini AI**: https://aistudio.google.com/app/apikey
- **Resend Email**: https://resend.com/api-keys
- **Google OAuth**: https://console.cloud.google.com/apis/credentials
- **Stripe**: https://dashboard.stripe.com/test/apikeys
- **Render**: https://render.com
- **Vercel**: https://vercel.com

---

## 🎯 Quick Wins

### Day 1
- [x] Setup development environment
- [x] Get API keys
- [x] Run application locally
- [x] Test basic features

### Week 1
- [ ] Complete appointments module
- [ ] Add health records
- [ ] Write more tests
- [ ] Deploy to staging

### Month 1
- [ ] Video consultations
- [ ] Payment integration
- [ ] Mobile app
- [ ] Production deployment

---

## 📞 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login
GET    /api/auth/me             # Get profile (protected)
GET    /api/auth/verify-email   # Verify email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/google         # Google OAuth
GET    /api/auth/github         # GitHub OAuth
```

### AI Features
```
POST   /api/ai/symptom-check    # Analyze symptoms
POST   /api/ai/chat             # Chat with AI
POST   /api/ai/drug-interactions # Check drug interactions
```

### Health
```
GET    /api/health              # Health check
```

---

## 💡 Pro Tips

1. **Use the setup scripts** - They handle everything automatically
2. **Read the test files** - They show how to use the APIs
3. **Check the logs** - Most issues are visible in logs
4. **Start small** - Get basic features working first
5. **Test locally** - Before deploying to production
6. **Use FREE tiers** - For development and MVP
7. **Monitor everything** - Set up logging and monitoring early
8. **Backup regularly** - Automate database backups
9. **Document changes** - Keep documentation updated
10. **Ask for help** - Don't struggle alone

---

## 🎉 Success Metrics

### Development
- ✅ All tests passing
- ✅ No linting errors
- ✅ Code coverage > 80%
- ✅ Build succeeds

### Production
- ✅ Uptime > 99.9%
- ✅ Response time < 200ms
- ✅ Zero security vulnerabilities
- ✅ Automated backups working
- ✅ Monitoring alerts configured

---

**Happy Building! 🚀**

For detailed information, see the full documentation files.
