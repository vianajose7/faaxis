import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useJwtAuth } from "@/hooks/use-jwt-auth";
import { getJwtToken, setJwtToken } from "@/lib/jwtTokenStorage";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AuthTokenTestPage() {
  const { user, isAuthenticated, login, logout } = useJwtAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<{current: string | null, localStorage: string | null}>({
    current: null,
    localStorage: null
  });
  
  // Function to refresh token info display
  const refreshTokenInfo = () => {
    const inMemoryToken = getJwtToken(false);
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
    
    setTokenInfo({
      current: inMemoryToken ? `${inMemoryToken.substring(0, 10)}...` : null,
      localStorage: storedToken ? `${storedToken.substring(0, 10)}...` : null
    });
  };
  
  // Check token info on component mount
  useState(() => {
    refreshTokenInfo();
  });
  
  // State variable for login/logout loading
  const [authAction, setAuthAction] = useState<string | null>(null);

  // Test login with the Authorization header approach
  const handleLogin = async () => {
    setAuthAction("login");
    try {
      await login({ username, password });
      toast({
        title: "Login successful",
        description: "You are now logged in with JWT token"
      });
      refreshTokenInfo();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive"
      });
    } finally {
      setAuthAction(null);
    }
  };
  
  // Test logout clearing all tokens
  const handleLogout = async () => {
    setAuthAction("logout");
    try {
      await logout();
      toast({
        title: "Logout successful",
        description: "You have been logged out"
      });
      refreshTokenInfo();
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    } finally {
      setAuthAction(null);
    }
  };
  
  // State variable to track which test is running
  const [isTestRunning, setIsTestRunning] = useState<string | null>(null);

  // Test authorization header works
  const testAuthHeaders = async () => {
    setIsTestRunning("authHeaders");
    try {
      const response = await apiRequest('GET', '/api/auth-headers');
      const data = await response.json();
      
      // Enhanced result with test metadata
      setTestResult({
        ...data,
        testType: "Authorization Headers Test",
        success: data.headers?.authorization?.present === true,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Authorization test successful",
        description: data.headers?.authorization?.present 
          ? "Authorization header detected"
          : "No Authorization header found"
      });
    } catch (error: any) {
      setTestResult({ 
        error: error.message,
        testType: "Authorization Headers Test",
        success: false,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Test failed",
        description: error.message || "Could not test Authorization header",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(null);
    }
  };
  
  // Test JWT direct endpoint
  const testJwtEndpoint = async () => {
    setIsTestRunning("jwtEndpoint");
    try {
      const response = await apiRequest('GET', '/api/jwt-test');
      const data = await response.json();
      
      // Enhanced result with test metadata
      setTestResult({
        ...data,
        testType: "JWT Protected Endpoint Test",
        success: true,
        timestamp: new Date().toISOString()
      });
      
      if (data.token) {
        setJwtToken(data.token);
        refreshTokenInfo();
      }
      
      toast({
        title: "JWT test successful",
        description: "Received response from JWT test endpoint"
      });
    } catch (error: any) {
      setTestResult({ 
        error: error.message,
        testType: "JWT Protected Endpoint Test",
        success: false,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "JWT test failed",
        description: error.message || "Could not connect to JWT test endpoint",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(null);
    }
  };
  
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">JWT Authentication Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-semibold">Authenticated: <span className={isAuthenticated ? "text-green-500" : "text-red-500"}>{isAuthenticated ? "Yes" : "No"}</span></p>
                {user && (
                  <div className="mt-2">
                    <p>User ID: {user.id}</p>
                    <p>Username: {user.username}</p>
                    <p>Name: {user.firstName} {user.lastName}</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-semibold mb-2">Token Information:</p>
                <p>In-memory: {tokenInfo.current || "None"}</p>
                <p>localStorage: {tokenInfo.localStorage || "None"}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={refreshTokenInfo}>
                  Refresh Token Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Login / Logout</CardTitle>
            <CardDescription>Test authentication with JWT</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={handleLogin} 
              disabled={authAction !== null}
            >
              {authAction === "login" ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</>
              ) : (
                "Login"
              )}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={authAction !== null}
            >
              {authAction === "logout" ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging out...</>
              ) : (
                "Logout"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
            <CardDescription>Test various authentication endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button 
                onClick={testAuthHeaders} 
                variant="outline"
                disabled={isTestRunning !== null}
              >
                {isTestRunning === "authHeaders" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
                ) : (
                  "Test Auth Headers"
                )}
              </Button>
              <Button 
                onClick={testJwtEndpoint} 
                variant="outline"
                disabled={isTestRunning !== null}
              >
                {isTestRunning === "jwtEndpoint" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
                ) : (
                  "Test JWT Endpoint"
                )}
              </Button>
            </div>
            
            {testResult && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Test Result:</h3>
                  {testResult.success !== undefined && (
                    <Badge variant={testResult.success ? "outline" : "destructive"} className={testResult.success ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : ""}>
                      {testResult.success ? "Success" : "Failed"}
                    </Badge>
                  )}
                  {testResult.testType && (
                    <Badge variant="outline" className="ml-auto">
                      {testResult.testType}
                    </Badge>
                  )}
                </div>
                
                <Tabs defaultValue="formatted" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="formatted">
                    <div className="p-3 bg-card rounded-md text-card-foreground">
                      {testResult.headers && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Headers</h4>
                          <div className="space-y-1">
                            {Object.entries(testResult.headers).map(([key, value]: [string, any]) => (
                              <div key={key} className="grid grid-cols-5 text-xs">
                                <span className="col-span-2 font-medium">{key}:</span>
                                <span className="col-span-3">
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value) 
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {testResult.user && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">User</h4>
                          <div className="space-y-1">
                            {Object.entries(testResult.user).map(([key, value]: [string, any]) => (
                              <div key={key} className="grid grid-cols-5 text-xs">
                                <span className="col-span-2 font-medium">{key}:</span>
                                <span className="col-span-3">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {testResult.token && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Token</h4>
                          <div className="text-xs break-all">
                            {testResult.token.substring(0, 20)}...
                          </div>
                        </div>
                      )}
                      
                      {testResult.error && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1 text-destructive">Error</h4>
                          <div className="text-xs text-destructive">{testResult.error}</div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="raw">
                    <pre className="text-xs overflow-auto p-3 bg-card rounded-md text-card-foreground max-h-96">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}