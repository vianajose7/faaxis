#!/usr/bin/env bash
set -euo pipefail

echo "🔨 Building React client..."
npx vite build

echo "📦 Bundling server with esbuild..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --external:pg-native \
  --outdir=dist/server

echo "✅ Build complete! Artifacts in dist/{public,server}"