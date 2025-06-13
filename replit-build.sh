#!/bin/bash

# Replit Production Build Script
# This script ensures the client/dist directory is properly populated

echo "🧹 Cleaning client/dist directory..."
rm -rf client/dist/*

echo "🔨 Running Vite build..."
npm run build

# Check if build was successful
if [ ! -d "client/dist/assets" ]; then
  echo "❌ ERROR: Build failed - no assets directory created!"
  echo "Trying alternative build method..."
  
  # Force a direct Vite build
  echo "🛠️ Running direct vite build command..."
  npx vite build --emptyOutDir
  
  # Check again
  if [ ! -d "client/dist/assets" ]; then
    echo "❌ ERROR: Both build methods failed! Check vite configuration."
    exit 1
  fi
fi

echo "✅ Build successful! Assets created in client/dist:"
ls -la client/dist

echo "📦 Creating server bundle..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "🔍 Verifying built files..."
echo "Client assets:"
find client/dist -type f | grep -v "\.html$" | head -n 5
echo "Server bundle:"
ls -la dist/

echo "✨ Build completed successfully!"