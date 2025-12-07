# 🏥 MediConnect 360

> **AI-Powered Global Healthcare Platform** - Making healthcare accessible to everyone, everywhere.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🌐 Live Deployment

- **Frontend:** https://medi-connect-360.vercel.app
- **Backend API:** https://mediconnect-backend-4ujn.onrender.com
- **Status:** ✅ Fully Operational

## 🔧 Recent Updates (Dec 7, 2025)

### Fixed Issues
- ✅ Fixed OAuth authentication (Google & GitHub login now working)
- ✅ Fixed API URL configuration (all endpoints now use environment variables)
- ✅ Fixed routing issues (removed duplicate BrowserRouter)
- ✅ Added comprehensive Pricing/Payment page with Stripe integration
- ✅ Cleaned up redundant documentation files
- ✅ Updated Navbar with Pricing link

### Configured Services
- ✅ Google OAuth (Client ID configured)
- ✅ GitHub OAuth (Client ID configured)
- ✅ Stripe Payments (Test mode keys configured)
- ✅ Sentry Error Tracking (Frontend & Backend DSNs configured)
- ✅ PostgreSQL Database (Render - fully operational)
- ✅ Environment Variables (18 backend, 6 frontend - all set)

## ✨ Features (100% FREE!)

### Core Features
- 🤖 **AI Symptom Checker** - Powered by Google Gemini 2.5 Flash (FREE)
- 💬 **AI Health Assistant** - 24/7 medical guidance (FREE)
- 💊 **Drug Interaction Checker** - FDA official database (FREE)
- 👨‍⚕️ **Video Consultations** - Unlimited HD calls with Jitsi (FREE)
- 📊 **Health Dashboard** - Track vitals and metrics
- 🔐 **Secure Authentication** - Email, Google, GitHub OAuth (FREE)
- 💳 **Stripe Payments** - Test mode (FREE)
- 📧 **Email Notifications** - Resend 3,000/month (FREE)
- 🔔 **Push Notifications** - Firebase 10M/month (FREE)
- 📈 **Analytics** - Google Analytics unlimited (FREE)
- 🐛 **Error Tracking** - Sentry 5,000 errors/month (FREE)
- 🌐 **Multi-language Support** - 50+ languages (coming soon)
- 🔒 **HIPAA Compliant** - Enterprise-grade security

**Total Monthly Cost: $0** 🎉

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup.bat
```

**macOS/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

#### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

#### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/MediConnect-360.git
cd MediConnect-360
```

#### 2. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO S3 (port 9000, 9001)
- MongoDB (port 27017)

#### 3. Setup Backend

```bash
cd backend
npm install
# Edit backend/.env with your API keys
npm run start:dev
```

Backend runs at: http://localhost:5000

#### 4. Setup Frontend

```bash
# In project root
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### 5. Get API Keys

You need these FREE API keys:

#### Google Gemini AI (Required)
1. Visit: https://aistudio.google.com/app/apikey
2. Create API key
3. Add to `backend/.env`: `GEMINI_API_KEY=your-key`

#### Resend Email (Required)
1. Visit: https://resend.com/signup
2. Get API key
3. Add to `backend/.env`: `RESEND_API_KEY=your-key`

#### OAuth (Optional)
- **Google**: https://console.cloud.google.com/apis/credentials
- **GitHub**: https://github.com/settings/developers

#### Stripe (Optional)
- Visit: https://dashboard.stripe.com/test/apikeys

See [docs/GET_API_KEYS.md](docs/GET_API_KEYS.md) for detailed instructions.

## 📚 Documentation

### Quick Links
- **Live Demo:** https://medi-connect-360.vercel.app
- **API Docs:** https://mediconnect-backend-4ujn.onrender.com/api
- **GitHub:** https://github.com/Surajsharma0804/MediConnect-360

### Setup & Deployment
All deployment information is consolidated in this README. Follow the Quick Start section above to get started locally or deploy to production using Vercel (frontend) and Render (backend).

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **State:** Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend
- **Framework:** NestJS 11 + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Cache:** Redis
- **Storage:** MinIO S3
- **AI:** Google Gemini 2.5 Flash
- **Email:** Resend
- **Payments:** Stripe
- **Auth:** JWT + Passport (Google, GitHub OAuth)

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Frontend Hosting:** Vercel (FREE)
- **Backend Hosting:** Render (FREE)
- **Database:** Neon PostgreSQL (FREE)
- **Redis:** Upstash (FREE)

## 💰 Cost Breakdown

### Development (Local)
```
Docker Services:     $0 (runs locally)
Google Gemini:       $0 (60 req/min free)
Resend Email:        $0 (3,000 emails/month)
Total:               $0/month
```

### Production (FREE Tier)
```
Vercel:              $0 (100GB bandwidth)
Render:              $0 (750 hours/month)
Neon PostgreSQL:     $0 (3GB storage)
Upstash Redis:       $0 (10K commands/day)
Google Gemini:       $0 (60 req/min)
Resend:              $0 (3,000 emails/month)
Total:               $0/month FOREVER!
```

### Production (Paid - When You Scale)
```
Vercel Pro:          $20/month
Render Standard:     $7/month
Neon Scale:          $19/month
Upstash Pro:         $10/month
Total:               $56/month
```

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# AI Symptom Checker
curl -X POST http://localhost:5000/api/ai/symptom-check \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"headache and fever"}'

# User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Test Frontend

1. Open http://localhost:5173
2. Click "Sign up"
3. Create account
4. Try AI Symptom Checker
5. Explore Dashboard

## 📊 Project Structure

```
MediConnect-360/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── entities/       # Database models
│   │   ├── payment/        # Stripe integration
│   │   ├── services/       # AI, Email, Storage
│   │   └── main.ts         # Entry point
│   ├── .env                # Environment variables
│   └── package.json
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── App.tsx            # Main app
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services
└── README.md             # This file
```

## 🔒 Security Features

- ✅ HIPAA compliant architecture
- ✅ GDPR compliant data handling
- ✅ End-to-end encryption
- ✅ Secure password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Account lockout after failed attempts

## 🌍 Roadmap

### Phase 1: MVP (Current)
- [x] AI Symptom Checker
- [x] User Authentication
- [x] Health Dashboard
- [x] OAuth Integration
- [x] Payment System
- [ ] Video Consultations
- [ ] Electronic Health Records

### Phase 2: Enhancement
- [ ] Mobile Apps (iOS/Android)
- [ ] IoT Device Integration
- [ ] Advanced Analytics
- [ ] Multi-language Support (50+ languages)
- [ ] Telemedicine Marketplace

### Phase 3: Scale
- [ ] Multi-region Deployment
- [ ] AI Model Training
- [ ] Insurance Integration
- [ ] Pharmacy Network
- [ ] Global Expansion

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful medical AI
- Resend for reliable email delivery
- Neon for serverless PostgreSQL
- Upstash for serverless Redis
- Vercel & Render for free hosting
- Open source community

## 📞 Support

- **Email:** support@mediconnect360.com
- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/MediConnect-360/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/MediConnect-360/discussions)

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐️!

---

<div align="center">

**Built with ❤️ to make healthcare accessible to everyone, everywhere.**

**[Website](https://mediconnect360.com)** • **[Documentation](docs/)** • **[Demo](https://demo.mediconnect360.com)**

</div>
