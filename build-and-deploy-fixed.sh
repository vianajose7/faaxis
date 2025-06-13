#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Build client (React application)
echo "▶️  Building client..."
npx vite build

# Build server (TypeScript to JavaScript)
echo "▶️  Building server..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=dist/index.js \
  --packages=external

# Copy production server files
echo "▶️  Setting up production server..."

# Make sure dist/server directory exists
mkdir -p dist/server

# Copy any important server files needed at runtime
cp -r server/email-templates dist/server/ 2>/dev/null || :

echo "✅ Build completed successfully!"
echo "📁 Client files: dist/public/"
echo "📁 Server files: dist/index.js"
echo 
echo "🚀 To run in production:"
echo "   node simple-production-server.js"