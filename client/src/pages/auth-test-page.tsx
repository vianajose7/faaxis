import { useState, useEffect } from "react";
import { useJwtAuth } from "@/hooks/use-jwt-auth";
import { jwtToken, getJwtToken, refreshTokenFromStorage, syncTokenBetweenTabs } from "@/lib/jwtTokenStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/**
 * Test page for JWT and dual authentication
 * 
 * This page provides functionality to test various authentication methods:
 * - JWT-based authentication (with cookies and Authorization header)
 * - Session-based authentication
 * - Dual authentication (works with either method)
 */
export default function AuthTestPage() {
  const { user, isAuthenticated, login, logout, refreshAuthState } = useJwtAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [tabId] = useState(() => Math.random().toString(36).substring(2, 8));
  const [tabVisible, setTabVisible] = useState(document.visibilityState === 'visible');
  const [viteConnection, setViteConnection] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const { toast } = useToast();
  
  // Monitor HMR WebSocket connection state for debugging Safari issues
  useEffect(() => {
    const checkViteConnection = () => {
      // This checks if Vite's HMR WebSocket is connected
      // @ts-ignore - accessing Vite's internal APIs for debugging
      const connected = window.__vite_ws?.readyState === WebSocket.OPEN;
      setViteConnection(connected ? 'connected' : 'disconnected');
    };
    
    // Check connection status periodically
    checkViteConnection();
    const interval = setInterval(checkViteConnection, 5000);
    
    // Handle connection events if possible 
    window.addEventListener('vite:ws-connect', () => setViteConnection('connected'));
    window.addEventListener('vite:ws-disconnect', () => setViteConnection('disconnected'));
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('vite:ws-connect', () => setViteConnection('connected'));
      window.removeEventListener('vite:ws-disconnect', () => setViteConnection('disconnected'));
    };
  }, []);
  
  // Effect to listen for tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setTabVisible(isVisible);
      
      if (isVisible) {
        // When tab becomes visible, check for auth state changes
        console.log('Tab became visible, refreshing auth state');
        refreshTokenFromStorage();
        refreshAuthState();
      }
    };
    
    // Listen for custom auth events
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Auth state changed event received:', customEvent.detail);
      setTestResults({
        type: "Auth State Changed",
        data: { 
          event: "auth-state-changed", 
          authenticated: customEvent.detail?.authenticated,
          timestamp: new Date().toISOString()
        },
        success: true
      });
    };
    
    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    window.addEventListener('auth-token-refreshed', (e) => {
      console.log('Token refreshed event received');
      refreshAuthState();
    });
    
    // Clean up listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('auth-token-refreshed', (e) => {
        console.log('Token refreshed event received');
        refreshAuthState();
      });
    };
  }, [refreshAuthState]);
  
  // Handle login
  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await login({ username: "demo", password: "demo123456" });
      console.log("Login successful, token:", jwtToken);
      // login() will automatically update isAuthenticated and user in context
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      console.log("Logout successful, token cleared");
      // logout() will automatically update isAuthenticated and user in context
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };
  
  // Function to test JWT authentication
  const testJwtAuth = async () => {
    setLoading("jwt");
    try {
      const response = await apiRequest("GET", "/api/jwt-test");
      const data = await response.json();
      setTestResults({
        type: "JWT Auth Test",
        data,
        success: true
      });
    } catch (error: any) {
      setTestResults({
        type: "JWT Auth Test",
        error: error.message,
        success: false
      });
    } finally {
      setLoading(null);
    }
  };
  
  // Function to test dual authentication
  const testDualAuth = async () => {
    setLoading("dual");
    try {
      const response = await apiRequest("GET", "/api/dual-auth-test");
      const data = await response.json();
      setTestResults({
        type: "Dual Auth Test",
        data,
        success: true
      });
    } catch (error: any) {
      setTestResults({
        type: "Dual Auth Test",
        error: error.message,
        success: false
      });
    } finally {
      setLoading(null);
    }
  };
  
  // Function to test auth status
  const checkAuthStatus = async () => {
    if (!isAuthenticated) {
      setTestResults({
        type: "Auth Status Check",
        error: "Please login first before checking auth status",
        success: false
      });
      return;
    }
    
    setLoading("status");
    try {
      // Direct approach - just make the request if authenticated
      const response = await apiRequest("GET", "/api/auth-status");
      const data = await response.json();
      setTestResults({
        type: "Auth Status Check",
        data,
        success: true
      });
    } catch (error: any) {
      setTestResults({
        type: "Auth Status Check",
        error: error.message,
        success: false
      });
    } finally {
      setLoading(null);
    }
  };
  
  // Test with a forced Authorization header
  const testAuthHeader = async () => {
    const currentToken = getJwtToken();
    if (!currentToken) {
      setTestResults({
        type: "Auth Header Test",
        error: "No token available. Please login first.",
        success: false
      });
      return;
    }
    
    setLoading("header");
    try {
      // Make a request with an explicit Authorization header
      const response = await fetch('/api/auth-status', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = await response.json();
      setTestResults({
        type: "Auth Header Test",
        data,
        success: true
      });
    } catch (error: any) {
      setTestResults({
        type: "Auth Header Test",
        error: error.message,
        success: false
      });
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Authentication Test Page</h1>
      <p className="text-muted-foreground mb-6">
        This page allows you to test the different authentication methods implemented in the application.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state from JWT Auth Provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">User:</span>{" "}
                {user ? user.username : "Not logged in"}
              </div>
              <div>
                <span className="font-semibold">Token:</span>{" "}
                {getJwtToken() ? `${getJwtToken()?.substring(0, 15)}...` : "No token"}
              </div>
              <div>
                <span className="font-semibold">Authenticated:</span>{" "}
                {isAuthenticated ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {user ? (
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();  // Prevent any form submission
                  handleLogout();
                }}
                disabled={logoutLoading}
                type="button"  // Explicitly set as button type to prevent form submission
              >
                {logoutLoading ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();  // Prevent any form submission
                  handleLogin();
                }}
                disabled={loginLoading}
                type="button"  // Explicitly set as button type to prevent form submission
              >
                {loginLoading ? "Logging in..." : "Demo Login"}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Tests</CardTitle>
            <CardDescription>Test the different authentication methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  testJwtAuth();
                }}
                disabled={loading !== null}
                type="button"
              >
                {loading === "jwt" ? "Testing..." : "Test JWT Auth"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  testDualAuth();
                }}
                disabled={loading !== null}
                type="button"
              >
                {loading === "dual" ? "Testing..." : "Test Dual Auth"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  checkAuthStatus();
                }}
                disabled={loading !== null}
                type="button"
              >
                {loading === "status" ? "Checking..." : "Check Auth Status"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  testAuthHeader();
                }}
                disabled={loading !== null || !getJwtToken()}
                type="button"
              >
                {loading === "header" ? "Testing..." : "Test Auth Header"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {testResults && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{testResults.type} Results</CardTitle>
            <CardDescription>
              {testResults.success ? "Test completed successfully" : "Test failed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formatted">
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted">
                {testResults.success ? (
                  <div className="space-y-4">
                    {testResults.data.message && (
                      <Alert>
                        <AlertTitle>Message</AlertTitle>
                        <AlertDescription>{testResults.data.message}</AlertDescription>
                      </Alert>
                    )}
                    
                    {testResults.data.user && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">User</h3>
                        <div className="bg-secondary/50 p-3 rounded-md">
                          <div><span className="font-medium">Username:</span> {testResults.data.user.username}</div>
                          {testResults.data.user.isAdmin !== undefined && (
                            <div><span className="font-medium">Admin:</span> {testResults.data.user.isAdmin ? "Yes" : "No"}</div>
                          )}
                          {testResults.data.user.emailVerified !== undefined && (
                            <div><span className="font-medium">Email Verified:</span> {testResults.data.user.emailVerified ? "Yes" : "No"}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {testResults.data.authType && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Authentication Method</h3>
                        <div className="bg-secondary/50 p-3 rounded-md">
                          {testResults.data.authType === "jwt" ? "JWT Authentication" : "Session Authentication"}
                        </div>
                      </div>
                    )}
                    
                    {/* Specific handling for auth status check */}
                    {testResults.type === "Auth Status Check" && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">JWT Status</h3>
                          <div className="bg-secondary/50 p-3 rounded-md space-y-1">
                            <div><span className="font-medium">JWT Present:</span> {testResults.data.jwtAuthPresent ? "Yes" : "No"}</div>
                            <div><span className="font-medium">JWT Valid:</span> {testResults.data.jwtAuthVerified ? "Yes" : "No"}</div>
                            <div><span className="font-medium">JWT in Cookie:</span> {testResults.data.jwtAuthCookiePresent ? "Yes" : "No"}</div>
                            <div><span className="font-medium">JWT in Header:</span> {testResults.data.jwtAuthHeaderPresent ? "Yes" : "No"}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Session Status</h3>
                          <div className="bg-secondary/50 p-3 rounded-md">
                            <div><span className="font-medium">Session Authenticated:</span> {testResults.data.sessionAuthenticated ? "Yes" : "No"}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{testResults.error}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent value="raw">
                <pre className="bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[400px] text-sm">
                  {JSON.stringify(testResults.data || testResults.error, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cross-Tab Synchronization</CardTitle>
          <CardDescription>Test authentication state synchronization between browser tabs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Open this page in multiple tabs or windows to test how authentication state is synchronized between them.
              When you log in or out in one tab, the authentication state should be updated in all tabs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Manual Sync Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      const refreshed = refreshTokenFromStorage();
                      setTestResults({
                        type: "Token Refresh",
                        data: { token: refreshed ? "Token synchronized" : "No token found" },
                        success: true
                      });
                    }}
                    type="button"
                  >
                    Refresh Token from Storage
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      const updated = syncTokenBetweenTabs();
                      setTestResults({
                        type: "Tab Sync",
                        data: { 
                          result: updated ? "Token was updated from another tab" : "Token is already in sync",
                          currentToken: getJwtToken() ? "Token present" : "No token"
                        },
                        success: true
                      });
                    }}
                    type="button"
                  >
                    Sync Between Tabs
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Tab Information</h3>
                <div className="space-y-2">
                  <div>
                    <Badge variant={tabVisible ? "default" : "secondary"}>
                      {tabVisible ? 'Tab Visible' : 'Tab Hidden'}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Tab ID:</span> {tabId}</div>
                  <div><span className="font-medium">Auth State:</span> {isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>
                  <div><span className="font-medium">WebSocket:</span> {
                    viteConnection === 'connected' ? (
                      <Badge variant="success" className="bg-green-600">Connected</Badge>
                    ) : viteConnection === 'disconnected' ? (
                      <Badge variant="destructive">Disconnected</Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )
                  }</div>
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault();
                        refreshAuthState();
                        toast({
                          title: "Auth State Refreshed",
                          description: isAuthenticated ? "You are authenticated" : "You are not authenticated",
                        });
                      }}
                      size="sm"
                      type="button"
                    >
                      Refresh Auth State
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-secondary/50 rounded-md">
              <h3 className="text-md font-semibold mb-2">How Cross-Tab Sync Works</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Uses LocalStorage to persist the token across tabs</li>
                <li>Listens for Storage events to detect token changes in other tabs</li>
                <li>Refreshes token on tab visibility change (when tab becomes active)</li>
                <li>Periodically checks for token changes (every 30 seconds)</li>
                <li>Dispatches custom events to notify the application of authentication state changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Implementation Notes</CardTitle>
          <CardDescription>Technical notes about the dual authentication system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">JWT Authentication</h3>
              <p className="text-muted-foreground mb-2">
                Uses JSON Web Tokens stored in HTTP-only cookies and/or sent via Authorization headers.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Token is stored securely in an HTTP-only cookie</li>
                <li>Falls back to Authorization header if cookies aren't available</li>
                <li>CSRF protection not required (tokens are self-contained)</li>
                <li>Routes are located at <code>/api/jwt/*</code></li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Session Authentication</h3>
              <p className="text-muted-foreground mb-2">
                Traditional session-based auth using Passport.js with server-side session storage.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Uses session cookies to maintain authentication state</li>
                <li>Requires CSRF protection for state-changing operations</li>
                <li>Routes are located at <code>/api/session/*</code></li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Dual Authentication</h3>
              <p className="text-muted-foreground mb-2">
                System that tries both authentication methods when needed, prioritizing JWT.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Checks for JWT authentication first</li>
                <li>Falls back to session authentication if JWT fails</li>
                <li>Useful during transition periods or for legacy routes</li>
                <li>Example route: <code>/api/dual-auth-test</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}