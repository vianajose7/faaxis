# Deployment Instructions for FaAxis Platform

## Production Build & Deployment

### Step 1: Build your application
Run the following command to build both client and server:

```bash
npm ci && ./build-and-deploy.sh
```

This will:
1. Install dependencies
2. Build the React client into `dist/public`
3. Build the server into `dist/index.js`

### Step 2: Start the production server
Run the production server with:

```bash
node simple-production-server.js
```

The production server:
- Serves static assets from `dist/public`
- Provides a health check endpoint at `/health`
- Handles SPA routing for non-API routes
- Handles port conflicts automatically

## Verification

Check that these endpoints return 200 OK:

```
GET /health
GET /
GET /api/user (will return 401 if not logged in)
```

## Deployment Environment Requirements

- Node.js 20+
- PostgreSQL database (connection string in DATABASE_URL)
- Environment variables as specified in .env.production

## Troubleshooting

If you experience port binding conflicts:
- The server automatically redirects port 5000 to PORT
- Make sure no other service is using the PORT specified in your environment