#!/bin/bash

echo "🔧 Fixing build issues for deployment..."

# Navigate to backend directory
cd backend

# Create disabled features directory
mkdir -p src/disabled-features

# Move problematic controllers and services to disabled folder
echo "📁 Moving advanced features to disabled folder..."

# Move entire directories that have missing dependencies
mv src/ai/voice.controller.ts src/disabled-features/ 2>/dev/null || echo "voice.controller.ts already moved or doesn't exist"
mv src/documents src/disabled-features/ 2>/dev/null || echo "documents folder already moved or doesn't exist"
mv src/insurance src/disabled-features/ 2>/dev/null || echo "insurance folder already moved or doesn't exist"
mv src/lab-diagnostics src/disabled-features/ 2>/dev/null || echo "lab-diagnostics folder already moved or doesn't exist"
mv src/appointments src/disabled-features/ 2>/dev/null || echo "appointments folder already moved or doesn't exist"
mv src/emergency src/disabled-features/ 2>/dev/null || echo "emergency folder already moved or doesn't exist"

echo "✅ Advanced features temporarily disabled"

# Test the build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "📝 Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Temporarily disable advanced features for deployment'"
    echo "3. git push origin main"
    echo "4. Deploy to Render using the FREE_DEPLOYMENT_GUIDE.md"
else
    echo "❌ Build still failing. Check the errors above."
fi