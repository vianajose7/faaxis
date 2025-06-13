import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthTest() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [testUser, setTestUser] = useState<any>(null);

  // Check current auth status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check auth status
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth-status', {
        credentials: 'include' // important to include cookies
      });
      
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
        console.log('Auth status:', data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to login with JWT
  const loginWithJwt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Make the request directly without CSRF token
      const res = await fetch('/api/jwt/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // important to include cookies
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: 'Login Successful',
          description: 'You have successfully logged in with JWT'
        });
        console.log('JWT login response:', data);
        setTestUser(data.user);
        checkAuthStatus();
      } else {
        toast({
          title: 'Login Failed',
          description: data.message || 'Failed to login',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error logging in with JWT:', error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during login',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to test JWT-protected route
  const testJwtAuth = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/jwt-test', {
        credentials: 'include' // important to include cookies
      });
      
      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'JWT Auth Test Successful',
          description: 'Successfully accessed JWT-protected route'
        });
        console.log('JWT test response:', data);
      } else {
        const errorData = await res.json();
        toast({
          title: 'JWT Auth Test Failed',
          description: errorData.message || 'Failed to access JWT-protected route',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing JWT auth:', error);
      toast({
        title: 'JWT Auth Test Error',
        description: 'An error occurred while testing JWT auth',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to test dual auth route
  const testDualAuth = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dual-auth-test', {
        credentials: 'include' // important to include cookies
      });
      
      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'Dual Auth Test Successful',
          description: `Successfully authenticated with ${data.authType}`
        });
        console.log('Dual auth test response:', data);
      } else {
        const errorData = await res.json();
        toast({
          title: 'Dual Auth Test Failed',
          description: errorData.message || 'Failed to authenticate',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing dual auth:', error);
      toast({
        title: 'Dual Auth Test Error',
        description: 'An error occurred while testing authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout with JWT
  const logoutWithJwt = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/jwt/logout', {
        method: 'POST',
        credentials: 'include' // important to include cookies
      });
      
      if (res.ok) {
        toast({
          title: 'Logout Successful',
          description: 'You have successfully logged out'
        });
        setTestUser(null);
        checkAuthStatus();
      } else {
        const errorData = await res.json();
        toast({
          title: 'Logout Failed',
          description: errorData.message || 'Failed to logout',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error logging out with JWT:', error);
      toast({
        title: 'Logout Error',
        description: 'An error occurred during logout',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>JWT Authentication Test</CardTitle>
            <CardDescription>Test the new JWT authentication system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={loginWithJwt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login with JWT'
                )}
              </Button>
            </form>
            
            {testUser && (
              <div className="mt-4 p-4 border rounded bg-muted">
                <h3 className="font-medium mb-2">Logged in as:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testUser, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={testJwtAuth} variant="outline" className="w-full">
              Test JWT Protected Route
            </Button>
            <Button onClick={testDualAuth} variant="outline" className="w-full">
              Test Dual Auth
            </Button>
            <Button onClick={logoutWithJwt} variant="destructive" className="w-full">
              Logout (JWT)
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state of the application</CardDescription>
          </CardHeader>
          <CardContent>
            {authStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">JWT Authentication:</h3>
                  <p>{authStatus.jwtAuthCookiePresent ? '✅ JWT cookie present' : '❌ No JWT cookie'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Session Authentication:</h3>
                  <p>{authStatus.sessionAuthenticated ? '✅ Session authenticated' : '❌ Not session authenticated'}</p>
                </div>
                {authStatus.user && (
                  <div>
                    <h3 className="font-medium">User Info:</h3>
                    <pre className="text-xs p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(authStatus.user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  'No authentication status available'
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkAuthStatus} className="w-full" variant="outline">
              Refresh Auth Status
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How to Test</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your test credentials and click "Login with JWT" to test the JWT login system</li>
          <li>If login is successful, you'll see your user information</li>
          <li>Click "Test JWT Protected Route" to verify you can access JWT-protected endpoints</li>
          <li>Click "Test Dual Auth" to test the compatibility layer that supports both auth systems</li>
          <li>Click "Logout (JWT)" to test the JWT logout system</li>
          <li>Use "Refresh Auth Status" to check your current authentication state anytime</li>
        </ol>
      </div>
    </div>
  );
}