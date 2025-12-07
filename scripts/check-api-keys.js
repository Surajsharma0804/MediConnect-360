#!/usr/bin/env node

/**
 * MediConnect 360 - API Key Checker
 * Checks which FREE API keys are configured and guides you to get missing ones
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// API key configurations
const apiKeys = {
  backend: [
    {
      name: 'Google Gemini AI',
      key: 'GEMINI_API_KEY',
      required: true,
      free: true,
      url: 'https://aistudio.google.com/app/apikey',
      description: 'AI features (symptom checker, chat, drug interactions)',
      freeLimit: '60 requests/minute',
    },
    {
      name: 'Resend Email',
      key: 'RESEND_API_KEY',
      required: true,
      free: true,
      url: 'https://resend.com/api-keys',
      description: 'Email verification, password reset, notifications',
      freeLimit: '3,000 emails/month',
    },
    {
      name: 'Google OAuth',
      key: 'GOOGLE_CLIENT_ID',
      required: false,
      free: true,
      url: 'https://console.cloud.google.com/apis/credentials',
      description: 'Sign in with Google',
      freeLimit: 'Unlimited',
    },
    {
      name: 'GitHub OAuth',
      key: 'GITHUB_CLIENT_ID',
      required: false,
      free: true,
      url: 'https://github.com/settings/developers',
      description: 'Sign in with GitHub',
      freeLimit: 'Unlimited',
    },
    {
      name: 'Stripe Test',
      key: 'STRIPE_SECRET_KEY',
      required: false,
      free: true,
      url: 'https://dashboard.stripe.com/test/apikeys',
      description: 'Payment processing (test mode)',
      freeLimit: 'Unlimited (test mode)',
    },
    {
      name: 'Sentry',
      key: 'SENTRY_DSN',
      required: false,
      free: true,
      url: 'https://sentry.io/signup/',
      description: 'Error tracking and monitoring',
      freeLimit: '5,000 errors/month',
    },
    {
      name: 'OpenWeatherMap',
      key: 'OPENWEATHER_API_KEY',
      required: false,
      free: true,
      url: 'https://home.openweathermap.org/users/sign_up',
      description: 'Weather-based health alerts',
      freeLimit: '1,000 calls/day',
    },
  ],
  frontend: [
    {
      name: 'Google Analytics',
      key: 'VITE_GA_MEASUREMENT_ID',
      required: false,
      free: true,
      url: 'https://analytics.google.com/',
      description: 'User behavior tracking',
      freeLimit: 'Unlimited',
    },
    {
      name: 'Firebase',
      key: 'VITE_FIREBASE_API_KEY',
      required: false,
      free: true,
      url: 'https://console.firebase.google.com/',
      description: 'Push notifications',
      freeLimit: '10M messages/month',
    },
  ],
};

// Read .env file
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    });
    
    return env;
  } catch (error) {
    return null;
  }
}

// Check if value is a placeholder
function isPlaceholder(value) {
  if (!value) return true;
  const placeholders = ['your-', 'paste-', 'get-from', 'test-key', 'sk_test_your', 'pk_test_your'];
  return placeholders.some(p => value.includes(p));
}

// Main check function
function checkApiKeys() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🔑 MediConnect 360 - API Key Status${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  // Check backend .env
  const backendEnvPath = path.join(process.cwd(), 'backend', '.env');
  const backendEnv = readEnvFile(backendEnvPath);

  if (!backendEnv) {
    console.log(`${colors.red}❌ Backend .env file not found!${colors.reset}`);
    console.log(`   Create it by copying: cp backend/.env backend/.env\n`);
    return;
  }

  console.log(`${colors.blue}📦 Backend API Keys:${colors.reset}\n`);

  let requiredMissing = 0;
  let optionalMissing = 0;

  apiKeys.backend.forEach(api => {
    const value = backendEnv[api.key];
    const configured = value && !isPlaceholder(value);

    if (configured) {
      console.log(`${colors.green}✅ ${api.name}${colors.reset}`);
      console.log(`   ${api.description}`);
      console.log(`   Free tier: ${api.freeLimit}\n`);
    } else {
      if (api.required) {
        console.log(`${colors.red}❌ ${api.name} (REQUIRED)${colors.reset}`);
        requiredMissing++;
      } else {
        console.log(`${colors.yellow}⚠️  ${api.name} (Optional)${colors.reset}`);
        optionalMissing++;
      }
      console.log(`   ${api.description}`);
      console.log(`   Free tier: ${api.freeLimit}`);
      console.log(`   Get it: ${colors.cyan}${api.url}${colors.reset}\n`);
    }
  });

  // Check frontend .env
  const frontendEnvPath = path.join(process.cwd(), '.env');
  const frontendEnv = readEnvFile(frontendEnvPath);

  if (frontendEnv) {
    console.log(`${colors.blue}🎨 Frontend API Keys:${colors.reset}\n`);

    apiKeys.frontend.forEach(api => {
      const value = frontendEnv[api.key];
      const configured = value && !isPlaceholder(value);

      if (configured) {
        console.log(`${colors.green}✅ ${api.name}${colors.reset}`);
        console.log(`   ${api.description}`);
        console.log(`   Free tier: ${api.freeLimit}\n`);
      } else {
        console.log(`${colors.yellow}⚠️  ${api.name} (Optional)${colors.reset}`);
        console.log(`   ${api.description}`);
        console.log(`   Free tier: ${api.freeLimit}`);
        console.log(`   Get it: ${colors.cyan}${api.url}${colors.reset}\n`);
        optionalMissing++;
      }
    });
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`${colors.cyan}📊 Summary:${colors.reset}\n`);

  if (requiredMissing === 0) {
    console.log(`${colors.green}✅ All required API keys are configured!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ${requiredMissing} required API key(s) missing${colors.reset}`);
  }

  if (optionalMissing > 0) {
    console.log(`${colors.yellow}⚠️  ${optionalMissing} optional API key(s) not configured${colors.reset}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}💰 Total Cost: $0/month${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  if (requiredMissing === 0 && optionalMissing === 0) {
    console.log(`${colors.green}🎉 Perfect! All API keys configured!${colors.reset}`);
    console.log(`${colors.green}   You're ready to start development!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. cd backend && npm run start:dev');
    console.log('  2. npm run dev (in a new terminal)\n');
  } else if (requiredMissing === 0) {
    console.log(`${colors.green}✅ You can start development now!${colors.reset}`);
    console.log(`${colors.yellow}   Optional features will be disabled until you add their API keys.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}⚠️  Please configure required API keys before starting.${colors.reset}`);
    console.log(`${colors.cyan}   See: FREE_API_SETUP_GUIDE.md for detailed instructions${colors.reset}\n`);
  }

  console.log(`${colors.cyan}📚 Documentation:${colors.reset}`);
  console.log('   - FREE_API_SETUP_GUIDE.md - Step-by-step setup');
  console.log('   - QUICK_REFERENCE.md - Quick commands');
  console.log('   - README.md - Project overview\n');
}

// Run the check
checkApiKeys();
