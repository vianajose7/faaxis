// Global JWT token storage
// This allows the token to be accessed from any component without prop drilling

// Token storage constants
const TOKEN_KEY = 'jwtToken';
const SESSION_ACTIVE_KEY = 'sessionActive';
const SESSION_LAST_SYNC_KEY = 'sessionLastSync';

// Initialize from localStorage if available, clearing any old token on startup
// to ensure we get a fresh token after the server was modified
export let jwtToken: string | null = null;

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) {
    jwtToken = savedToken;
    console.log('Restored JWT token from localStorage on initialization');
  }
}

/**
 * Set the JWT token both in memory and localStorage
 * This is the critical function that ensures token persistence across page loads
 */
export function setJwtToken(token: string | null) {
  // First update the in-memory value
  jwtToken = token;
  console.log('Token set:', token ? `${token.substring(0, 10)}...` : 'null');
  
  // Then persist to localStorage if available
  if (typeof window !== 'undefined') {
    if (token) {
      try {
        // Store the token in localStorage for persistence
        localStorage.setItem(TOKEN_KEY, token);
        
        // Mark session as active and update last sync time
        localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
        localStorage.setItem(SESSION_LAST_SYNC_KEY, Date.now().toString());
        
        // Also store a redundant verification flag to check localStorage functionality
        localStorage.setItem('auth_check', 'true');
        
        // Log success for debugging
        console.log('Token successfully stored in localStorage');
        
        // Dispatch a custom event to notify other parts of the application
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { 
            authenticated: true,
            token: token // Include token in event for direct access
          }
        }));
        
        // Also dispatch a token-specific event
        window.dispatchEvent(new CustomEvent('auth-token-changed', { 
          detail: { 
            token: token,
            authenticated: true
          }
        }));
      } catch (error) {
        // Log error but don't interrupt auth flow
        console.error('Error saving token to localStorage:', error);
      }
    } else {
      // Token is null, clear all storage
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_ACTIVE_KEY);
        localStorage.removeItem(SESSION_LAST_SYNC_KEY);
        localStorage.removeItem('auth_check');
        
        console.log('Token and session data cleared from localStorage');
        
        // Dispatch a custom event to notify other parts of the application
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { 
            authenticated: false,
            token: null
          }
        }));
        
        // Also dispatch a token-specific event
        window.dispatchEvent(new CustomEvent('auth-token-changed', { 
          detail: { 
            token: null,
            authenticated: false
          }
        }));
      } catch (error) {
        console.error('Error clearing token from localStorage:', error);
      }
    }
  }
}

/**
 * Get the JWT token, with an option to refresh from localStorage first
 * This helps synchronize token state between tabs and ensures the token is available for API requests
 * This is the critical function that ensures the token is available for API requests via Authorization header
 */
export function getJwtToken(refreshFromStorage: boolean = false): string | null {
  // Always refresh from storage when explicitly requested
  if (refreshFromStorage && typeof window !== 'undefined') {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      // If the tokens differ or we have a token in storage but not in memory
      if (storedToken !== jwtToken || (storedToken && !jwtToken)) {
        console.log('Refreshing token from storage:', storedToken ? `${storedToken.substring(0, 10)}...` : 'no token');
        jwtToken = storedToken;
      }
    } catch (error) {
      console.error('Error accessing localStorage in getJwtToken:', error);
      // Continue with current in-memory token
    }
  }
  
  // If we still don't have a token in memory but should have one in storage,
  // make one more attempt to retrieve it (defense in depth)
  if (!jwtToken && typeof window !== 'undefined' && localStorage.getItem('auth_check') === 'true') {
    try {
      const emergencyCheckToken = localStorage.getItem(TOKEN_KEY);
      if (emergencyCheckToken) {
        console.log('Emergency token recovery from localStorage successful');
        jwtToken = emergencyCheckToken;
      }
    } catch (error) {
      console.error('Emergency token recovery failed:', error);
    }
  }
  
  return jwtToken;
}

/**
 * Refresh the token from localStorage and check session activity
 * This is useful when returning to a tab after authenticating in another tab
 */
