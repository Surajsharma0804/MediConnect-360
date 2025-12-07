# MediConnect 360 - Testing Guide

## Overview

This guide covers all testing strategies for MediConnect 360, including unit tests, integration tests, E2E tests, and manual testing procedures.

## Table of Contents

1. [Backend Testing](#backend-testing)
2. [Frontend Testing](#frontend-testing)
3. [E2E Testing](#e2e-testing)
4. [Manual Testing](#manual-testing)
5. [CI/CD Testing](#cicd-testing)

---

## Backend Testing

### Setup

```bash
cd backend
npm install
```

### Unit Tests

Run all unit tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:cov
```

### Test Structure

```
backend/src/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts      # Unit tests
├── services/
│   ├── ai.service.ts
│   └── ai.service.spec.ts        # Unit tests
```

### Writing Unit Tests

Example test for a service:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    const result = await service.register('test@example.com', 'password', 'Test User');
    expect(result.user.email).toBe('test@example.com');
  });
});
```

### Integration Tests

Run E2E tests:
```bash
npm run test:e2e
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows covered

---

## Frontend Testing

### Setup

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Component Testing

Example component test:

```typescript
import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in to MediConnect')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<LoginPage />);
    // Add test logic
  });
});
```

---

## E2E Testing

### Setup

```bash
cd backend
npm install
```

### Running E2E Tests

```bash
# Start test database
docker-compose up -d postgres redis

# Run E2E tests
npm run test:e2e
```

### E2E Test Examples

```typescript
describe('Authentication Flow (e2e)', () => {
  it('should register, login, and access protected route', async () => {
    // Register
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(201);

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(201);

    const token = loginResponse.body.accessToken;

    // Access protected route
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

---

## Manual Testing

### 1. Authentication Flow

#### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Registration successful! Please check your email to verify your account."
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response:
```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### 2. AI Features

#### Symptom Checker
```bash
curl -X POST http://localhost:5000/api/ai/symptom-check \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "headache, fever, and fatigue",
    "language": "en"
  }'
```

#### Drug Interaction Checker
```bash
curl -X POST http://localhost:5000/api/ai/drug-interactions \
  -H "Content-Type: application/json" \
  -d '{
    "medications": ["Aspirin", "Ibuprofen", "Warfarin"]
  }'
```

### 3. Health Check

```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "MediConnect 360 API",
  "version": "1.0.0"
}
```

---

## CI/CD Testing

### GitHub Actions

Our CI/CD pipeline automatically runs tests on every push and pull request.

**Pipeline Steps:**
1. Backend unit tests
2. Backend E2E tests
3. Frontend build and lint
4. Docker image builds (on main branch)
5. Deployment (on main branch)

### Local CI Testing

Test the CI pipeline locally:

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
choco install act  # Windows

# Run CI pipeline locally
act push
```

---

## Test Data

### Test Users

```javascript
const testUsers = [
  {
    email: 'patient@test.com',
    password: 'Patient123!',
    role: 'patient'
  },
  {
    email: 'doctor@test.com',
    password: 'Doctor123!',
    role: 'doctor'
  },
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  }
];
```

### Test Scenarios

1. **Happy Path**: User registers → verifies email → logs in → uses features
2. **Error Handling**: Invalid credentials → account locked → password reset
3. **Edge Cases**: Concurrent requests → rate limiting → expired tokens

---

## Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:5000/api/health
```

### Stress Testing

```bash
# Test with 1000 concurrent users
artillery quick --count 1000 --num 10 http://localhost:5000/api/health
```

---

## Security Testing

### 1. SQL Injection Testing

```bash
# Try SQL injection in login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com OR 1=1--",
    "password": "anything"
  }'
```

Should return 400 or 401, not 500.

### 2. XSS Testing

```bash
# Try XSS in registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

Should sanitize the input.

### 3. Rate Limiting

```bash
# Send 200 requests rapidly
for i in {1..200}; do
  curl http://localhost:5000/api/health &
done
```

Should return 429 (Too Many Requests) after limit.

---

## Monitoring & Debugging

### View Logs

```bash
# Backend logs
cd backend
npm run start:dev

# Docker logs
docker-compose logs -f backend
```

### Debug Mode

```bash
# Start backend in debug mode
cd backend
npm run start:debug
```

Then attach your debugger to port 9229.

---

## Best Practices

1. **Write tests first** (TDD approach)
2. **Keep tests isolated** (no shared state)
3. **Use meaningful test names**
4. **Mock external dependencies**
5. **Test edge cases and error scenarios**
6. **Maintain test coverage above 80%**
7. **Run tests before committing**
8. **Keep tests fast** (< 5 seconds for unit tests)

---

## Troubleshooting

### Tests Failing Locally

1. Check database connection
2. Ensure all services are running
3. Clear test database
4. Update dependencies

```bash
# Reset test database
docker-compose down -v
docker-compose up -d

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CI/CD Failures

1. Check GitHub Actions logs
2. Verify environment variables
3. Ensure secrets are configured
4. Test locally with `act`

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

## Support

For testing issues, please:
1. Check this guide
2. Review test logs
3. Open an issue on GitHub
4. Contact the development team

Happy Testing! 🧪
