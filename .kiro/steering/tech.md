# Technology Stack & Build System

## Frontend Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons), Recharts (charts)
- **Notifications**: React Hot Toast
- **i18n**: i18next + react-i18next
- **Real-time**: Socket.io Client
- **OAuth**: @react-oauth/google
- **Payments**: @stripe/stripe-js

## Backend Stack

- **Framework**: NestJS 11 + TypeScript
- **Runtime**: Node.js 18+
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: MinIO S3 / AWS S3
- **Authentication**: Passport (JWT, Google OAuth, GitHub OAuth)
- **Validation**: class-validator + class-transformer
- **AI**: Google Gemini 2.5 Flash (@google/generative-ai)
- **Email**: Resend
- **Payments**: Stripe
- **Security**: Helmet, bcrypt

## Development Tools

- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Testing**: Jest (backend), Supertest (e2e)
- **Containerization**: Docker + Docker Compose

## Common Commands

### Frontend (Root Directory)
```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run check-keys       # Verify API keys
npm run pre-deploy       # Pre-deployment checks
```

### Backend (backend/ Directory)
```bash
npm run start:dev        # Start dev server with watch (http://localhost:5000)
npm run start:prod       # Start production server
npm run build            # Compile TypeScript
npm run lint             # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run e2e tests
```

### Docker Services
```bash
docker-compose up -d     # Start all services (PostgreSQL, Redis, MinIO, MongoDB)
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_GA_TRACKING_ID` - Google Analytics tracking ID
- `VITE_FIREBASE_CONFIG` - Firebase configuration JSON

### Backend (backend/.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `RESEND_API_KEY` - Resend email API key (required)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `AWS_*` - AWS S3 credentials for file storage
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)

## TypeScript Configuration

- **Target**: ES2023
- **Module**: NodeNext (backend), ESNext (frontend)
- **Strict Mode**: Partial (strictNullChecks enabled)
- **Decorators**: Enabled (required for NestJS)
- **Path Aliases**: Not configured (use relative imports)

## API Conventions

- **Base URL**: `/api` prefix for all backend routes
- **Authentication**: Bearer token in Authorization header
- **Response Format**: JSON
- **Error Handling**: Global exception filter with structured error responses
- **Validation**: Automatic DTO validation with class-validator
