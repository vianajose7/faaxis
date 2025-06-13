#!/bin/bash

# FA Axis - Site Starter Script
# This script provides a menu to start different versions of the site

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clear screen and display header
clear
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}      FA AXIS - SITE STARTER MENU        ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Kill any running Node processes
kill_node() {
  echo -e "${YELLOW}Stopping any running Node.js processes...${NC}"
  pkill -9 node || true
  sleep 2
  echo -e "${GREEN}Done!${NC}"
}

# Display menu
echo -e "Please select an option to start:"
echo ""
echo -e "  ${GREEN}1)${NC} Development Mode (Hot Reload)"
echo -e "  ${GREEN}2)${NC} Production Mode - Standard"
echo -e "  ${GREEN}3)${NC} Production Mode - Neon Database Auth"
echo -e "  ${GREEN}4)${NC} Auth Fix Mode (Login/Registration Fix)"
echo -e "  ${GREEN}5)${NC} Direct Login Fix (Simple Login Solution)"
echo -e "  ${GREEN}0)${NC} Exit"
echo ""

# Read user choice
read -p "Enter your choice: " choice
echo ""

# Execute based on choice
case $choice in
  1)
    echo -e "${GREEN}Starting Development Mode (Hot Reload)...${NC}"
    npm run dev
    ;;
  2)
    echo -e "${GREEN}Starting Production Mode - Standard...${NC}"
    kill_node
    npm run build && npm run start
    ;;
  3)
    echo -e "${GREEN}Starting Production Mode - Neon Database Auth...${NC}"
    kill_node
    chmod +x start-neon-auth.sh
    ./start-neon-auth.sh
    ;;
  4)
    echo -e "${GREEN}Starting Auth Fix Mode (Login/Registration Fix)...${NC}"
    kill_node
    chmod +x start-auth-fix.sh
    ./start-auth-fix.sh
    ;;
  5)
    echo -e "${GREEN}Starting Direct Login Fix (Simple Login Solution)...${NC}"
    kill_node
    chmod +x start-direct-login.sh
    ./start-direct-login.sh
    ;;
  0)
    echo -e "${BLUE}Exiting. Goodbye!${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid option. Please try again.${NC}"
    ;;
esac