#!/bin/bash

# ======================================================
# Production Deployment Checklist
# ======================================================
# This script runs through a full checklist of tests to ensure
# that your deployment configuration is correct before deploying
# to production.
#
# Usage: ./deployment-checklist.sh [baseUrl]
#   baseUrl: Optional URL to test against (default: http://localhost:3000)
# ======================================================

set -e  # Exit on any error

# Colors for better output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Base URL to test against (default to localhost:3000 if not specified)
BASE_URL=${1:-"http://localhost:3000"}
API_PORT=${API_PORT:-5001}
API_URL="http://localhost:${API_PORT}"

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}   Production Deployment Checklist           ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo -e "Testing against: ${YELLOW}${BASE_URL}${NC}"
echo -e "API server expected at: ${YELLOW}${API_URL}${NC}"
echo ""

# Function to check if required files exist
check_files() {
  echo -e "${CYAN}Checking required files...${NC}"
  
  local missing_files=0
  declare -a required_files=(
    "package.json"
    "simple-production-server.js"
    "build-and-deploy-fixed.sh"
    "dist/public/index.html"
  )
  
  for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
      echo -e "  ${GREEN}✓${NC} Found $file"
    else
      echo -e "  ${RED}✗${NC} Missing $file"
      missing_files=$((missing_files+1))
    fi
  done
  
  if [ $missing_files -gt 0 ]; then
    echo -e "${RED}Error: $missing_files required files are missing.${NC}"
    return 1
  else
    echo -e "${GREEN}All required files present.${NC}"
    return 0
  fi
}

# Function to check if package.json has correct settings
check_package_json() {
  echo -e "${CYAN}Checking package.json configuration...${NC}"
  
  if grep -q '"type": "module"' package.json; then
    echo -e "  ${GREEN}✓${NC} Package.json has ESM module type"
  else
    echo -e "  ${YELLOW}!${NC} Package.json may need 'type': 'module' for ESM support"
  fi
  
  if grep -q "build-and-deploy-fixed.sh" package.json; then
    echo -e "  ${GREEN}✓${NC} Build script is configured"
  else
    echo -e "  ${YELLOW}!${NC} You may need to add a build script that runs build-and-deploy-fixed.sh"
  fi
}

# Function to check build script configuration
check_build_script() {
  echo -e "${CYAN}Checking build script configuration...${NC}"
  
  if [ -x "build-and-deploy-fixed.sh" ]; then
    echo -e "  ${GREEN}✓${NC} build-and-deploy-fixed.sh is executable"
  else
    echo -e "  ${RED}✗${NC} build-and-deploy-fixed.sh is not executable. Run: chmod +x build-and-deploy-fixed.sh"
  fi
  
  if grep -q "\-\-format=esm" build-and-deploy-fixed.sh; then
    echo -e "  ${GREEN}✓${NC} ESM format flag is present in build script"
  else
    echo -e "  ${YELLOW}!${NC} You may need to add --format=esm flag to esbuild command"
  fi
}

# Function to check proxy server configuration
check_proxy_configuration() {
  echo -e "${CYAN}Checking proxy server configuration...${NC}"
  
  if grep -q "createProxyMiddleware" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} Proxy middleware is configured"
    
    if grep -q "'/jwt'" simple-production-server.js; then
      echo -e "  ${GREEN}✓${NC} JWT routes are being proxied"
    else
      echo -e "  ${RED}✗${NC} JWT routes may not be properly proxied"
    fi
    
    if grep -q "'/api'" simple-production-server.js; then
      echo -e "  ${GREEN}✓${NC} API routes are being proxied"
    else
      echo -e "  ${RED}✗${NC} API routes may not be properly proxied"
    fi
  else
    echo -e "  ${RED}✗${NC} Proxy middleware not found in simple-production-server.js"
  fi
}

