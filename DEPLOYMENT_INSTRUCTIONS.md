# Deployment Instructions

This document outlines the steps needed to properly deploy this application to production.

## Architecture Overview

The application uses a dual-server architecture:

1. **Main Server (Frontend)**: Serves the React application (static files) and proxies API requests
2. **API Server**: Handles all API requests and database interactions

## Files Overview

- `simple-production-server.js` - Main production server with proxy configuration
- `build-and-deploy-fixed.sh` - Build script to compile the application
- `deployment-checklist.sh` - Script to verify deployment configuration
- `jwt-proxy-test.js` - Diagnostic tool for testing JWT proxy configuration
- `jwt-api-check.js` - Diagnostic tool for testing JWT API endpoints

## Deployment Process

### 1. Build Step

```bash
# Install dependencies and build the application
npm ci && ./build-and-deploy-fixed.sh
```

The build script will:
- Clean the dist directory
- Build the client-side React application with Vite
- Compile the server-side TypeScript code with esbuild (ESM format)

### 2. Run Step

```bash
# Start the production server
node simple-production-server.js
```

## Environment Variables

Make sure the following environment variables are set in your production environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Main server port (default: 3000) | Yes |
| `API_PORT` | API server port (default: 5001) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT authentication | Yes |
| `ADMIN_EMAIL` | Admin user email | Yes |
| `ADMIN_PASSWORD_HASH` | Bcrypt hashed admin password | Yes |

## Important Fixes

### JWT Registration Issue

Previous deployments experienced a 504 timeout when registering new users due to improper proxy configuration for JWT routes. This has been fixed in `simple-production-server.js` by:

1. Separating API and JWT proxy configurations
2. Adding detailed logging for proxy requests
3. Improving error handling for proxy failures

### Port Conflict Resolution

The port conflict between the hardcoded port (5000) and environment variables has been resolved by:

1. Adding proper port detection from environment variables
2. Implementing graceful error handling for port conflicts

### ESM/CommonJS Compatibility

Compatibility issues between ESM and CommonJS modules have been addressed by:

1. Ensuring the build script uses `--format=esm` flag for esbuild
2. Maintaining the `"type": "module"` setting in package.json

## Health Checks

A health check endpoint is available at `/health` which returns a 200 OK response. This can be used for load balancer health monitoring.

## Troubleshooting

If you encounter issues with the deployment, follow these steps:

1. Run the deployment checklist to identify configuration issues:
   ```bash
   ./deployment-checklist.sh
   ```

2. Test the JWT proxy configuration:
   ```bash
   node jwt-proxy-test.js
   ```

3. Verify API server JWT endpoints:
   ```bash
   node jwt-api-check.js
   ```

4. Check the server logs for detailed error messages

5. Common issues:
   - Port conflicts: Make sure no other process is using the specified ports
   - JWT registration failures: Ensure the JWT proxy is correctly configured
   - Missing environment variables: Verify all required environment variables are set

## Security Considerations

1. Admin authentication uses environment variables for credentials
2. All verification codes are masked in logs and only delivered via email
3. Database credentials are securely stored in environment variables
4. JWT tokens have appropriate expiration settings

## Database Safety

The application uses Neon Postgres to store all user and admin-created data. This data is safe from build processes and will persist across deployments.

## Contact

If you encounter persistent issues with the deployment, please contact the development team for assistance.