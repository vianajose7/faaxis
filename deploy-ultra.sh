#!/bin/bash

# Ultra deployment script for guaranteed fix
set -e  # Exit on any error

echo "🔄 Starting ultra deployment process..."

# 1. Make sure we have the right build settings
echo "✅ Checking package.json scripts..."
if ! grep -q "\"build\": \"vite build\"" package.json; then
  echo "⚠️ Warning: build script might not be correctly configured in package.json"
  echo "   Please ensure it contains: \"build\": \"vite build && tsc --project tsconfig.build.json\""
else
  echo "✅ Build script looks good!"
fi

# 2. Run the build
echo "🛠️ Building the application..."
npm run build

# 3. Verify client/dist directory exists and has content
echo "🔍 Verifying client/dist directory..."
if [ ! -d "client/dist" ]; then
  echo "❌ Error: client/dist directory does not exist after build!"
  exit 1
fi

if [ ! -f "client/dist/index.html" ]; then
  echo "❌ Error: client/dist/index.html not found!"
  exit 1
fi

echo "✅ Found client/dist with index.html!"

# 4. Test the production server
echo "🌐 Testing the production server..."
echo "   (Press Ctrl+C after you verify it's working)"
node production-server.js

echo "🚀 Deployment preparation complete!"
echo ""
echo "To deploy to Replit:"
echo "1. Go to the Deployments tab"
echo "2. Set Build command to: npm ci && npm run build"
echo "3. Set Run command to: node production-server.js"
echo "4. Click 'Deploy'"
echo ""
echo "After deployment, remember to:"
echo "- Hard refresh your browser (Ctrl+Shift+R)"
echo "- Check all routes are working"