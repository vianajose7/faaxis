# Package.json Update Instructions

Since we can't directly edit package.json in this environment, here are the exact changes you should make manually:

## Update your scripts section to:

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc --build server/tsconfig.json",
    "build:client": "cd client && vite build",
    "start": "node dist/server/index.js"
  }
}
```

## Why these changes are important:

1. The `dev` script remains simple for local development
2. The `build` script is split into server and client parts for better control
3. The server build uses TypeScript compiler directly for more reliable results
4. The client build specifies the client directory explicitly
5. The `start` script correctly points to the compiled JavaScript file

## Additional recommendation:

Make sure tsx is in your dependencies (not just devDependencies) if you want to use it in production.

## How to use:

1. Edit your package.json manually to implement these changes
2. Update your Replit deployment settings to use:
   - Build command: `npm ci && npm run build`
   - Run command: `npm run start`
3. Redeploy your application

These changes will ensure your production deployment properly builds and runs your application without relying on development dependencies.