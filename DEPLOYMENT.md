# FaAxis Deployment Guide

This is a quick guide to help you deploy the FaAxis application to production environments.

## Quick Start

1. Build the application:
   ```bash
   ./build-and-deploy-fixed.sh
   ```

2. Verify deployment readiness:
   ```bash
   ./verify-deployment.sh
   ```

3. Run the application:
   ```bash
   NODE_ENV=production node simple-production-server.js
   ```

## Configuration

All configuration is done through environment variables. Make sure to set the following variables:

```bash
# For a full list, see DEPLOYMENT_INSTRUCTIONS.md
NODE_ENV=production
PORT=3000
API_PORT=5001
DATABASE_URL=postgres://...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=...
```

## How It Works

Our deployment system uses a two-server approach:

1. A frontend server that serves static files and proxies API requests
2. A backend server that handles API requests and database operations

This setup allows for:
- Better separation of concerns
- Improved security
- Easier scaling and maintenance

## Files Involved

- `simple-production-server.js` - The main production server
- `build-and-deploy-fixed.sh` - Script to build the application
- `verify-deployment.sh` - Script to verify deployment readiness
- `DEPLOYMENT_INSTRUCTIONS.md` - Detailed deployment instructions

## Requirements

- Node.js 20.x or later
- PostgreSQL database
- Environment variables correctly set

## Important Notes

- Always set NODE_ENV=production in production environments
- The server monitors port 5000 bindings and redirects them to prevent conflicts
- A health check endpoint is available at /health for monitoring

For more detailed information, see [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md).