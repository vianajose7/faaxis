/**
 * Login Patch for Development Mode
 * 
 * This script patches the client-side authentication system to always
 * succeed with the test user credentials. Copy this code to your browser
 * console to apply the patch.
 */

(function() {
  // Store original fetch implementation
  const originalFetch = window.fetch;
  
  // Override fetch to intercept login requests
  window.fetch = function(resource, options) {
    let url = resource;
    if (typeof resource === 'object' && resource.url) {
      url = resource.url;
    }
    
    // Check if this is a login request
    if (url.includes('/api/login') && options && options.method === 'POST') {
      try {
        // Parse the request body
        const body = JSON.parse(options.body);
        
        // Check if using test credentials
        if (body.username === 'testuser@example.com' && body.password === 'password123') {
          console.log('🔐 Test login detected! Creating successful response...');
          
          // Create mock successful login response
          const testUser = {
            id: 9999,
            username: 'testuser@example.com',
            firstName: 'Test',
            lastName: 'User',
            emailVerified: true,
            isPremium: true,
            isAdmin: false,
            sessionId: 'test-session-' + Date.now(),
            sessionActive: true,
            message: 'Login successful'
          };
          
          // Return a mock successful response
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(testUser),
            headers: new Headers()
          });
        }
      } catch (e) {
        console.error('Error parsing login request:', e);
      }
    }
    
    // For all other requests, use the original fetch
    return originalFetch(resource, options);
  };
  
  console.log('🔐 Login patch applied successfully!');
  console.log('✅ You can now login with:');
  console.log('   Email: testuser@example.com');
  console.log('   Password: password123');
})();