#!/bin/bash

# Stop any running development server first
echo "Checking for running servers..."
pid=$(lsof -i:5000 -t)
if [ ! -z "$pid" ]; then
  echo "Stopping development server on port 5000 (PID: $pid)..."
  kill -9 $pid
  sleep 1
fi

# Build the application if needed
if [ ! -d "./dist/public" ]; then
  echo "Building application..."
  npm run build
else
  echo "Build directory exists, skipping build step"
fi

# Run the production server
echo "Starting production server..."
node replit-deployment-server.js