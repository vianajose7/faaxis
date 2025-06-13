#!/usr/bin/env node

import fetch from 'node-fetch';
const cookieJar = {};

async function testAdminVerification() {
  console.log('=== Testing Admin Verification Flow ===');
  
  const baseUrl = 'http://localhost:5000';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log(`Testing with admin email: ${adminEmail}`);
  
  // Step 1: Send verification code
  console.log('\n1. Sending verification code...');
  
  try {
    const sendCodeResponse = await fetch(`${baseUrl}/api/admin-auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });
    
    console.log(`Send code status: ${sendCodeResponse.status}`);
    
    // Extract cookies
    const setCookieHeader = sendCodeResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log(`Set-Cookie header: ${setCookieHeader}`);
      // Parse and store cookie
      const cookieMatch = setCookieHeader.match(/connect\.sid=([^;]+)/);
      if (cookieMatch) {
        cookieJar.sessionId = cookieMatch[1];
        console.log(`Session ID extracted: ${cookieMatch[1].substring(0, 20)}...`);
      }
    }
    
    const sendCodeData = await sendCodeResponse.text();
    console.log(`Send code response: ${sendCodeData.substring(0, 200)}...`);
    
    if (sendCodeResponse.status === 200) {
      let responseData;
      try {
        responseData = JSON.parse(sendCodeData);
        console.log(`OTP Key: ${responseData.otpKey}`);
        
        // Step 2: Test verification with hardcoded code
        console.log('\n2. Testing verification with code 123456...');
        
        const verifyResponse = await fetch(`${baseUrl}/api/admin-auth/verify-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': setCookieHeader ? `connect.sid=${cookieJar.sessionId}` : ''
          },
          body: JSON.stringify({
            otpKey: responseData.otpKey,
            code: '123456'
          })
        });
        
        console.log(`Verify status: ${verifyResponse.status}`);
        const verifyData = await verifyResponse.text();
        console.log(`Verify response: ${verifyData}`);
        
      } catch (parseError) {
        console.log('Response is not JSON, likely HTML fallback');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAdminVerification();