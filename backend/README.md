# MediConnect 360 - Backend API

## 🚀 Quick Start

### 1. Start Infrastructure
```bash
# From root directory
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy .env file and add your API keys
cp .env .env.local
# Edit .env and add:
# - GEMINI_API_KEY (get from https://aistudio.google.com/app/apikey)
# - RESEND_API_KEY (get from https://resend.com/api-keys)
```

### 4. Start Development Server
```bash
npm run start:dev
```

Server will be available at: http://localhost:5000

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/verify-email?token=xxx
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me (requires JWT)
```

### AI Services
```
POST /api/ai/symptom-check
POST /api/ai/chat
POST /api/ai/drug-interactions
```

## 🔑 Required API Keys

### Google Gemini (FREE)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env` as `GEMINI_API_KEY`

### Resend Email (FREE 3,000/month)
1. Visit: https://resend.com/signup
2. Verify your email
3. Get API key from dashboard
4. Copy and paste into `.env` as `RESEND_API_KEY`

### Google OAuth (FREE)
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: http://localhost:5000/api/auth/google/callback
4. Copy Client ID and Secret to `.env`

## 🐳 Docker Services

The backend connects to these services (started with docker-compose):

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO (S3)**: localhost:9000 (Console: localhost:9001)
- **MongoDB**: localhost:27017

## 🛠️ Development

```bash
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run linter
npm run test         # Run tests
```

## 📦 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **AI**: Google Gemini
- **Storage**: MinIO (S3-compatible)
- **Email**: Resend
- **Auth**: JWT + Passport + Google OAuth
- **Payments**: Stripe

## 🎯 Features Implemented

✅ User authentication (JWT + Google OAuth)
✅ Email verification
✅ Password reset
✅ AI symptom checker (Google Gemini)
✅ AI chat assistant
✅ Drug interaction checker
✅ File storage (MinIO)
✅ Email service (Resend)
✅ SMS service (console log for dev)

## 🚧 Coming Soon

- [ ] Health metrics tracking
- [ ] Appointment booking
- [ ] Video consultation (Jitsi)
- [ ] Electronic health records
- [ ] Payment processing (Stripe)
- [ ] Real-time notifications

## 📝 Environment Variables

See `.env` file for all configuration options.

## 🐛 Troubleshooting

### Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Port already in use
```bash
# Change PORT in .env file
PORT=5001
```

### Gemini API error
- Check your API key is correct
- Verify you have credits
- Check rate limits (60 req/min on free tier)

## 📚 Documentation

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [Gemini API](https://ai.google.dev/)
- [Resend Docs](https://resend.com/docs)

## 🎉 Success!

If you see this message, your backend is running:
```
🚀 MediConnect 360 Backend Server
✅ Server running on: http://localhost:5000
✅ API endpoints: http://localhost:5000/api
```

Test it: http://localhost:5000/api/health
