# Project Structure & Architecture

## Monorepo Layout

```
MediConnect-360/
├── backend/              # NestJS backend application
├── src/                  # React frontend application
├── docs/                 # Documentation files
├── scripts/              # Setup and deployment scripts
├── .kiro/                # Kiro AI configuration
└── docker-compose.yml    # Local development services
```

## Backend Architecture (backend/)

### Directory Structure
```
backend/
├── src/
│   ├── ai/                      # AI module
│   │   ├── ai.controller.ts     # AI endpoints
│   │   └── ai.module.ts         # AI module definition
│   ├── auth/                    # Authentication module
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── strategies/          # Passport strategies (JWT, Google, GitHub)
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   └── auth.service.ts      # Auth business logic
│   ├── common/                  # Shared utilities
│   │   ├── filters/             # Exception filters
│   │   ├── guards/              # Route guards (rate limiting, etc.)
│   │   └── interceptors/        # Request/response interceptors
│   ├── config/                  # Configuration files
│   │   ├── database.config.ts   # Database configuration
│   │   └── env.validation.ts    # Environment validation
│   ├── entities/                # TypeORM database entities
│   ├── payment/                 # Payment module (Stripe)
│   ├── services/                # Business logic services
│   │   ├── ai.service.ts        # Google Gemini AI integration
│   │   ├── analytics.service.ts # Analytics tracking
│   │   ├── email.service.ts     # Resend email service
│   │   ├── fda.service.ts       # FDA drug database
│   │   ├── notification.service.ts # Push notifications
│   │   ├── payment.service.ts   # Stripe integration
│   │   ├── sms.service.ts       # SMS notifications
│   │   ├── storage.service.ts   # S3 file storage
│   │   └── video.service.ts     # Jitsi video calls
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
├── test/                        # E2E tests
└── dist/                        # Compiled output
```

### NestJS Patterns

- **Modules**: Feature-based organization (auth, payment, etc.)
- **Controllers**: Handle HTTP requests, delegate to services
- **Services**: Business logic, marked with `@Injectable()`
- **DTOs**: Input validation with class-validator decorators
- **Entities**: TypeORM models with decorators
- **Strategies**: Passport authentication strategies
- **Guards**: Route protection and authorization
- **Filters**: Global exception handling
- **Interceptors**: Logging, transformation, caching

### Key Conventions

- Use dependency injection for all services
- DTOs must use class-validator decorators (`@IsString()`, `@IsEmail()`, etc.)
- Entities use TypeORM decorators (`@Entity()`, `@Column()`, etc.)
- Password fields marked with `@Exclude()` and `select: false`
- All services should have proper error handling and logging
- Use `Logger` from `@nestjs/common` for logging
- Global prefix `/api` for all routes
- Validation pipe enabled globally with whitelist and transform

## Frontend Architecture (src/)

### Directory Structure
```
src/
├── components/              # React components
│   ├── auth/                # Authentication components
│   ├── common/              # Shared components (Navbar, etc.)
│   ├── home/                # Home page components
│   └── video/               # Video consultation components
├── context/                 # React Context providers
├── hooks/                   # Custom React hooks
├── pages/                   # Page components (routes)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── SymptomCheckerPage.tsx
│   └── ...
├── services/                # API and external services
│   ├── api.ts               # Backend API client
│   ├── firebase.ts          # Firebase integration
│   ├── sentry.ts            # Error tracking
│   └── analytics.ts         # Google Analytics
├── App.tsx                  # Root component with routing
├── main.tsx                 # Application entry point
└── index.css                # Global styles (Tailwind)
```

### React Patterns

- **Functional Components**: Use function components with hooks
- **TypeScript**: All components typed with proper interfaces
- **State Management**: Zustand for global state, useState for local
- **Routing**: React Router v6 with protected routes
- **API Calls**: Centralized in `services/api.ts`
- **Styling**: TailwindCSS utility classes
- **Icons**: Lucide React components

### Key Conventions

- Component files use PascalCase (e.g., `DashboardPage.tsx`)
- One component per file
- Props interfaces defined inline or exported
- Use custom hooks for reusable logic (e.g., `useAuth`)
- Protected routes wrapped with `ProtectedRoute` component
- API calls use `fetchWithAuth` helper for authentication
- Environment variables prefixed with `VITE_`
- Toast notifications for user feedback

## Database Schema

### Entities

- **User**: Core user entity with roles (patient, doctor, nurse, admin)
  - OAuth support (Google, GitHub)
  - Account lockout after failed login attempts
  - Soft delete for HIPAA compliance
  - JSONB metadata field for extensibility
- **Appointment**: Video consultation bookings
- **HealthRecord**: Patient health records

### Conventions

- UUID primary keys
- Timestamps: `createdAt`, `updatedAt`
- Soft deletes: `deletedAt` field
- Indexes on frequently queried fields
- Enums for fixed value sets (roles, gender, blood type)
- JSONB for flexible metadata
- Hooks for data normalization (`@BeforeInsert`, `@BeforeUpdate`)

## API Structure

### Endpoint Patterns
```
/api/auth/register          # POST - User registration
/api/auth/login             # POST - Email/password login
/api/auth/google            # GET - Google OAuth
/api/auth/github            # GET - GitHub OAuth
/api/auth/me                # GET - Current user profile
/api/ai/symptom-check       # POST - AI symptom analysis
/api/ai/chat                # POST - AI health assistant
/api/ai/drug-interactions   # POST - Drug interaction checker
/api/payment/*              # Stripe payment endpoints
/api/health                 # GET - Health check
```

### Request/Response Format

- Requests: JSON body with DTO validation
- Responses: JSON with consistent structure
- Errors: Structured error objects with message and statusCode
- Authentication: Bearer token in Authorization header

## Testing Structure

### Backend Tests
- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `test/*.e2e-spec.ts`
- Run with Jest

### Frontend Tests
- Not currently configured
- Future: Vitest + React Testing Library

## Documentation

- `docs/` - Comprehensive guides
- `README.md` - Quick start and overview
- Inline code comments for complex logic
- JSDoc for public APIs
