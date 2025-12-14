# MediConnect 360 - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/Surajsharma0804/MediConnect-360.git
cd MediConnect-360

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start services
docker-compose up -d
npm run dev
cd backend && npm run start:dev
```

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=https://mediconnect-backend-orkv.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Backend (backend/.env)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=your-postgres-url
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=https://medi-connect-360.vercel.app
```

## Production Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Authentication**: JWT + OAuth (Google)
- **Deployment**: Vercel (Frontend) + Render (Backend)

## Key Features

- 🔐 Secure OAuth authentication
- 🏥 Medical document management
- 💬 AI-powered symptom checker
- 📱 Progressive Web App
- 🔒 Enterprise-grade security