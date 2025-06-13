#!/bin/bash

# Deployment checker script
echo "=== DEPLOYMENT FIX CHECKER ==="
echo "This script will check your deployment setup and provide recommendations."

# Check package.json scripts
echo -e "\n== Checking package.json scripts =="
if grep -q "\"start\":" package.json; then
  echo "✅ START SCRIPT: Found 'start' script in package.json"
  grep "\"start\":" package.json
else
  echo "❌ START SCRIPT: Missing 'start' script in package.json"
  echo "RECOMMENDATION: Add a 'start' script that runs compiled JavaScript, not TypeScript"
  echo "Example: \"start\": \"node dist/server/index.js\""
fi

if grep -q "\"build\":" package.json; then
  echo "✅ BUILD SCRIPT: Found 'build' script in package.json"
  grep "\"build\":" package.json
else
  echo "❌ BUILD SCRIPT: Missing 'build' script in package.json"
  echo "RECOMMENDATION: Add a 'build' script that builds both client and server"
  echo "Example: \"build\": \"npm run build:server && npm run build:client\""
fi

# Check dist directories
echo -e "\n== Checking dist directories =="
if [ -d "dist/server" ]; then
  echo "✅ SERVER BUILD: Found dist/server directory"
else
  echo "❌ SERVER BUILD: Missing dist/server directory"
  echo "RECOMMENDATION: Make sure your build script properly compiles server code to dist/server"
fi

if [ -d "dist/public" ]; then
  echo "✅ CLIENT BUILD: Found dist/public directory"
else
  if [ -d "client/dist" ]; then
    echo "⚠️ CLIENT BUILD: Found client/dist but not dist/public"
    echo "RECOMMENDATION: Update your Vite config to output to dist/public or update your server to use client/dist"
  else
    echo "❌ CLIENT BUILD: Missing client build directory"
    echo "RECOMMENDATION: Make sure your build script properly builds client code"
  fi
fi

# Check SPA catchall
echo -e "\n== Checking SPA catchall =="
if grep -q "app.get('\\*'" server/spa-catchall.ts; then
  echo "✅ SPA CATCHALL: Found catchall route in spa-catchall.ts"
else
  echo "❌ SPA CATCHALL: Missing catchall route in spa-catchall.ts"
  echo "RECOMMENDATION: Add 'app.get('*', ...)' route in spa-catchall.ts"
fi

if grep -q "index.html" server/spa-catchall.ts; then
  echo "✅ INDEX PATH: Found index.html path in spa-catchall.ts"
else
  echo "❌ INDEX PATH: Missing index.html path in spa-catchall.ts"
  echo "RECOMMENDATION: Make sure spa-catchall.ts serves index.html for client routes"
fi

# Check vite.config.ts
echo -e "\n== Checking Vite config =="
if grep -q "outDir.*dist/public" vite.config.ts; then
  echo "✅ VITE CONFIG: Vite is configured to output to dist/public"
else
  echo "⚠️ VITE CONFIG: Vite might not be configured for dist/public"
  echo "RECOMMENDATION: Check that build output matches what your server is expecting"
fi

# Check for tsx in production
echo -e "\n== Checking for tsx usage in production =="
if grep -q "tsx.*server" package.json | grep -q "\"start\""; then
  echo "❌ TSX IN PRODUCTION: Found tsx in start script"
  echo "RECOMMENDATION: Don't use tsx in production. Use compiled JavaScript."
else
  echo "✅ TSX USAGE: No tsx in start script"
fi

# Final recommendations
echo -e "\n== FINAL RECOMMENDATIONS =="
echo "1. Make sure your SPA catch-all serves index.html from the same location as your Vite build output"
echo "2. Update package.json scripts to follow the pattern in PACKAGE_UPDATE_INSTRUCTIONS.md"
echo "3. For deployment, use these commands:"
echo "   - Build: npm ci && npm run build"
echo "   - Run: npm run start"
echo ""
echo "See COMPLETE_SOLUTION.md for more detailed instructions."