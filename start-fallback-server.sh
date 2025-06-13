#!/bin/bash
# Start the fallback-enabled production server
echo "Starting FA Axis production server with authentication fallbacks..."
NODE_ENV=production node fallback-enabled-server.cjs