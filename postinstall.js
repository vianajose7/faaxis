#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running postinstall checks...');

// Check if server build exists
const serverJsPath = path.join(__dirname, 'dist/server/index.js');
const serverExists = fs.existsSync(serverJsPath);

console.log(`Server build exists: ${serverExists ? 'YES' : 'NO'}`);

// Check if client build exists
const clientBuildPath = path.join(__dirname, 'dist/public');
const clientIndexPath = path.join(clientBuildPath, 'index.html');
const clientExists = fs.existsSync(clientIndexPath);

console.log(`Client build exists: ${clientExists ? 'YES' : 'NO'}`);

// If either build is missing, trigger a rebuild
if (!serverExists || !clientExists) {
  console.log('Some build artifacts are missing. Running build process...');
  
  try {
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
      fs.mkdirSync(path.join(__dirname, 'dist'));
    }
    
    // Run the build process
    console.log('Building client...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Build process completed.');
  } catch (error) {
    console.error('Build process failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('All build artifacts are present. No rebuild needed.');
}

// Verify build artifacts again
const serverExistsAfter = fs.existsSync(serverJsPath);
const clientExistsAfter = fs.existsSync(clientIndexPath);

console.log(`Final check - Server build exists: ${serverExistsAfter ? 'YES' : 'NO'}`);
console.log(`Final check - Client build exists: ${clientExistsAfter ? 'YES' : 'NO'}`);

if (!serverExistsAfter || !clientExistsAfter) {
  console.error('ERROR: Build process did not create all necessary files');
  process.exit(1);
} else {
  console.log('Postinstall completed successfully');
}