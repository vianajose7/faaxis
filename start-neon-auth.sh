#!/bin/bash

# Colors for prettier output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting the Financial Advisor Axis server with Neon database authentication...${NC}"

# Kill any running Node processes
pkill -9 node || true
sleep 2

# Set environment variable for production mode
export NODE_ENV=production

# Run the Neon-compatible authentication server
node neon-compatible-auth.cjs

# Exit with the same status as the Node process
exit $?