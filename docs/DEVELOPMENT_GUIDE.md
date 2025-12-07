# 🛠️ MediConnect 360 - Development Guide

Complete guide for developers working on MediConnect 360.

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Common Commands](#common-commands)
5. [Coding Standards](#coding-standards)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **UI Components:** Lucide React (icons), Recharts (charts)
- **Notifications:** React Hot Toast
- **i18n:** i18next + react-i18next
- **Real-time:** Socket.io Client
- **OAuth:** @react-oauth/google
- **Payments:** @stripe/stripe-js

### Backend
- **Framework:** NestJS 11 + TypeScript
- **Runtime:** Node.js 18+
- **ORM:** TypeORM
- **Database:** PostgreSQL 16
- **Cache:** Redis
- **Storage:** MinIO S3 / AWS S3
- **Authentication:** Passport (JWT, Google OAuth, GitHub OAuth)
- **Validation:** class-validator + class-transformer
- **AI:** Google Gemini 2.5 Flash
- **Email:** Resend
- **Payments:** Stripe
- **Security:** Helmet, bcrypt

### Development Tools
- **Linting:** ESLint 9
- **Formatting:** Prettier
- **Testing:** Jest (backend), Supertest (e2e)
- **Containerization:** Docker + Docker Compose

---

## 📁 Project Structure

```
MediConnect-360/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── ai/                      # AI module (symptom checker, chat, voice)
│   │   ├── appointments/            # Appointment scheduling
│   │   ├── auth/                    # Authentication (JWT, OAuth)
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── guards/              # Route guards
│   │   │   └── strategies/          # Passport strategies
│   │   ├── common/                  # Shared utilities
│   │   │   ├── filters/             # Exception filters
│   │   │   ├── guards/              # Rate limiting, etc.
│   │   │   └── interceptors/        # Logging, transformation
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.config.ts   # Database configuration
│   │   │   └── env.validation.ts    # Environment validation
│   │   ├── ehr/                     # Electronic Health Records
│   │   ├── emergency/               # Emergency features (SOS, Medical ID)
│   │   ├── entities/                # TypeORM database entities (25 total)
│   │   ├── family/                  # Family management
│   │   ├── health-tracking/         # Health tracking (13 types)
│   │   ├── insurance/               # Insurance & billing
│   │   ├── messaging/               # Secure messaging
│   │   ├── pharmacy/                # Pharmacy integration
│   │   ├── providers/               # Provider directory
│   │   ├── services/                # Shared services
│   │   │   ├── ai.service.ts        # Google Gemini AI
│   │   │   ├── email.service.ts     # Resend email
│   │   │   ├── notification.service.ts # Push notifications
│   │   │   ├── storage.service.ts   # S3 file storage
│   │   │   ├── payment.service.ts   # Stripe integration
│   │   │   └── voice.service.ts     # Voice chat (20+ languages)
│   │   ├── app.module.ts            # Root module
│   │   └── main.ts                  # Entry point
│   ├── test/                        # E2E tests
│   ├── .env                         # Environment variables
│   ├── Dockerfile                   # Docker configuration
│   └── package.json
├── src/                             # React Frontend
│   ├── components/                  # UI components
│   │   ├── auth/                    # Authentication components
│   │   ├── common/                  # Shared components (Navbar, etc.)
│   │   └── ...
│   ├── context/                     # React Context providers
│   ├── hooks/                       # Custom React hooks
│   ├── pages/                       # Page components (routes)
│   ├── services/                    # API and external services
│   │   ├── api.ts                   # Backend API client
│   │   ├── firebase.ts              # Firebase integration
│   │   ├── sentry.ts                # Error tracking
│   │   └── analytics.ts             # Google Analytics
│   ├── App.tsx                      # Root component with routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles (Tailwind)
├── docs/                            # Documentation
├── scripts/                         # Setup scripts
├── docker-compose.yml               # Docker services
└── README.md                        # Main documentation
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MediConnect-360.git
   cd MediConnect-360
   ```

2. **Start Docker Services**
   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm run start:dev
   ```

4. **Setup Frontend**
   ```bash
   # In project root
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

---

## 🔧 Common Commands

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
docker-compose up -d                    # Start all services
docker-compose --profile tools up -d    # Start with management tools
docker-compose logs -f                  # View logs
docker-compose ps                       # Check status
docker-compose down                     # Stop all services
```

---

## 📝 Coding Standards

### NestJS Backend Patterns

**Modules:** Feature-based organization
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

**Controllers:** Handle HTTP requests
```typescript
@Controller('api/feature')
@UseGuards(JwtAuthGuard)
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  async findAll() {
    return this.featureService.findAll();
  }
}
```

**Services:** Business logic
```typescript
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}

  async findAll() {
    try {
      return await this.repository.find();
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }
}
```

**DTOs:** Input validation
```typescript
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**Entities:** TypeORM models
```typescript
@Entity('table_name')
@Index(['userId', 'status'])
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date; // Soft delete
}
```

