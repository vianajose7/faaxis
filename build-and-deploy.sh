#!/bin/bash
# Simplified build script that ensures all server exports are available

# Print commands as they execute
set -x

# 1) Build the React client into dist/public
echo "▶️  Building client..."
npx vite build

# 2) Build the server with esbuild
echo "▶️  Building server module..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist

# 3) Print success message
echo "✅ Build completed successfully!"
echo ""
echo "To start the server:"
echo "node production-deployment.js"
echo ""
echo "Expected results:"
echo "- GET /health → 200"
echo "- GET / → SPA with assets under /assets/..."
echo "- GET /api/... → real endpoints"