#!/bin/bash

# Site Fixer Script
echo "Starting FA Axis Site Fixer..."

# Kill any running Node processes
pkill -9 node 2>/dev/null || true
sleep 1

# Make the script executable
chmod +x start-site-fixer.sh

# Start the server
NODE_ENV=production node site-fixer.js