export function refreshTokenFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const sessionActive = localStorage.getItem(SESSION_ACTIVE_KEY);
    
    // If we have a token and session is active
    if (storedToken && sessionActive === 'true') {
      if (storedToken !== jwtToken) {
        console.log('Synchronizing token from another tab');
        jwtToken = storedToken;
        
        // Update last sync time
        localStorage.setItem(SESSION_LAST_SYNC_KEY, Date.now().toString());
        
        // Notify the application of the refreshed token
        window.dispatchEvent(new CustomEvent('auth-token-refreshed', { 
          detail: { token: storedToken }
        }));
      }
    } else if (jwtToken && !storedToken) {
      // Token was cleared in another tab but still present in this one
      console.log('Token cleared in another tab, synchronizing...');
      jwtToken = null;
      
      // Notify the application of the token removal
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { authenticated: false }
      }));
    }
  }
  return jwtToken;
}

/**
 * Check if the token has been updated in another tab
 * Returns true if token was refreshed
 */
export function syncTokenBetweenTabs(): boolean {
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    // If tokens don't match, refresh from storage
    if (storedToken !== jwtToken) {
      console.log('Token state differs between tabs, refreshing...');
      jwtToken = storedToken;
      return true;
    }
  }
  return false;
}

// Setup periodic sync to check for token changes
if (typeof window !== 'undefined') {
  // Initial sync on page load with a slight delay to avoid race conditions
  // during initial page load across multiple tabs
  setTimeout(() => {
    refreshTokenFromStorage();
  }, 100);
  
  // Periodic sync every 5 seconds
  setInterval(() => {
    syncTokenBetweenTabs();
  }, 5000);
  
  // Listen for storage events to sync tokens between tabs immediately
  window.addEventListener('storage', (event) => {
    if (event.key === TOKEN_KEY) {
      console.log('Storage event: JWT token changed in another tab', event.newValue ? 'token set' : 'token cleared');
      
      // IMPORTANT: We need to handle the case where newValue is null (token was removed)
      // We shouldn't just blindly set jwtToken = event.newValue
      if (event.newValue !== null) {
        // Token was added or updated
        jwtToken = event.newValue;
        
        // Dispatch event with authenticated = true
        window.dispatchEvent(new CustomEvent('auth-token-changed', { 
          detail: { token: event.newValue, authenticated: true }
        }));
      } else if (event.oldValue !== null && event.newValue === null) {
        // Token was removed
        jwtToken = null;
        
        // Dispatch event with authenticated = false
        window.dispatchEvent(new CustomEvent('auth-token-changed', { 
          detail: { token: null, authenticated: false }
        }));
      }
    }
  });
  
  // Also sync on visibility change (tab focus)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, syncing authentication state');
      refreshTokenFromStorage();
    }
  });
}

// Alias for setJwtToken to maintain compatibility with existing code
export const setJwtTokenForAuth = setJwtToken;

/**
 * Complete reset of all authentication-related storage
 * Use this as a last resort when authentication gets into a bad state
 */
export function resetAllTokenStorage() {
  // Clear in-memory token
  jwtToken = null;
  
  // Clear localStorage if available
  if (typeof window !== 'undefined') {
    try {
      // Clear all known auth-related keys
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_ACTIVE_KEY);
      localStorage.removeItem(SESSION_LAST_SYNC_KEY);
      localStorage.removeItem('auth_check');
      
      // Clear any other potential auth-related tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_debug');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_session');
      
      console.log('ALL token storage has been reset completely');
      
      // Dispatch events to notify the application
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { authenticated: false, token: null }
      }));
      
      window.dispatchEvent(new CustomEvent('auth-token-changed', { 
        detail: { token: null, authenticated: false }
      }));
      
      window.dispatchEvent(new CustomEvent('auth-reset-complete', {}));
      
      return true;
    } catch (error) {
      console.error('Error during complete auth reset:', error);
      return false;
    }
  }
  return false;
}

/**
 * Fetch a new token from the server and reset local storage
 * This is useful when the JWT secret changes on the server
 */
export async function refreshAuthenticationCompletely(username: string, password: string): Promise<{success: boolean, token?: string, error?: string}> {
  // First, clear all existing tokens
  resetAllTokenStorage();
  
  try {
    // Attempt to log in with the provided credentials
    const response = await fetch('/api/jwt/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || 'Failed to refresh authentication' 
      };
    }
    
    const data = await response.json();
    
    // Set the new token
    setJwtToken(data.token);
    
    return { 
      success: true, 
      token: data.token 
    };
  } catch (error) {
    console.error('Error refreshing authentication:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}