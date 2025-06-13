#!/bin/bash

# Dashboard Auth Fix Server
echo "Starting FA Axis with dashboard auth fix..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node dashboard-auth-fix.cjs