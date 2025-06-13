/**
 * Authentication Frontend Fix
 * 
 * This script helps patch the frontend to use our fixed authentication server
 * by modifying the login request to point to the correct URL.
 */

// Function to override fetch for specific authentication endpoints
function patchAuthenticationRequests() {
  console.log('🔐 Patching authentication requests...');
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override the fetch function
  window.fetch = function(url, options) {
    // Convert URL to string if it's a Request object
    const urlString = typeof url === 'string' ? url : url.url;
    
    // Check if this is an authentication request
    if (urlString.includes('/api/login') || urlString.includes('/api/register')) {
      console.log(`🔄 Intercepting auth request to: ${urlString}`);
      
      // Redirect to our fixed authentication server
      const newUrl = `http://localhost:3001${urlString}`;
      console.log(`🔀 Redirecting to: ${newUrl}`);
      
      // Pass through the original options
      return originalFetch(newUrl, options);
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
  };
  
  console.log('✅ Fetch patched successfully for authentication requests');
}

// Run the patch
patchAuthenticationRequests();

// Display a message to the user
console.log('%c🔐 Authentication Fix Applied - Login with testuser@example.com / password123', 'background: #4CAF50; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');