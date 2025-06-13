/**
 * Authentication and Navigation Fix Verification
 * 
 * This script verifies that the authentication redirect
 * and page loading fixes are working correctly.
 */

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Test login and registration redirects
async function testAuthRedirects(baseUrl) {
  console.log(`\n🔍 Testing authentication redirects on ${baseUrl}`);
  
  try {
    // Test JWT login endpoint
    console.log('\n📝 Testing JWT login redirect...');
    const loginResponse = await fetch(`${baseUrl}/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test@example.com', password: 'password123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login response received');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Redirect URL: ${loginData.redirectUrl || 'None'}`);
    } else {
      console.log('❌ Login request failed');
      console.log(`   Status: ${loginResponse.status}`);
    }
    
    // Test JWT registration endpoint
    console.log('\n📝 Testing JWT registration redirect...');
    const registerResponse = await fetch(`${baseUrl}/jwt/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: `test${Date.now()}@example.com`, 
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration response received');
      console.log(`   Status: ${registerResponse.status}`);
      console.log(`   Redirect URL: ${registerData.redirectUrl || 'None'}`);
    } else {
      console.log('❌ Registration request failed');
      console.log(`   Status: ${registerResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing authentication redirects:', error.message);
  }
}

// Test SPA page navigation
async function testPageNavigation(baseUrl) {
  console.log(`\n🔍 Testing SPA page navigation on ${baseUrl}`);
  
  const pagesToTest = [
    '/dashboard',
    '/calculator',
    '/marketplace',
    '/checkout',
    '/profile'
  ];
  
  for (const page of pagesToTest) {
    try {
      console.log(`\n📝 Testing navigation to ${page}...`);
      const response = await fetch(`${baseUrl}${page}`);
      
      if (response.ok) {
        const html = await response.text();
        const isHtml = html.includes('<!DOCTYPE html>');
        const isSpaResponse = html.includes('<div id="root">') || html.includes('<div id="app">');
        
        console.log(`✅ Page ${page} response received`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Is HTML: ${isHtml ? 'Yes' : 'No'}`);
        console.log(`   Is SPA: ${isSpaResponse ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ Page ${page} request failed`);
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error testing navigation to ${page}:`, error.message);
    }
  }
}

// Main verification function
async function verifyFixes() {
  console.log('🚀 Starting verification of authentication and navigation fixes');
  
  // URL to test - default to localhost for local testing
  const baseUrl = process.env.TEST_URL || 'http://localhost:5000';
  
  // First test auth redirects
  await testAuthRedirects(baseUrl);
  
  // Then test page navigation
  await testPageNavigation(baseUrl);
  
  console.log('\n✅ Verification completed');
}

// Run the verification
verifyFixes().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});