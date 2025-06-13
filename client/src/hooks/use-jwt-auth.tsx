import { apiRequest } from '@/lib/queryClient';
import { 
  getJwtToken, 
  setJwtToken, 
  refreshTokenFromStorage, 
  syncTokenBetweenTabs 
} from '@/lib/jwtTokenStorage';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface JwtAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (values: { username: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const JwtAuthContext = createContext<JwtAuthContextType>({} as JwtAuthContextType);

export function useJwtAuth() {
  return useContext(JwtAuthContext);
}

export function JwtAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Define refreshAuthState as a useCallback so it can be passed to the context value
  const refreshAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      // First check if we have a token in storage
      const token = refreshTokenFromStorage();
      
      if (!token) {
        console.log('No JWT token found in storage during refresh - logging out');
        // No token in storage, definitely not authenticated
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Found JWT token in storage during refresh - verifying with server');
      
      // Try to load the user from the API using the token from storage
      // apiRequest will automatically add the Authorization header with the token
      try {
        const res = await apiRequest('GET', '/api/jwt/me');
        const userData = await res.json();
        
        if (userData) {
          console.log('User data successfully loaded from server during refresh');
          setUser(userData);
          setIsAuthenticated(true);
          
          // Update token if provided in the response
          if (userData?.token) {
            console.log('Received new token from server during refresh - updating');
            setJwtToken(userData.token);
          }
        } else {
          console.warn('Received empty user data from server during refresh');
          // Valid response but no user object - token might be invalid
          setJwtToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (apiError) {
        console.error('Error fetching user data during refresh:', apiError);
        
        // Try a fallback approach - verify the token using the test endpoint
        try {
          const testRes = await apiRequest('GET', '/api/jwt-test');
          const testData = await testRes.json();
          
          if (testData?.user) {
            console.log('JWT test endpoint returned user data - staying logged in');
            setUser(testData.user);
            setIsAuthenticated(true);
            return;
          }
        } catch (testError) {
          console.error('JWT test endpoint also failed - logging out:', testError);
          // Both attempts failed, token is invalid
          setJwtToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error during auth refresh:', error);
      // Check if we still have a token as a last resort
      const token = getJwtToken(true); // Refresh from storage
      
      if (!token) {
        // No token in storage, definitely not authenticated
        console.log('No token in storage after error - logging out');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // We still have a token but couldn't verify it - keep previous state
        console.log('Token still in storage after error - keeping previous authentication state');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle auth state changes from other tabs
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Auth state changed event received:', customEvent.detail);
      
      // Direct state update if we have the authenticated flag
      if (customEvent.detail && customEvent.detail.authenticated !== undefined) {
        const isAuth = customEvent.detail.authenticated;
        console.log(`Setting authenticated state directly to: ${isAuth}`);
        
        setIsAuthenticated(isAuth);
        
        if (!isAuth) {
          // If not authenticated, immediately clear user
          setUser(null);
        } else {
          // If authenticated, refresh to get the user object
          refreshAuthState();
        }
      } else {
        // Fallback to full refresh
        refreshAuthState();
      }
    };

    // Handle token changes from other tabs
    const handleTokenChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Token changed event received:', customEvent.detail?.token ? 'token present' : 'token cleared');
      
      // Direct state update based on event detail for faster response
      if (customEvent.detail?.authenticated !== undefined) {
        setIsAuthenticated(customEvent.detail.authenticated);
        
        if (!customEvent.detail.authenticated) {
          // If not authenticated, clear user immediately
          setUser(null);
          console.log('Setting user to null due to token change event');
        } else {
          // If authenticated, we need to fetch the user data
          refreshAuthState();
        }
      } else {
        // Fallback to normal refresh if authentication state not provided
        refreshAuthState();
      }
    };

    // Add visibility change listener to refresh token when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing auth state');
        refreshTokenFromStorage();
        refreshAuthState();
      }
    };

    // Initial auth state load
    refreshAuthState();
    
    // Set up event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChange);
      window.addEventListener('auth-token-changed', handleTokenChange);
      window.addEventListener('auth-token-refreshed', handleTokenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Set up periodic sync (every 30 seconds)
      const syncInterval = setInterval(() => {
        if (syncTokenBetweenTabs()) {
          // Token was updated, refresh auth state
          refreshAuthState();
        }
      }, 30000);
      
      // Clean up all listeners on unmount
      return () => {
        window.removeEventListener('auth-state-changed', handleAuthStateChange);
        window.removeEventListener('auth-token-changed', handleTokenChange);
        window.removeEventListener('auth-token-refreshed', handleTokenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(syncInterval);
      };
    }
  }, [refreshAuthState]);

  async function login(values: { username: string; password: string }) {
    try {
      setIsLoading(true);
      
      // Clear only the JWT token, not all localStorage
      setJwtToken(null);
      console.log('Cleared existing JWT token before login attempt');
      
      // Now attempt to login with fresh state
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        // Don't send any existing authorization header
        credentials: 'include', // Include cookies in the request
      });
      
      if (!res.ok) {
        const errorResult = await res.json();
        throw new Error(errorResult.message || 'Login failed');
      }
      
      const result = await res.json();
      
      if (result.token) {
        console.log("Login successful - received fresh token from server");
        
        // First set the internal state
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Then set the token to avoid any race conditions with storage events
        // This should be the LAST operation to prevent race conditions
        setJwtToken(result.token);
        
        // Make a test request to verify the token is working correctly
        try {
          // Use fetch directly instead of apiRequest to ensure we're using the fresh token
          const testRes = await fetch('/api/jwt-test', {
            headers: {
              'Authorization': `Bearer ${result.token}`
            }
          });
          const testResult = await testRes.json();
          console.log('JWT token verification successful:', testResult.message);
        } catch (testError) {
          console.warn('JWT token verification failed, but continuing with login:', testError);
          // Don't throw here, just log the warning and continue
        }
        
        toast({
          title: "Login successful with fresh token",
          description: `Welcome back, ${result.user.firstName || result.user.username}!`,
        });
      } else {
        console.error('Login response missing token:', result);
        throw new Error('No token returned from login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(values: { username: string; password: string; firstName: string; lastName: string }) {
    try {
      setIsLoading(true);
      
      // Clear only the JWT token, not all localStorage
      setJwtToken(null);
      console.log('Cleared existing JWT token before registration attempt');
      
      // Now attempt to register with fresh state
      const res = await fetch('/api/jwt/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        // Don't send any existing authorization header
        credentials: 'include', // Include cookies in the request
      });
      
      const result = await res.json();
      
      if (result.token) {
        console.log("Registration successful - received fresh token from server");
        console.log("User data received:", result.user);
        
        // Make sure user data has all needed fields
        const userData = {
          ...result.user,
          firstName: result.user.firstName || values.firstName,
          lastName: result.user.lastName || values.lastName,
          username: result.user.username || values.username
        };
        
        // First set the user and authentication state
        setUser(userData);
        setIsAuthenticated(true);
        
        // Then set the token last to avoid race conditions
        setJwtToken(result.token);
        
        // Make a test request to verify the token is working correctly
        try {
          // Use fetch directly instead of apiRequest to ensure we're using the fresh token
          const testRes = await fetch('/api/jwt-test', {
            headers: {
              'Authorization': `Bearer ${result.token}`
            }
          });
          const testResult = await testRes.json();
          console.log('JWT token verification successful after registration:', testResult.message);
        } catch (testError) {
          console.warn('JWT token verification failed after registration, but continuing:', testError);
          // Don't throw here, just log the warning and continue
        }
        
        toast({
          title: "Registration successful with fresh token",
          description: `Welcome, ${values.firstName || values.username}!`,
        });
      } else {
        console.error('Registration response missing token:', result);
        throw new Error('No token returned from registration');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      
      // First clear the client-side state to ensure user appears logged out immediately
      setUser(null);
      setIsAuthenticated(false);
      setJwtToken(null); // This will also clear localStorage
      
      // Additionally, clear all of localStorage to be thorough
      if (typeof window !== 'undefined') {
        localStorage.clear();
        console.log('Cleared all localStorage data during logout');
      }
      
      // Then call the logout API to invalidate the server-side token
      // Using fetch directly to avoid any token reuse in the apiRequest wrapper
      try {
        await fetch('/api/jwt/logout', {
          method: 'POST',
          credentials: 'include', // Include cookies
        });
        console.log('Logout API call successful');
      } catch (apiError) {
        console.error('Error calling logout API, but continuing with client-side logout:', apiError);
        // Continue with client-side logout even if API call fails
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error during logout process:', error);
      
      // One more attempt to clear state in case of an error
      setJwtToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } finally {
      setIsLoading(false);
    }
  }

  const value: JwtAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshAuthState
  };

  return <JwtAuthContext.Provider value={value}>{children}</JwtAuthContext.Provider>;
}