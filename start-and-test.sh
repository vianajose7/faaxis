#!/bin/bash

# Start the server and test authentication functionality
echo "Starting FA Axis server and testing authentication..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the resilient server
NODE_ENV=production node resilient-auth.cjs &
SERVER_PID=$!

# Wait for server to start
echo "Server starting with PID: $SERVER_PID"
sleep 3

# Now test registration with curl
echo ""
echo "Testing registration endpoint..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}' \
  http://localhost:3000/register

echo ""
echo ""
echo "Testing login endpoint..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123"}' \
  http://localhost:3000/login

echo ""
echo ""
echo "Testing user info endpoint..."
curl -v http://localhost:3000/api/me

# Keep server running
echo ""
echo "Server is running. Press CTRL+C to stop."
wait $SERVER_PID