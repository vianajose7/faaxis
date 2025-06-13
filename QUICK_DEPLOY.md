# Quick Deploy Guide

This is a simplified deployment guide for getting the application running with JWT registration working properly.

## One-Step Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Run the unified server**:
   ```bash
   NODE_ENV=production node one-server.js
   ```

That's it! Your application is now running on a single server that correctly handles both frontend and API requests, with JWT registration working properly.

## Why It Works

The unified server approach:
1. Eliminates all proxy issues that were causing 504 errors
2. Uses a single process for both frontend and API
3. Properly handles all routes including JWT authentication
4. Has no port conflicts or process management complexity

## Troubleshooting

If you encounter any issues:

1. Make sure your environment variables are set correctly:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret for JWT tokens
   - `PORT` - Server port (default: 3000)
   - `NODE_ENV` - Set to 'production'

2. Verify the React application was built:
   ```bash
   ls -l dist/public/index.html
   ```
   If this file doesn't exist, run `npm run build` again.

3. For detailed deployment information, see UNIFIED_DEPLOYMENT.md