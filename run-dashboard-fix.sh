#!/bin/bash

# Dashboard Fix Runner
echo "Starting FA Axis with working dashboard fix..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Start the server with environment variables
NODE_ENV=production node working-dashboard-fix.cjs