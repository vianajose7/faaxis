#!/usr/bin/env node

/**
 * Production Dependencies Installer
 * 
 * This script helps install the necessary dependencies for the production-deployment.js
 * enhanced server.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Required dependencies for the enhanced production server
const REQUIRED_DEPS = [
  'compression',
  'helmet',
  'express'
];

// Check if package.json exists
console.log('Checking for package.json...');
if (!fs.existsSync('package.json')) {
  console.error('Error: package.json not found. Are you in the project root?');
  process.exit(1);
}

// Check if dependencies are already installed
console.log('Checking for installed dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const installedDeps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})];

const missingDeps = REQUIRED_DEPS.filter(dep => !installedDeps.includes(dep));

if (missingDeps.length === 0) {
  console.log('✅ All required dependencies are already installed.');
  process.exit(0);
}

// Install missing dependencies
console.log(`Installing missing dependencies: ${missingDeps.join(', ')}...`);
try {
  execSync(`npm install --save ${missingDeps.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}