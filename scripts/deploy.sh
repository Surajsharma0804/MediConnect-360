#!/bin/bash

# MediConnect 360 - Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please run setup.sh first."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=(
    "VITE_GOOGLE_CLIENT_ID"
    "GEMINI_API_KEY"
    "RESEND_API_KEY"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your-"* ]]; then
        print_error "Required environment variable $var is not set or still has placeholder value"
        exit 1
    fi
done

print_status "🚀 Starting production deployment..."

# Build and test
print_status "Running tests..."
npm run test:ci
cd backend && npm test && cd ..

# Build production images
print_status "Building production Docker images..."
docker-compose -f docker-compose.prod.yml build

# Deploy to production
print_status "Deploying to production..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
fi

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
fi

# Show deployment status
print_success "🎉 Production deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Access URLs:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:5000"
echo "   - Health Check: http://localhost/health"
echo ""
echo "📋 Management Commands:"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   - Restart: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔒 Security:"
echo "   - All services are running with non-root users"
echo "   - Database passwords are auto-generated"
echo "   - SSL certificates should be configured for production"