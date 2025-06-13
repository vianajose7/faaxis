#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting unified build process..."

# Clean dist directory if it exists
if [ -d "dist" ]; then
  echo "🧹 Cleaning dist directory..."
  rm -rf dist
fi

# Create dist directory
mkdir -p dist

# Build client with Vite
echo "📦 Building client application with Vite..."
npm run build:client

# Build server with esbuild
echo "📦 Building server with esbuild..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --external:pg-native \
  --outdir=dist/server

# Copy necessary files
echo "📋 Copying necessary configuration files..."
cp package.json dist/
cp unified-production-server.js dist/server.js

echo "✅ Build completed successfully!"
echo "📝 To start the server in production, run:"
echo "   cd dist && npm ci --production && node server.js"