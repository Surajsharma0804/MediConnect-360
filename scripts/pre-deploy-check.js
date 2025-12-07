#!/usr/bin/env node

/**
 * MediConnect 360 - Pre-Deployment Checker
 * Verifies your app is ready for deployment
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log('\n' + '='.repeat(60));
console.log(`${colors.cyan}🚀 MediConnect 360 - Pre-Deployment Check${colors.reset}`);
console.log('='.repeat(60) + '\n');

let errors = 0;
let warnings = 0;
let passed = 0;

function check(name, condition, errorMsg, warningMsg) {
  if (condition === true) {
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    passed++;
    return true;
  } else if (condition === 'warning') {
    console.log(`${colors.yellow}⚠️  ${name}${colors.reset}`);
    if (warningMsg) console.log(`   ${warningMsg}`);
    warnings++;
    return false;
  } else {
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    if (errorMsg) console.log(`   ${errorMsg}`);
    errors++;
    return false;
  }
}

// Check 1: Backend files exist
console.log(`${colors.blue}📦 Backend Files:${colors.reset}\n`);

check(
  'Backend package.json exists',
  fs.existsSync('backend/package.json'),
  'Run: cd backend && npm install'
);

check(
  'Backend .env exists',
  fs.existsSync('backend/.env'),
  'Copy backend/.env.example to backend/.env'
);

check(
  'Backend src/main.ts exists',
  fs.existsSync('backend/src/main.ts'),
  'Backend source files missing'
);

check(
  'Backend node_modules exists',
  fs.existsSync('backend/node_modules'),
  'Run: cd backend && npm install'
);

// Check 2: Frontend files exist
console.log(`\n${colors.blue}🎨 Frontend Files:${colors.reset}\n`);

check(
  'Frontend package.json exists',
  fs.existsSync('package.json'),
  'Run: npm install'
);

check(
  'Frontend .env exists',
  fs.existsSync('.env') ? 'warning' : false,
  'Create .env file with VITE_API_URL',
  'Optional for local dev, required for production'
);

check(
  'Frontend src/main.tsx exists',
  fs.existsSync('src/main.tsx'),
  'Frontend source files missing'
);

check(
  'Frontend node_modules exists',
  fs.existsSync('node_modules'),
  'Run: npm install'
);

// Check 3: Required environment variables
console.log(`\n${colors.blue}🔑 Environment Variables:${colors.reset}\n`);

if (fs.existsSync('backend/.env')) {
  const backendEnv = fs.readFileSync('backend/.env', 'utf8');
  
  check(
    'GEMINI_API_KEY configured',
    backendEnv.includes('GEMINI_API_KEY=') && !backendEnv.includes('GEMINI_API_KEY=your-'),
    'Get from: https://aistudio.google.com/app/apikey'
  );
  
  check(
    'RESEND_API_KEY configured',
    backendEnv.includes('RESEND_API_KEY=') && !backendEnv.includes('RESEND_API_KEY=your-'),
    'Get from: https://resend.com/api-keys'
  );
  
  check(
    'JWT_SECRET configured',
    backendEnv.includes('JWT_SECRET=') && !backendEnv.includes('JWT_SECRET=super-secret-dev'),
    'Generate a random 32+ character string'
  );
  
  check(
    'DATABASE_URL configured',
    backendEnv.includes('DATABASE_URL='),
    'Set to your production database URL'
  );
}

// Check 4: Build configuration
console.log(`\n${colors.blue}⚙️  Build Configuration:${colors.reset}\n`);

check(
  'Dockerfile exists',
  fs.existsSync('Dockerfile'),
  'Frontend Dockerfile missing'
);

check(
  'Backend Dockerfile exists',
  fs.existsSync('backend/Dockerfile'),
  'Backend Dockerfile missing'
);

check(
  'docker-compose.yml exists',
  fs.existsSync('docker-compose.yml'),
  'Docker Compose file missing'
);

check(
  'vercel.json exists',
  fs.existsSync('vercel.json'),
  'Vercel config missing'
);

check(
  'render.yaml exists',
  fs.existsSync('render.yaml'),
  'Render config missing'
);

// Check 5: Git repository
console.log(`\n${colors.blue}📝 Git Repository:${colors.reset}\n`);

check(
  '.git directory exists',
  fs.existsSync('.git'),
  'Run: git init'
);

check(
  '.gitignore exists',
  fs.existsSync('.gitignore'),
  'Create .gitignore file'
);

if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  check(
    '.env files ignored',
    gitignore.includes('.env'),
    'Add .env to .gitignore'
  );
  
  check(
    'node_modules ignored',
    gitignore.includes('node_modules'),
    'Add node_modules to .gitignore'
  );
}

// Check 6: Documentation
console.log(`\n${colors.blue}📚 Documentation:${colors.reset}\n`);

check(
  'README.md exists',
  fs.existsSync('README.md'),
  'Create README.md'
);

check(
  'DEPLOY_NOW.md exists',
  fs.existsSync('DEPLOY_NOW.md'),
  'Deployment guide missing'
);

check(
  'FREE_API_SETUP_GUIDE.md exists',
  fs.existsSync('FREE_API_SETUP_GUIDE.md'),
  'API setup guide missing'
);

// Summary
console.log('\n' + '='.repeat(60));
console.log(`${colors.cyan}📊 Summary:${colors.reset}\n`);

console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
if (warnings > 0) {
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
}
if (errors > 0) {
  console.log(`${colors.red}❌ Errors: ${errors}${colors.reset}`);
}

console.log('\n' + '='.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log(`${colors.green}🎉 Perfect! Ready to deploy!${colors.reset}\n`);
  console.log('Next steps:');
  console.log('  1. Push to GitHub: git push origin main');
  console.log('  2. Follow DEPLOY_NOW.md for deployment');
  console.log('  3. Deploy to Vercel + Render (FREE)\n');
} else if (errors === 0) {
  console.log(`${colors.green}✅ Ready to deploy!${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Some optional items need attention${colors.reset}\n`);
  console.log('You can deploy now, but consider fixing warnings.\n');
} else {
  console.log(`${colors.red}❌ Not ready to deploy yet${colors.reset}\n`);
  console.log('Please fix the errors above before deploying.\n');
  console.log('Need help? Check:');
  console.log('  - DEPLOY_NOW.md - Deployment guide');
  console.log('  - FREE_API_SETUP_GUIDE.md - API setup');
  console.log('  - QUICK_REFERENCE.md - Quick commands\n');
}

process.exit(errors > 0 ? 1 : 0);
