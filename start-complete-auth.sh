#!/bin/bash

# Complete Authentication Solution
echo "Starting FA Axis with complete authentication solution..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node complete-auth-solution.cjs