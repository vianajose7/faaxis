#!/bin/bash

# Direct Fix Script for Dashboard, Calculator, and Marketplace
echo "Starting FA Axis with Direct Fix for Dashboard & Pages..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Build for production if needed
if [ ! -d "dist/public" ]; then
  echo "Building project for production..."
  npm run build
fi

# Make the script executable
chmod +x start-direct-fix.sh

# Start the server with debugging enabled
DEBUG=true NODE_ENV=production node direct-fix.cjs