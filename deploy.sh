#!/bin/bash
# Comprehensive deployment script for both client and server

# Exit on first error
set -e

echo "Starting deployment process..."

# Step 1: Clean install dependencies
echo "Installing dependencies..."
npm ci

# Step 2: Run our custom build script
echo "Building client and server..."
./build.sh

# Step 3: Verify production-deployment.js
echo "Verifying production-deployment.js..."
if ! grep -q "/health" production-deployment.js; then
  echo "Error: Health check endpoint missing in production-deployment.js"
  exit 1
fi

echo "Deployment preparation completed successfully!"
echo ""
echo "====================================================="
echo "To start the server, run: node production-deployment.js"
echo "Verify the following once deployed:"
echo "1. GET /health returns 200 OK"
echo "2. GET / loads your SPA (with assets under /assets/...)"
echo "3. GET /api/... endpoints return expected data"
echo "====================================================="