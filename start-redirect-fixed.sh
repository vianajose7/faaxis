#!/bin/bash

# Dashboard Redirect Fix Script
echo "Starting FA Axis with Fixed Dashboard Redirect and Page Loading..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Build for production if needed
if [ ! -d "dist/public" ]; then
  echo "Building project for production..."
  npm run build
fi

# Start the server with the fixed configuration
NODE_ENV=production node dashboard-redirect-fix.cjs