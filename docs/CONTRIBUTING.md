# Contributing to MediConnect 360

First off, thank you for considering contributing to MediConnect 360! It's people like you that make this platform a reality and help make healthcare accessible to everyone worldwide.

## 🌟 How Can I Contribute?

### 1. Code Contributions
- Implement new features
- Fix bugs
- Improve performance
- Write tests
- Refactor code

### 2. Translation Contributions
- Translate UI strings to your native language
- Review existing translations
- Add cultural adaptations
- Improve medical terminology

### 3. Documentation
- Improve README and guides
- Write tutorials
- Create video walkthroughs
- Document APIs

### 4. Design Contributions
- UI/UX improvements
- Create icons and graphics
- Design new features
- Improve accessibility

### 5. Medical Expertise
- Review medical content
- Suggest health features
- Validate AI responses
- Ensure compliance

### 6. Testing & Bug Reports
- Test new features
- Report bugs
- Suggest improvements
- Perform security audits

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React and TypeScript

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mediconnect-360.git
   cd mediconnect-360
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/mediconnect-360.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Workflow

### 1. Pick an Issue
- Browse [open issues](https://github.com/yourusername/mediconnect-360/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it

### 2. Write Code
- Follow our coding standards (see below)
- Write clean, readable code
- Add comments for complex logic
- Keep commits small and focused

### 3. Test Your Changes
```bash
# Run linter
npm run lint

# Run tests (when available)
npm run test

# Build to check for errors
npm run build
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add Spanish translation for symptom checker

fix: resolve video call connection issue on Safari

docs: update installation instructions in README
```

### 5. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to your fork on GitHub
- Click "New Pull Request"
- Fill out the PR template
- Link related issues
- Wait for review

## 💻 Coding Standards

### TypeScript/JavaScript
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// ❌ Bad
const getUserById = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

### React Components
```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// ❌ Bad - No types, unclear naming
export const Btn = ({ l, o, v = 'p' }) => {
  return <button onClick={o} className={`btn btn-${v}`}>{l}</button>;
};
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `SymptomChecker.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `useCamelCase.tsx` (e.g., `useAuth.tsx`)
- Types: `camelCase.ts` (e.g., `user.ts`)

### Folder Structure
```
src/
├── components/
│   ├── common/          # Shared components
│   ├── feature/         # Feature-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom hooks
├── pages/               # Page components
├── services/            # API services
├── store/               # State management
├── types/               # TypeScript types
├── utils/               # Utility functions
└── i18n/                # Internationalization
```

## 🌍 Translation Guidelines

### Adding a New Language

1. **Create translation file**
   ```bash
   # Create file: src/i18n/locales/[language-code]/common.json
   ```

2. **Add translations**
   ```json
   {
     "welcome": "Welcome to MediConnect 360",
     "login": "Login",
     "signup": "Sign Up",
     "symptomChecker": "Symptom Checker"
   }
   ```

3. **Register language**
   ```typescript
   // src/i18n/config.ts
   export const languages = [
     { code: 'en', name: 'English', nativeName: 'English' },
     { code: 'es', name: 'Spanish', nativeName: 'Español' },
     { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
     // Add your language here
   ];
   ```

4. **Test thoroughly**
   - Check all pages
   - Verify RTL support (if applicable)
   - Test date/number formatting
   - Ensure medical terms are accurate

### Translation Best Practices
- Use native speakers for translations
- Maintain consistent terminology
- Consider cultural context
- Keep medical accuracy
- Test with real users

## 🐛 Bug Reports

### Before Submitting
- Check if the bug has already been reported
- Try to reproduce the bug
- Gather relevant information

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11, macOS 13]
- Browser: [e.g., Chrome 120, Safari 17]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or other relevant information.
```

## 🔍 Code Review Process

### What We Look For
- ✅ Code quality and readability
- ✅ Proper TypeScript types
- ✅ Test coverage
- ✅ Documentation
- ✅ Performance considerations
- ✅ Security best practices
- ✅ Accessibility compliance

### Review Timeline
- Initial review: Within 2-3 days
- Follow-up reviews: Within 1-2 days
- Merge: After approval from 2 maintainers

### Addressing Feedback
- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Push updates to the same branch

## 🏆 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to our Discord community
- Eligible for contributor swag (coming soon)

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: conduct@mediconnect360.com

## 📞 Getting Help

### Resources
- 📖 [Documentation](./README.md)
- 💬 [Discord Community](https://discord.gg/mediconnect360)
- 📧 [Email Support](mailto:support@mediconnect360.com)
- 🐦 [Twitter](https://twitter.com/mediconnect360)

### Questions?
- Check existing issues and discussions
- Ask in our Discord community
- Create a new issue with the `question` label

## 🎯 Priority Areas

We especially need help with:
1. **Translations** - Native speakers for 50+ languages
2. **Medical Expertise** - Healthcare professionals for content review
3. **Testing** - QA and bug reporting
4. **Documentation** - Tutorials and guides
5. **Accessibility** - WCAG compliance improvements

## 📊 Development Metrics

### Definition of Done
- [ ] Code is written and tested
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] PR description is complete
- [ ] No merge conflicts
- [ ] Approved by 2 maintainers

### Quality Standards
- Code coverage: 80%+
- Performance: No regressions
- Accessibility: WCAG 2.1 AA
- Security: No vulnerabilities
- Browser support: Last 2 versions

## 🚀 Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

### Release Schedule
- Patch releases: Weekly
- Minor releases: Monthly
- Major releases: Quarterly

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make MediConnect 360 better for everyone. Together, we're making healthcare accessible to the world!

**Questions?** Reach out to us at contribute@mediconnect360.com

---

<div align="center">

**Happy Contributing! 🎉**

[Back to README](./README.md) | [View Issues](https://github.com/yourusername/mediconnect-360/issues) | [Join Discord](https://discord.gg/mediconnect360)

</div>
