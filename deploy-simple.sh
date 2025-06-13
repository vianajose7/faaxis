
#!/bin/bash

# Simple deployment script
echo "Starting simplified deployment..."

# Build the client
echo "Building client..."
npm run build

# Create necessary directories
echo "Setting up directories..."
mkdir -p server/public
mkdir -p dist/client

# Copy built files
echo "Copying built files..."
cp -r client/dist/* server/public/
cp -r client/dist/* dist/client/

echo "Deployment complete!"
