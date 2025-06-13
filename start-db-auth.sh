#!/bin/bash

# Start the Database-First Authentication Server
echo "Starting FA Axis production server with database-first authentication..."

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Start the server with environment variables
NODE_ENV=production node db-auth-server.cjs