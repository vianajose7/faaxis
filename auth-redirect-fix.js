/**
 * Authentication Redirect Fix
 * 
 * This script helps ensure proper redirects after authentication.
 * Place this in your public directory to enable the fix.
 */

(function() {
  // Only run in production to avoid affecting development
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
    console.log('Auth redirect fix: Development environment detected, not applying');
    return;
  }
  
  console.log('Auth redirect fix: Initializing');
  
  // Handle redirects from authentication responses
  function handleAuthRedirect(response) {
    // If the response includes a redirectUrl, navigate to it
    if (response && response.redirectUrl) {
      console.log(`Auth redirect fix: Redirecting to ${response.redirectUrl}`);
      window.location.href = response.redirectUrl;
      return true;
    }
    return false;
  }
  
  // Patch the fetch function to intercept authentication responses
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      // Only intercept responses from authentication endpoints
      const url = args[0].toString();
      if (url.includes('/jwt/login') || url.includes('/jwt/register') || 
          url.includes('/api/login') || url.includes('/api/register')) {
        
        // Clone the response so we can read it twice
        const clone = response.clone();
        
        // Check for JSON responses to handle redirects
        if (response.headers.get('content-type')?.includes('application/json')) {
          clone.json().then(data => {
            handleAuthRedirect(data);
          }).catch(err => {
            console.error('Auth redirect fix: Error parsing response', err);
          });
        }
      }
      
      // Always return the original response
      return response;
    });
  };
  
  // Also patch XMLHttpRequest to intercept authentication responses
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    // Check if this is an authentication endpoint
    if (typeof url === 'string' && 
        (url.includes('/jwt/login') || url.includes('/jwt/register') || 
         url.includes('/api/login') || url.includes('/api/register'))) {
      
      // Save the original onload handler
      const originalOnload = this.onload;
      
      // Override the onload handler
      this.onload = function() {
        try {
          // Check response format
          if (this.responseText && this.getResponseHeader('content-type')?.includes('application/json')) {
            const data = JSON.parse(this.responseText);
            if (!handleAuthRedirect(data) && originalOnload) {
              originalOnload.apply(this, arguments);
            }
          } else if (originalOnload) {
            originalOnload.apply(this, arguments);
          }
        } catch (err) {
          console.error('Auth redirect fix: Error handling XHR response', err);
          if (originalOnload) {
            originalOnload.apply(this, arguments);
          }
        }
      };
    }
    
    // Call the original open method
    return originalOpen.apply(this, arguments);
  };
  
  console.log('Auth redirect fix: Initialized successfully');
})();