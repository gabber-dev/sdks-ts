#!/bin/bash

# Gabber Workflow SDK v2 - React Demo Server
# This script starts both the proxy server and React demo development server

set -e

echo "🎤📹 Starting Gabber Workflow SDK v2 React Demo..."
echo "📝 Demo URL: http://localhost:3001"
echo "🔧 Proxy Server URL: http://localhost:3003"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

# Navigate to the React demo directory
REACT_DEMO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REACT_DEMO_DIR"

echo "📍 React demo directory: $(pwd)"
echo ""

# Check if React demo node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React demo dependencies..."
    npm install
    echo ""
fi

# Check if React demo dependencies are up to date
if [ "package.json" -nt "node_modules/.package-lock.json" ] 2>/dev/null; then
    echo "📦 Updating React demo dependencies..."
    npm install
    echo ""
fi

# Install and setup proxy server
cd ../proxy-server
echo "📦 Installing proxy server dependencies..."
npm install

# Check if .env exists, if not create a basic one
if [ ! -f .env ]; then
    echo "⚙️  Creating basic .env file..."
    cat > .env << EOF
GABBER_API_KEY=your_api_key_here
GABBER_API_URL=http://localhost:4000
PORT=3003
EOF
    echo "⚠️  Please edit .env with your actual API key before continuing"
    echo "⚠️  You can find your API key in your Gabber dashboard"
    exit 1
fi

# Ensure the port is set to 3003 in the proxy server environment
if grep -q "^PORT=" .env; then
    # Replace existing PORT line
    sed -i 's/^PORT=.*/PORT=3003/' .env
else
    # Add PORT line if it doesn't exist
    echo "PORT=3003" >> .env
fi

# Start proxy server in background
echo "🔧 Starting proxy server..."
npm run dev &
PROXY_PID=$!

# Go back to React demo directory and start React dev server
cd "$REACT_DEMO_DIR"
echo "🚀 Starting React development server..."

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$PROXY_PID" ]; then
        kill $PROXY_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

echo "✨ All servers started!"
echo "📝 React Demo: http://localhost:3001"
echo "🔧 Proxy Server: http://localhost:3003"
echo ""
echo "🔧 To stop all servers, press Ctrl+C"
echo ""

# Start the React development server (this will block)
npm run dev