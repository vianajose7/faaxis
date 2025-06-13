# .replit Configuration Update

**Current Issue:** Your deployment is trying to run `correct-deployment-server.js` instead of the production-ready `index.js`

## ✅ **CORRECT .replit Configuration:**

```toml
modules = ["nodejs-20", "postgresql-16"]
[deployment]
deploymentTarget = "autoscale"
build = ["sh", "-c", "node -v && npm install && npm run build"]
run = ["sh", "-c", "node index.js"]

[[ports]]
localPort = 3000
externalPort = 80

[[ports]]
localPort = 3001
externalPort = 3001

[[ports]]
localPort = 5000
externalPort = 5000

[[ports]]
localPort = 5001
externalPort = 3000

[[ports]]
localPort = 8080
externalPort = 8080

[workflows]
runButton = "Dev Server"

[[workflows.workflow]]
name = "Run"
author = 41521811
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run build && node index.js"

[[workflows.workflow]]
name = "Dev Server"
author = 41521811
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "NODE_ENV=development tsx server/index.ts"

[nix]
channel = "stable-24_05"
```

## 🔄 **What Changed:**
- Line 5: `run = ["sh", "-c", "node index.js"]` (was: correct-deployment-server.js)
- Line 37: `args = "npm run build && node index.js"` (simplified production command)

## 🚀 **Why This Works:**
- Uses your production-ready `index.js` server
- Includes complete authentication system
- Supports login, registration, and checkout
- Properly serves your React app
- All API endpoints configured

**To Update:** Copy the configuration above and paste it into your `.replit` file in the Replit editor.