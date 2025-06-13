#!/bin/bash

# Auth Context Fix Script
echo "Starting FA Axis with Complete Auth Context Fix..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Build for production if needed
if [ ! -d "dist/public" ]; then
  echo "Building project for production..."
  npm run build
fi

# Make the script executable
chmod +x start-auth-context-fix.sh

# Start the server with the fixed configuration
NODE_ENV=production node dashboard-auth-fix.cjs