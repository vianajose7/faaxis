# Unified Deployment Guide

This guide provides a clean, proper solution for deploying the application with JWT registration working correctly.

## The Solution: One Server

The solution uses a single unified Express server that:
1. Serves the React app from `dist/public`
2. Mounts all API routes directly (no proxies)
3. Handles JWT authentication properly
4. Uses modern ESM modules throughout

## Deployment Steps

### 1. Build Everything

```bash
./one-build.sh
```

This single command:
- Builds the React app with Vite
- Bundles the server with esbuild in ESM format
- Places all artifacts in the `dist` directory

### 2. Run in Production

```bash
NODE_ENV=production node one-server.js
```

That's it! Your application is now running with JWT registration working properly.

## Required Environment Variables

Make sure these are set in your production environment:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `NODE_ENV` | Set to 'production' |
| `PORT` | Optional (defaults to 5000) |

## Testing Without Touching Production

You can safely test this solution without affecting your production site:

```bash
# Install dependencies
npm ci

# Build everything
./one-build.sh

# Run on a different port
PORT=3001 NODE_ENV=production node one-server.js
```

Visit http://localhost:3001 to verify:
- The application loads correctly
- API routes work
- JWT registration works (the key fix)

Once you've confirmed everything works locally, you can confidently deploy to production.

## Why This Approach Works

1. **No Proxies**: By serving both the frontend and API from the same Express instance, we eliminate all proxy-related issues that were causing 504 errors.

2. **Proper ESM Modules**: Using `--format=esm` with esbuild ensures consistent module formats, preventing "require is not defined" errors.

3. **Consistent Port Handling**: Works with the port 5000 requirement while maintaining flexibility through environment variables.

4. **Clean Routing**: All routes are properly handled in one place, with a clear separation between API routes and the SPA fallback.

5. **Zero-Risk Testing**: You can verify the fix locally or in staging without affecting your production site.

## In Summary

- **Build**: `./one-build.sh`
- **Run**: `NODE_ENV=production node one-server.js`
- **Test**: Same commands but with `PORT=3001`