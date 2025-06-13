#!/bin/bash

# Start the Standalone Calculator Server
echo "Starting Standalone Calculator Server..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node standalone-calculator-server.cjs