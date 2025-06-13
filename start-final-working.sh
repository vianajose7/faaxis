#!/bin/bash

# Final Working Fix Script
echo "Starting FA Axis with FINAL WORKING FIX..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Build for production if needed
if [ ! -d "dist/public" ]; then
  echo "Building project for production..."
  npm run build
fi

# Make the script executable
chmod +x start-final-working.sh

# Start the server with debugging enabled
NODE_ENV=production node final-working-fix.js