### React Frontend Patterns

**Functional Components:**
```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const Component: React.FC<Props> = ({ title, onSubmit }) => {
  const [state, setState] = useState<string>('');

  return (
    <div className="container">
      <h1>{title}</h1>
      {/* Component content */}
    </div>
  );
};
```

**Custom Hooks:**
```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth logic
  }, []);

  return { user, loading };
};
```

**API Calls:**
```typescript
// Centralized in services/api.ts
export const fetchWithAuth = async (url: string, options = {}) => {
  const token = localStorage.getItem('token');
  return axios({
    url: `${API_URL}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
};
```

---

## ✅ Best Practices

### Environment Variables

**Backend (.env):**
```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/mediconnect
JWT_SECRET=your-super-secret-jwt-key-32-chars-min
GEMINI_API_KEY=your-google-gemini-api-key
RESEND_API_KEY=your-resend-api-key

# Optional
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-key
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-key
```

### Security

1. **Never commit .env files**
2. **Use strong JWT secrets** (32+ characters)
   ```bash
   openssl rand -base64 32
   ```
3. **Change default passwords** in production
4. **Enable HTTPS** in production
5. **Configure CORS** for production domain only
6. **Use production API keys** in production

### Logging

**Use Logger, not console.log:**
```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message', error.stack);
  }
}
```

### Error Handling

**Service-level:**
```typescript
async someMethod() {
  try {
    // Your code
  } catch (error) {
    this.logger.error(`Error in someMethod: ${error.message}`);
    throw new Error('User-friendly error message');
  }
}
```

### Medical Disclaimers

**Required for all AI responses:**
```typescript
return {
  response: aiResponse,
  disclaimer: 'This is NOT medical advice. Always consult a healthcare professional.',
};
```

---

## 🧪 Testing

### Backend Tests

**Unit Tests:**
```bash
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
```

**E2E Tests:**
```bash
npm run test:e2e
```

**Writing Tests:**
```typescript
describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FeatureService],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Frontend Tests

**Coming Soon:** Vitest + React Testing Library

---

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] Run all tests
- [ ] Check for TypeScript errors
- [ ] Review security checklist
- [ ] Update environment variables
- [ ] Test Docker build
- [ ] Verify health check endpoint
- [ ] Review logs for warnings

### Production Environment Variables

**Backend:**
- Change all default passwords
- Use strong JWT secrets
- Configure production database
- Set CORS_ORIGIN to production domain
- Use production API keys

**Frontend:**
- Set VITE_API_URL to production backend
- Use production OAuth client IDs
- Use production Stripe keys

### Docker Build

```bash
# Backend
cd backend
docker build -t mediconnect-backend .

# Frontend
docker build -t mediconnect-frontend .
```

---

## 🔧 Troubleshooting

### Common Issues

**"Missing environment variable"**
- Check `.env` file exists
- Verify all required variables are set

**"Port already in use"**
- Change port in docker-compose.yml
- Or stop conflicting service

**"Cannot connect to database"**
- Ensure Docker services are running: `docker-compose ps`
- Check DATABASE_URL is correct

**"AI service not working"**
- Verify GEMINI_API_KEY is set and valid
- Check API quota limits

**"Module not found"**
- Run `npm install` in the appropriate directory
- Delete node_modules and reinstall

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
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

---

## 📚 Additional Resources

- **Main README:** [README.md](../README.md)
- **API Documentation:** [API_ENDPOINTS.md](../API_ENDPOINTS.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Keys Guide:** [GET_API_KEYS.md](GET_API_KEYS.md)
- **Competitive Analysis:** [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

**Happy Coding! 🚀**
