#!/bin/bash

echo "🚀 Starting Gabber Client Core v2 Demo..."
echo "📝 Demo URL: http://localhost:3001"
echo "🔧 Proxy Server URL: http://localhost:3002"
echo ""

# Build the client-core package
cd ../packages/client-core
echo "📦 Building client-core SDK..."
npx tsup

# Copy the built file to demo directory
echo "📝 Copying client-core SDK to demo directory..."
cp dist/index.mjs ../../demo/gabber-client-core.mjs

# Install proxy server dependencies
cd ../../demo/proxy-server
echo "📦 Installing proxy server dependencies..."
npm install

# Check if .env exists, if not create a basic one
if [ ! -f .env ]; then
    echo "⚙️  Creating basic .env file..."
    cat > .env << EOF
GABBER_API_KEY=your_api_key_here
GABBER_API_URL=http://localhost:4000
PORT=3002
EOF
    echo "⚠️  Please edit .env with your actual API key before continuing"
    echo "⚠️  You can find your API key in your Gabber dashboard"
    exit 1
fi

# Update the port in the proxy server environment if not already set
if ! grep -q "^PORT=" .env; then
    echo "PORT=3002" >> .env
fi

# Start proxy server in background
echo "🔧 Starting proxy server..."
npm run dev &
PROXY_PID=$!

# Go back to demo directory and start demo server
cd ..
echo "🌐 Starting demo server..."
python3 -m http.server 3001 &
DEMO_PID=$!

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $PROXY_PID
    kill $DEMO_PID
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "✨ All servers started!"
echo "📝 Demo UI: http://localhost:3001"
echo "🔧 Proxy Server: http://localhost:3002"
echo "Press Ctrl+C to stop all servers"

# Wait for both background processes
wait
