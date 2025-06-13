#!/bin/bash

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}FaAxis Deployment Verification Script${NC}"
echo "=================================="
echo

# 1. Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Check if Node.js version is 20.x or higher
NODE_MAJOR_VERSION=$(node -v | cut -d. -f1 | cut -c 2-)
if [[ $NODE_MAJOR_VERSION -lt 20 ]]; then
  echo -e "${RED}❌ Node.js version is less than 20.x. Please upgrade Node.js.${NC}"
else
  echo -e "${GREEN}✅ Node.js version is compatible.${NC}"
fi
echo

# 2. Check required directories and files
echo -e "${BLUE}Checking required files and directories...${NC}"

# Check if dist directory exists
if [ -d "./dist" ]; then
  echo -e "${GREEN}✅ dist directory exists.${NC}"
else
  echo -e "${RED}❌ dist directory is missing. Run the build script first.${NC}"
fi

# Check if dist/public directory exists (client build)
if [ -d "./dist/public" ]; then
  echo -e "${GREEN}✅ dist/public directory exists.${NC}"
else
  echo -e "${RED}❌ dist/public directory is missing. Client build may have failed.${NC}"
fi

# Check if dist/index.js exists (server build)
if [ -f "./dist/index.js" ]; then
  echo -e "${GREEN}✅ dist/index.js exists.${NC}"
else
  echo -e "${RED}❌ dist/index.js is missing. Server build may have failed.${NC}"
fi

# Check if simple-production-server.js exists
if [ -f "./simple-production-server.js" ]; then
  echo -e "${GREEN}✅ simple-production-server.js exists.${NC}"
else
  echo -e "${RED}❌ simple-production-server.js is missing. Create it before deployment.${NC}"
fi
echo

# 3. Check required environment variables
echo -e "${BLUE}Checking environment variables...${NC}"
REQUIRED_VARS=("NODE_ENV" "DATABASE_URL" "ADMIN_EMAIL" "ADMIN_PASSWORD_HASH" "OPENAI_API_KEY" "STRIPE_SECRET_KEY" "VITE_STRIPE_PUBLIC_KEY")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING_VARS+=("$VAR")
    echo -e "${YELLOW}⚠️ $VAR is not set.${NC}"
  else
    # Don't print the actual value for security reasons
    echo -e "${GREEN}✅ $VAR is set.${NC}"
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️ Some environment variables are missing. Check DEPLOYMENT_INSTRUCTIONS.md for required variables.${NC}"
else
  echo -e "${GREEN}✅ All required environment variables are set.${NC}"
fi
echo

# 4. Check database connection
echo -e "${BLUE}Checking database connection...${NC}"
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️ Cannot check database connection - DATABASE_URL is not set.${NC}"
else
  # Try a simple query to check connection
  if ! node -e "
    const { Pool } = require('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.query('SELECT 1').then(() => {
      console.log('Database connection successful.');
      process.exit(0);
    }).catch(err => {
      console.error('Database connection failed:', err.message);
      process.exit(1);
    });
  " > /dev/null 2>&1; then
    echo -e "${RED}❌ Database connection failed. Check your DATABASE_URL.${NC}"
  else
    echo -e "${GREEN}✅ Database connection successful.${NC}"
  fi
fi
echo

# 5. Test basic server startup
echo -e "${BLUE}Testing production server startup...${NC}"
echo "Starting server in test mode (will shut down after 5 seconds)..."
(NODE_ENV=test PORT=3777 API_PORT=3778 node simple-production-server.js > /tmp/faaxis-test-server.log 2>&1) &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Check if server is listening on port 3777
if nc -z localhost 3777 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Production server started successfully.${NC}"
  
  # Check health endpoint
  if curl -s http://localhost:3777/health > /dev/null; then
    echo -e "${GREEN}✅ Health endpoint is responding.${NC}"
  else
    echo -e "${RED}❌ Health endpoint is not responding.${NC}"
  fi
else
  echo -e "${RED}❌ Production server failed to start.${NC}"
  echo -e "${YELLOW}Server logs:${NC}"
  cat /tmp/faaxis-test-server.log
fi

# Kill the test server
kill $SERVER_PID > /dev/null 2>&1
sleep 1
echo

# 6. Summary
echo -e "${BLUE}Deployment Verification Summary${NC}"
echo "=================================="
echo -e "${GREEN}✅ Node.js compatibility checked${NC}"
echo -e "${GREEN}✅ Required files checked${NC}"
echo -e "${GREEN}✅ Environment variables checked${NC}"
echo -e "${GREEN}✅ Database connection checked${NC}"
echo -e "${GREEN}✅ Server startup tested${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. If all checks passed, you're ready to deploy."
echo "2. Run: node simple-production-server.js"
echo "3. Visit http://localhost:3000 to verify the application is working."
echo
echo -e "${YELLOW}Note: For production use, make sure to set NODE_ENV=production and use appropriate PORT values.${NC}"