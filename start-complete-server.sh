#!/bin/bash
# Start the complete production server with auth fixes
echo "Starting FA Axis production server with authentication support..."
NODE_ENV=production node complete-production-server.cjs