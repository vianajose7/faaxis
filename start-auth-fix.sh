#!/bin/bash

# Colors for prettier output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting the Financial Advisor Axis with fixed authentication...${NC}"

# Kill any running Node processes
echo -e "${BLUE}Stopping any running Node processes...${NC}"
pkill -9 node || true
sleep 2

# Check if we should run in development or production mode
if [ "$NODE_ENV" == "production" ]; then
  echo -e "${GREEN}Starting authentication fix server in production mode...${NC}"
  NODE_ENV=production node auth-fix.cjs
else
  echo -e "${GREEN}Starting authentication fix server in development mode...${NC}"
  # Use our enhanced runner that starts both auth fix and vite
  node run-auth-fix.js
fi