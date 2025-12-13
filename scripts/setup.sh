#!/bin/bash

# MediConnect 360 - Complete Setup Script
set -e

echo "🚀 Setting up MediConnect 360..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p backups
mkdir -p backend/uploads
mkdir -p ssl

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.production .env
    print_warning "Please edit .env file with your actual values before running the application!"
fi

# Generate secrets if not provided
print_status "Generating secure secrets..."

# Generate JWT secrets
if ! grep -q "your-super-secret" .env; then
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    
    sed -i "s/your-super-secret-jwt-key-min-32-chars/$JWT_SECRET/g" .env
    sed -i "s/your-super-secret-refresh-key-min-32-chars/$JWT_REFRESH_SECRET/g" .env
    sed -i "s/your-32-character-encryption-key!!/$ENCRYPTION_KEY/g" .env
    
    print_success "Generated secure JWT and encryption keys"
fi

# Generate database passwords
if grep -q "your-secure-postgres-password" .env; then
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    REDIS_PASSWORD=$(openssl rand -base64 16)
    
    sed -i "s/your-secure-postgres-password/$POSTGRES_PASSWORD/g" .env
    sed -i "s/your-secure-redis-password/$REDIS_PASSWORD/g" .env
    
    print_success "Generated secure database passwords"
fi

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

print_status "Installing backend dependencies..."
cd backend && npm install && cd ..

# Build Docker images
print_status "Building Docker images..."
docker-compose build

print_success "Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your API keys:"
echo "   - VITE_GOOGLE_CLIENT_ID"
echo "   - GEMINI_API_KEY"
echo "   - RESEND_API_KEY"
echo "   - STRIPE keys"
echo ""
echo "2. Start the application:"
echo "   docker-compose up -d"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost"
echo "   - Backend: http://localhost:5000"
echo "   - Database: localhost:5432"
echo ""
echo "4. For production deployment, see DEPLOYMENT_GUIDE.md"