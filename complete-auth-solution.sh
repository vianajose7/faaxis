#!/bin/bash

# Colors for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Financial Advisor Axis - Complete Authentication Solution${NC}"
echo -e "${BLUE}===================================================${NC}"

# Kill any running Node processes
echo -e "${BLUE}Stopping any running Node processes...${NC}"
pkill -9 node || true
sleep 2

# Start our authentication fix in the background
echo -e "${GREEN}Starting Authentication Fix Server...${NC}"
node direct-login-fix.cjs &
AUTH_PID=$!

# Wait a moment for the auth server to start
sleep 3

# Now start the main application
echo -e "${GREEN}Starting Main Application...${NC}"
echo -e "${YELLOW}Once the application starts, navigate to /auth and use:${NC}"
echo -e "${GREEN}Username:${NC} testuser@example.com"
echo -e "${GREEN}Password:${NC} password123"
echo -e "${BLUE}===================================================${NC}"

npm run dev

# Make sure to kill the auth server when this script exits
kill $AUTH_PID