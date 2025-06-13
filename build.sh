#!/bin/bash
# Comprehensive build script for both client and server

# Ensure we're in production mode
export NODE_ENV=production

echo "Starting build process..."

# Step 1: Build the client
echo "Building client into dist/public..."
cd client && npx vite build --outDir ../dist/public
if [ $? -ne 0 ]; then
  echo "Client build failed!"
  exit 1
fi
echo "Client build successful!"
cd ..

# Step 2: Build the server 
echo "Building server into dist..."
npx tsc --project server/tsconfig.json --outDir dist
if [ $? -ne 0 ]; then
  echo "Server build failed!"
  exit 1
fi
echo "Server build successful!"

# Step 3: Ensure health check endpoint is working
echo "Ensuring production-deployment.js is correctly set up..."
if ! grep -q "'/health'" production-deployment.js; then
  echo "Warning: Health check endpoint might be missing in production-deployment.js"
fi

echo "Build process completed successfully!"
echo "To run: node production-deployment.js"