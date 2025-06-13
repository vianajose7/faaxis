#!/usr/bin/env node

/**
 * JWT Route Diagnostic Tool
 * 
 * This script helps diagnose JWT routing issues in production deployment.
 * Run with: node jwt-route-check.js https://your-domain.com
 */

import https from 'https';
import http from 'http';

// Get base URL from command line
const baseUrl = process.argv[2] || 'http://localhost:3000';
console.log(`🔍 Checking JWT routes on: ${baseUrl}`);

// Endpoints to check
const endpoints = [
  '/jwt/status',
  '/jwt/register',
  '/api/health',
  '/health'
];

// Function to make a request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    
    const req = client.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : '') // Truncate long responses
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        url,
        error: error.message
      });
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      reject({
        url,
        error: 'Request timed out after 5 seconds'
      });
    });
    
    req.end();
  });
}

// Test POST to registration endpoint
function testRegistration(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    
    // Generate a unique test email to avoid collisions
    const timestamp = new Date().getTime();
    const testData = JSON.stringify({
      username: `test-${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      }
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : '') // Truncate long responses
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        url,
        error: error.message
      });
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      reject({
        url,
        error: 'Request timed out after 5 seconds'
      });
    });
    
    req.write(testData);
    req.end();
  });
}

// Main function
async function checkEndpoints() {
  console.log('🔄 Testing GET endpoints...');
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const result = await makeRequest(url);
      console.log(`✅ ${url}: ${result.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(result.headers)}`);
      console.log(`   Data: ${result.data}`);
    } catch (error) {
      console.log(`❌ ${error.url}: ${error.error}`);
    }
    console.log('---');
  }
  
  console.log('🔄 Testing POST to /jwt/register...');
  try {
    const result = await testRegistration(`${baseUrl}/jwt/register`);
    console.log(`✅ POST ${baseUrl}/jwt/register: ${result.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(result.headers)}`);
    console.log(`   Data: ${result.data}`);
  } catch (error) {
    console.log(`❌ ${error.url}: ${error.error}`);
  }
  
  console.log('\n🏁 Diagnostic completed');
}

// Run the checks
checkEndpoints();