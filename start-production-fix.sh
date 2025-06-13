#!/bin/bash
# Start the production fix server
echo "Starting FA Axis production server with enhanced authentication fixes..."
NODE_ENV=production node production-fix.cjs