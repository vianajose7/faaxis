#!/bin/bash

echo "Building server with TypeScript..."
npx tsc -p tsconfig.build.json

echo "Verifying built files..."
if [ -f "dist/server/index.js" ]; then
  echo "✅ Server built successfully"
else
  echo "❌ Server build failed - dist/server/index.js not found!"
  exit 1
fi

echo "Creating production start script..."
cat > dist/start.js << 'EOF'
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = 'production';

// Import and run the server
import('./server/index.js');
EOF

echo "✅ Production build complete"