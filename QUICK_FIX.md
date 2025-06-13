# DEPLOYMENT QUICK FIX

Based on the Replit error information, here are the exact steps to fix your deployment:

## 1. Go to Deployments Settings
1. Click on **Tools** in the top menu
2. Select **Deployments**
3. Click **Edit Commands**

## 2. Update the Commands
You need to make these exact changes:

### For the Build Command:
```
npm ci && npm run build
```

### For the Run Command:
```
npm run start
```

## 3. Redeploy
Click the **Redeploy** button to apply these changes.

## Why This Works
- The `tsx` command is only available in development, not production
- The new settings will:
  1. Install dependencies (npm ci)
  2. Build both the client and server (npm run build)
  3. Run the compiled JavaScript file (npm run start)

This fixes the issue where Replit was trying to run TypeScript directly in production without compiling it first.

## Alternative Approaches
If you still have issues, try these alternatives:
1. Use the static fallback: Change run command to `npm run static`
2. Use the deployment script: Change run command to `./deploy-fixed.sh`