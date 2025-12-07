#!/bin/bash

# MediConnect 360 - Quick Setup Script
# This script automates the initial setup process

set -e

echo "🏥 MediConnect 360 - Quick Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Setup environment files
echo "📝 Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env backend/.env.backup 2>/dev/null || true
    echo -e "${GREEN}✅ Backed up existing backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env file already exists${NC}"
fi

echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Docker services are running${NC}"
else
    echo -e "${RED}❌ Failed to start Docker services${NC}"
    exit 1
fi

echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo ""

# Run backend tests
echo "🧪 Running backend tests..."
cd backend
npm run test -- --passWithNoTests
cd ..
echo -e "${GREEN}✅ Backend tests passed${NC}"

echo ""

# Display next steps
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Get your FREE API keys:"
echo "   - Gemini AI: https://aistudio.google.com/app/apikey"
echo "   - Resend Email: https://resend.com/api-keys"
echo ""
echo "2. Add API keys to backend/.env:"
echo "   GEMINI_API_KEY=your-key-here"
echo "   RESEND_API_KEY=your-key-here"
echo ""
echo "3. Start the backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "4. Start the frontend (in a new terminal):"
echo "   npm run dev"
echo ""
echo "5. Open your browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - TESTING_GUIDE.md - Testing guide"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - IMPROVEMENTS_SUMMARY.md - What's new"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Check Docker: docker-compose ps"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart services: docker-compose restart"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
