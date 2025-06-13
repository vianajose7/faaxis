#!/bin/bash

# Final Dashboard Fix
echo "Starting FA Axis with final dashboard fix..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Start the server with environment variables
NODE_ENV=production node final-dashboard-fix.cjs