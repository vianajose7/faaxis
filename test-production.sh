#!/bin/bash
# Script to test the production server setup

echo "🔍 Testing production server deployment..."

# 1. Build the application
echo ""
echo "📦 Step 1: Building application..."
./build-and-deploy.sh

# 2. Start the production server in the background
echo ""
echo "🚀 Step 2: Starting production server..."
node simple-production-server.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start (5 seconds)..."
sleep 5

# 3. Test the health endpoint
echo ""
echo "🏥 Step 3: Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$HEALTH_RESPONSE" == "200" ]; then
  echo "✅ Health endpoint: SUCCESS (200 OK)"
else
  echo "❌ Health endpoint: FAILED (got $HEALTH_RESPONSE)"
fi

# 4. Test the main page
echo ""
echo "🏠 Step 4: Testing main page..."
HOME_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$HOME_RESPONSE" == "200" ]; then
  echo "✅ Main page: SUCCESS (200 OK)"
else
  echo "❌ Main page: FAILED (got $HOME_RESPONSE)"
fi

# 5. Test API endpoint
echo ""
echo "🔌 Step 5: Testing API endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$API_RESPONSE" == "200" ]; then
  echo "✅ API endpoint: SUCCESS (200 OK)"
else
  echo "❌ API endpoint: FAILED (got $API_RESPONSE)"
fi

# Clean up - stop the server
echo ""
echo "🧹 Cleaning up - stopping server..."
kill $SERVER_PID

# Summary
echo ""
echo "📊 Test Summary:"
echo "Health Endpoint: $HEALTH_RESPONSE"
echo "Main Page: $HOME_RESPONSE"
echo "API Endpoint: $API_RESPONSE"

if [ "$HEALTH_RESPONSE" == "200" ] && [ "$HOME_RESPONSE" == "200" ]; then
  echo "✅ DEPLOYMENT READY! Use the following commands:"
  echo "   Build: npm ci && ./build-and-deploy.sh"
  echo "   Run:   node simple-production-server.js"
else
  echo "❌ DEPLOYMENT NOT READY. Please fix the issues above."
fi