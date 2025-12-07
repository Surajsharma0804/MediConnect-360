# 🤝 Contributing to MediConnect 360

Thank you for your interest in contributing to MediConnect 360! This guide will help you get started.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Suggesting Features](#suggesting-features)
9. [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations of the Code of Conduct may be reported to support@mediconnect360.com. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- Docker Desktop installed
- Git installed
- A GitHub account
- Basic knowledge of TypeScript, React, and NestJS

### Fork and Clone

1. **Fork the repository:**
   - Go to https://github.com/YOUR_USERNAME/MediConnect-360
   - Click "Fork" button

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MediConnect-360.git
   cd MediConnect-360
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/MediConnect-360.git
   ```

4. **Verify remotes:**
   ```bash
   git remote -v
   # origin    https://github.com/YOUR_USERNAME/MediConnect-360.git (fetch)
   # origin    https://github.com/YOUR_USERNAME/MediConnect-360.git (push)
   # upstream  https://github.com/ORIGINAL_OWNER/MediConnect-360.git (fetch)
   # upstream  https://github.com/ORIGINAL_OWNER/MediConnect-360.git (push)
   ```

---

## 💻 Development Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Environment

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files with your API keys
# See docs/GET_API_KEYS.md for how to get keys
```

### 3. Start Services

```bash
# Start Docker services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Start backend (in one terminal)
cd backend
npm run start:dev

# Start frontend (in another terminal)
npm run dev
```

### 4. Verify Setup

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## 🛠️ How to Contribute

### Types of Contributions

We welcome all types of contributions:

1. **Bug Fixes** - Fix issues in existing code
2. **New Features** - Add new functionality
3. **Documentation** - Improve or add documentation
4. **Tests** - Add or improve test coverage
5. **Performance** - Optimize existing code
6. **UI/UX** - Improve user interface and experience
7. **Translations** - Add support for new languages
8. **Code Review** - Review pull requests

### Contribution Workflow

1. **Check existing issues:**
   - Look for existing issues or create a new one
   - Comment that you're working on it

2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes:**
   - Write clean, readable code
   - Follow coding standards (see below)
   - Add tests if applicable
   - Update documentation

4. **Test your changes:**
   ```bash
   # Backend tests
   cd backend
   npm run test
   npm run lint
   
   # Frontend tests
   npm run lint
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in component"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request:**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill in the PR template
   - Link related issues

---

## 📝 Coding Standards

### General Principles

- **DRY (Don't Repeat Yourself)** - Avoid code duplication
- **KISS (Keep It Simple, Stupid)** - Simple solutions are better
- **YAGNI (You Aren't Gonna Need It)** - Don't add unnecessary features
- **SOLID Principles** - Follow object-oriented design principles

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // Implementation
};

// ❌ Bad
const getUser = async (id: any): Promise<any> => {
  // Implementation
};
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="btn btn-primary"
    >
      {label}
    </button>
  );
};

// ❌ Bad - No types, unclear props
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### NestJS Services

```typescript
// ✅ Good
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }
}

// ❌ Bad - No error handling, no logging
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }
}
```

### Naming Conventions

**Files:**
```
✅ user.service.ts
✅ user.controller.ts
✅ user.entity.ts
✅ create-user.dto.ts
✅ UserProfile.tsx
✅ useAuth.ts

❌ UserService.ts (backend)
❌ user-profile.tsx (React component)
❌ auth.ts (hook should be useAuth.ts)
```

**Variables:**
```typescript
// ✅ Good
const userName = 'John';
const isActive = true;
const userList = [];
const MAX_RETRIES = 3;

// ❌ Bad
const user_name = 'John';
const active = true;
const list = [];
const maxretries = 3;
```

**Functions:**
```typescript
// ✅ Good
const getUserById = (id: string) => {};
const handleSubmit = () => {};
const validateEmail = (email: string) => {};

// ❌ Bad
const get_user = (id: string) => {};
const submit = () => {};
const validate = (email: string) => {};
```

### Comments

```typescript
// ✅ Good - Explain WHY, not WHAT
// Calculate discount based on user's loyalty tier
// Premium users get 20% off, regular users get 10%
const discount = user.isPremium ? 0.2 : 0.1;

// ❌ Bad - Obvious comment
// Set discount to 0.2 if premium, else 0.1
const discount = user.isPremium ? 0.2 : 0.1;
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  this.logger.error(`Operation failed: ${error.message}`, error.stack);
  throw new InternalServerErrorException('Failed to complete operation');
}

// ❌ Bad
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.log(error);
  throw error;
}
```

### Medical Disclaimers

**CRITICAL:** All AI-generated medical content MUST include disclaimers:

```typescript
// ✅ Good
return {
  diagnosis: aiResponse,
  disclaimer: 'This is NOT medical advice. Always consult a healthcare professional for medical concerns.',
  confidence: 0.85,
};

// ❌ Bad - Missing disclaimer
return {
  diagnosis: aiResponse,
  confidence: 0.85,
};
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console.log() statements
- [ ] No commented-out code
- [ ] Medical disclaimers added (if applicable)

### PR Title Format

Use conventional commits format:

```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add tests for user service
chore: update dependencies
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added
- [ ] Documentation updated
- [ ] Tests added
- [ ] All tests pass
```

### Review Process

1. **Automated Checks:**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests (Jest)
   - Build verification

2. **Code Review:**
   - At least one maintainer approval required
   - Address all review comments
   - Keep discussions professional

3. **Merge:**
   - Squash and merge (default)
   - Delete branch after merge

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** - Your bug might already be reported
2. **Try latest version** - Bug might be fixed
3. **Reproduce** - Ensure bug is reproducible

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- App version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

### Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead, email: security@mediconnect360.com

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 💡 Suggesting Features

### Before Suggesting

1. **Check existing issues** - Feature might be planned
2. **Check roadmap** - Feature might be in progress
3. **Consider scope** - Is it aligned with project goals?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, screenshots, or mockups.

**Would you like to implement this feature?**
- [ ] Yes, I can implement this
- [ ] No, just suggesting
```

---

## 🌍 Community

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and general discussion
- **Email:** support@mediconnect360.com
- **Discord:** (Coming soon)

### Getting Help

**For development questions:**
1. Check documentation first
2. Search existing issues
3. Ask in GitHub Discussions
4. Email support

**For urgent issues:**
- Email: support@mediconnect360.com
- Include: OS, Node version, error logs

---

## 🏆 Recognition

### Contributors

All contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

### Top Contributors

Special recognition for:
- Most commits
- Most impactful features
- Best code reviews
- Documentation improvements

---

## 📚 Additional Resources

### Documentation
- [README.md](../README.md) - Project overview
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development setup
- [API_ENDPOINTS.md](../API_ENDPOINTS.md) - API documentation
- [GET_API_KEYS.md](GET_API_KEYS.md) - API keys guide

### Learning Resources
- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeORM Docs](https://typeorm.io/)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Thank you for contributing to MediConnect 360! Your efforts help make healthcare more accessible to everyone.

**Questions?** Email: support@mediconnect360.com

---

**Last Updated:** December 2025  
**Status:** Complete ✅
