#!/bin/bash

echo "🚀 ULTIMATE DEPLOYMENT FIX 🚀"
echo "Following the exact steps from Replit's recommendation"

# Step 1: Clean any old builds
echo "Step 1: Cleaning old builds..."
rm -rf dist

# Step 2: Clean install dependencies
echo "Step 2: Clean installing dependencies..."
npm ci

# Step 3: Build the frontend with Vite
echo "Step 3: Building frontend with Vite..."
npm run build

# Step 4: Build the server with TypeScript
echo "Step 4: Building server with TypeScript..."
npx tsc --project tsconfig.json --outDir dist --module esnext --moduleResolution node --esModuleInterop true

# Step 5: Verify the build worked
echo "Step 5: Verifying build..."
if [ ! -f "dist/server/index.js" ]; then
  echo "❌ Build failed - server file not found"
  echo "Falling back to static server..."
  node static.js
  exit 1
fi

if [ ! -d "dist/public" ]; then
  echo "❌ Build failed - public directory not found"
  echo "Falling back to static server..."
  node static.js
  exit 1
fi

# Step 6: Start the application
echo "Step 6: Starting the application..."
NODE_ENV=production node dist/server/index.js