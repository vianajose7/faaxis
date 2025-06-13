#!/bin/bash

# Colors for prettier output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting the Direct Login Fix Server...${NC}"

# Kill any running Node processes
echo -e "${BLUE}Stopping any running Node processes...${NC}"
pkill -9 node || true
sleep 2

# Start the direct login fix server
echo -e "${GREEN}Starting login fix server...${NC}"
node direct-login-fix.cjs