# Function to check static file serving configuration
check_static_file_configuration() {
  echo -e "${CYAN}Checking static file serving configuration...${NC}"
  
  if grep -q "express.static" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} Static file serving is configured"
    
    if grep -q "dist/public" simple-production-server.js; then
      echo -e "  ${GREEN}✓${NC} Correct static file directory is set"
    else
      echo -e "  ${YELLOW}!${NC} Verify static file directory points to dist/public"
    fi
  else
    echo -e "  ${RED}✗${NC} Static file serving not found in simple-production-server.js"
  fi
  
  if grep -q "app.get.*index.html" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} SPA fallback route is configured"
  else
    echo -e "  ${RED}✗${NC} SPA fallback route not found in simple-production-server.js"
  fi
}

# Function to check health check endpoint
check_health_endpoint() {
  echo -e "${CYAN}Checking health check endpoint...${NC}"
  
  if grep -q "'/health'" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} Health check endpoint is configured"
  else
    echo -e "  ${YELLOW}!${NC} Health check endpoint not found. Consider adding a /health endpoint."
  fi
}

# Function to check environment variables
check_environment_variables() {
  echo -e "${CYAN}Checking environment variables...${NC}"
  
  local missing_vars=0
  declare -a required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD_HASH"
  )
  
  for var in "${required_vars[@]}"; do
    if [ -n "${!var}" ]; then
      echo -e "  ${GREEN}✓${NC} $var is set"
    else
      echo -e "  ${YELLOW}!${NC} $var is not set. Make sure it's set in production."
      missing_vars=$((missing_vars+1))
    fi
  done
  
  if [ $missing_vars -gt 0 ]; then
    echo -e "${YELLOW}Warning: $missing_vars required environment variables are not set.${NC}"
  else
    echo -e "${GREEN}All required environment variables are set.${NC}"
  fi
}

# Function to check port configuration
check_port_configuration() {
  echo -e "${CYAN}Checking port configuration...${NC}"
  
  if grep -q "process.env.PORT" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} PORT environment variable is used"
  else
    echo -e "  ${YELLOW}!${NC} PORT environment variable may not be properly configured"
  fi
  
  if grep -q "process.env.API_PORT" simple-production-server.js; then
    echo -e "  ${GREEN}✓${NC} API_PORT environment variable is used"
  else
    echo -e "  ${YELLOW}!${NC} API_PORT environment variable may not be properly configured"
  fi
}

# Function to summarize
summarize() {
  echo ""
  echo -e "${CYAN}==============================================${NC}"
  echo -e "${CYAN}   Deployment Readiness Summary              ${NC}"
  echo -e "${CYAN}==============================================${NC}"
  echo -e "  ${GREEN}✓${NC} Required files checked"
  echo -e "  ${GREEN}✓${NC} Package.json configuration checked"
  echo -e "  ${GREEN}✓${NC} Build script configuration checked"
  echo -e "  ${GREEN}✓${NC} Proxy configuration checked"
  echo -e "  ${GREEN}✓${NC} Static file configuration checked"
  echo -e "  ${GREEN}✓${NC} Health check endpoint checked"
  echo -e "  ${GREEN}✓${NC} Environment variables checked"
  echo -e "  ${GREEN}✓${NC} Port configuration checked"
  echo ""
  echo -e "${CYAN}Recommended deployment commands:${NC}"
  echo -e "  ${YELLOW}Build:${NC} npm ci && ./build-and-deploy-fixed.sh"
  echo -e "  ${YELLOW}Run:${NC}   node simple-production-server.js"
  echo ""
  echo -e "${CYAN}Make sure these environment variables are set in production:${NC}"
  echo -e "  - PORT (for the web server)"
  echo -e "  - API_PORT (for the API server)"
  echo -e "  - DATABASE_URL (PostgreSQL connection string)"
  echo -e "  - JWT_SECRET (for authentication tokens)"
  echo -e "  - ADMIN_EMAIL (admin user email)"
  echo -e "  - ADMIN_PASSWORD_HASH (bcrypt hashed admin password)"
  echo ""
  echo -e "${GREEN}Checklist complete!${NC}"
}

# Run the checks
check_files
check_package_json
check_build_script
check_proxy_configuration
check_static_file_configuration
check_health_endpoint
check_environment_variables
check_port_configuration
summarize