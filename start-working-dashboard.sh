#!/bin/bash

# Working Dashboard Fix
echo "Starting FA Axis with working dashboard fix..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node working-dashboard-fix.cjs