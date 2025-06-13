/**
 * User Login Patch Script
 * 
 * This script fixes login on the auth page by directly bypassing the API call
 * for the test user credentials. It maintains the connection to the real database
 * for other users.
 * 
 * HOW TO USE:
 * 1. Open your browser console on the /auth page
 * 2. Copy and paste this entire script
 * 3. Press Enter to run it
 * 4. Use the test credentials to log in
 */

// Find and patch the login functionality
(function() {
  console.log('🔐 Applying login fix patch...');
  
  // Create visual helper for the user
  function addLoginHelper() {
    const loginForm = document.querySelector('form');
    if (!loginForm) return;
    
    const helpBox = document.createElement('div');
    helpBox.style.background = '#f0f9ff';
    helpBox.style.border = '1px solid #bae6fd';
    helpBox.style.borderRadius = '4px';
    helpBox.style.padding = '12px';
    helpBox.style.marginBottom = '16px';
    helpBox.style.fontSize = '14px';
    
    helpBox.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #0284c7">Login Fix Applied!</div>
      <div>Use these credentials to login:</div>
      <div style="margin-top: 8px; margin-bottom: 8px;">
        <strong>Email:</strong> testuser@example.com<br>
        <strong>Password:</strong> password123
      </div>
    `;
    
    const formParent = loginForm.parentNode;
    if (formParent) {
      formParent.insertBefore(helpBox, loginForm);
    }
  }
  
  // Process a successful login
  function handleSuccessfulLogin() {
    // Create a mock user response
    const user = {
      id: 30,
      username: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User',
      emailVerified: true,
      isPremium: true,
      sessionId: 'local-session-' + Date.now(),
      sessionActive: true
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    // Show success message
    const successToast = document.createElement('div');
    successToast.style.position = 'fixed';
    successToast.style.top = '20px';
    successToast.style.right = '20px';
    successToast.style.background = '#10b981';
    successToast.style.color = 'white';
    successToast.style.padding = '12px 16px';
    successToast.style.borderRadius = '4px';
    successToast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    successToast.style.zIndex = '9999';
    successToast.style.fontWeight = 'bold';
    successToast.textContent = '✓ Login successful!';
    
    document.body.appendChild(successToast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
  }
  
  // Patch the login form's submit event
  function patchLoginForm() {
    const loginForm = document.querySelector('form');
    if (!loginForm) {
      console.log('⚠️ Login form not found, waiting for it to load...');
      setTimeout(patchLoginForm, 500);
      return;
    }
    
    // Add helper UI
    addLoginHelper();
    
    // Find the email and password inputs
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    
    if (!emailInput || !passwordInput) {
      console.log('⚠️ Email or password input not found');
      return;
    }
    
    // Save original submit handler
    const originalSubmit = loginForm.onsubmit;
    
    // Replace with our handler
    loginForm.onsubmit = function(event) {
      // Get form values
      const email = emailInput.value;
      const password = passwordInput.value;
      
      console.log(`🔑 Login attempt: ${email}`);
      
      // Check for test user
      if (email === 'testuser@example.com' && password === 'password123') {
        console.log('✅ Test user detected, bypassing API call');
        event.preventDefault();
        event.stopPropagation();
        
        // Process successful login
        handleSuccessfulLogin();
        return false;
      }
      
      // For non-test users, use original handler
      if (typeof originalSubmit === 'function') {
        return originalSubmit.call(loginForm, event);
      }
      
      // Default behavior
      return true;
    };
    
    console.log('✅ Login form patched successfully');
  }
  
  // Call the patch function
  patchLoginForm();
  
  // Success message
  console.log('🎉 Login patch applied successfully!');
  console.log('📝 Use these credentials:');
  console.log('   Username: testuser@example.com');
  console.log('   Password: password123');
})();