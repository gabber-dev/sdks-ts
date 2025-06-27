#!/bin/bash

echo "🚀 Starting Gabber Workflow SDK Demo..."
echo "📝 Demo URL: http://localhost:8081"
echo "🔧 Make sure to build the SDK first with: npm run build"
echo ""

# Build the SDK first
echo "Building SDK..."
cd ..
npm run build
cp packages/core/dist/index.mjs demo/gabber-workflow-core.js

# Start the demo server
echo "Starting demo server..."
cd demo
python3 -m http.server 3001
