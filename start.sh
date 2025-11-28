#!/bin/bash

# ServerMonitor Development Startup Script
# This script checks dependencies and starts both client and server

set -e

echo "🚀 Starting ServerMonitor v2.0 Development Environment (Angular 21 + TypeScript 5.5)..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

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

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
print_success "Node.js version: $NODE_VERSION"

# Check and install client dependencies
print_status "Checking client dependencies..."
if [ ! -d "Client/node_modules" ] || [ ! -f "Client/package-lock.json" ]; then
    print_warning "Client dependencies not found or outdated. Installing..."
    cd Client
    npm install
    if [ $? -eq 0 ]; then
        print_success "Client dependencies installed successfully"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
    cd ..
else
    print_success "Client dependencies are up to date"
fi

# Check and install server dependencies
print_status "Checking server dependencies..."
if [ ! -d "Server/node_modules" ] || [ ! -f "Server/package-lock.json" ]; then
    print_warning "Server dependencies not found or outdated. Installing..."
    cd Server
    npm install
    if [ $? -eq 0 ]; then
        print_success "Server dependencies installed successfully"
    else
        print_error "Failed to install server dependencies"
        exit 1
    fi
    cd ..
else
    print_success "Server dependencies are up to date"
fi

# Build TypeScript server
print_status "Building TypeScript server..."
cd Server
npm run build
if [ $? -eq 0 ]; then
    print_success "TypeScript server built successfully"
else
    print_error "Failed to build TypeScript server"
    exit 1
fi
cd ..

# Check if ports are available and kill if in use
print_status "Checking port availability..."

if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 4200 is already in use. Killing existing process..."
    lsof -ti:4200 | xargs kill -9 2>/dev/null || true
    sleep 2
    if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Failed to kill process on port 4200. Please kill manually."
        exit 1
    else
        print_success "Successfully killed process on port 4200"
    fi
fi

if lsof -Pi :9500 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 9500 is already in use. Killing existing process..."
    lsof -ti:9500 | xargs kill -9 2>/dev/null || true
    sleep 2
    if lsof -Pi :9500 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Failed to kill process on port 9500. Please kill manually."
        exit 1
    else
        print_success "Successfully killed process on port 9500"
    fi
fi

print_success "Ports 4200 and 9500 are now available"

# Start services
print_status "Starting development servers..."
echo "================================================"
echo ""
echo -e "${GREEN}Client will be available at: http://localhost:4200${NC}"
echo -e "${GREEN}Server will be available at: http://localhost:9500${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Function to cleanup background processes
cleanup() {
    echo ""
    print_status "Shutting down servers..."
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null
    fi
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    print_success "All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start server in background
cd Server
npm run dev &
SERVER_PID=$!
print_success "Server started (PID: $SERVER_PID)"
cd ..

# Start client in background
cd Client
npm start &
CLIENT_PID=$!
print_success "Client started (PID: $CLIENT_PID)"
cd ..

# Wait for both processes
wait $SERVER_PID $CLIENT_PID