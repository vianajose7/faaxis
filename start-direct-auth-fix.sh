#!/bin/bash

# Direct Auth Fix Server
echo "Starting FA Axis with direct dashboard fix..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node direct-auth-fix.cjs