import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { resetAllTokenStorage, refreshAuthenticationCompletely } from '@/lib/jwtTokenStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

export default function AuthResetPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [secretInfo, setSecretInfo] = useState<any>(null);
  const [isLoadingSecretInfo, setIsLoadingSecretInfo] = useState(false);

  // Load secret info on mount
  useEffect(() => {
    fetchSecretInfo();
  }, []);

  const fetchSecretInfo = async () => {
    setIsLoadingSecretInfo(true);
    try {
      const response = await fetch('/api/jwt/debug-secret');
      if (response.ok) {
        const data = await response.json();
        setSecretInfo(data);
      } else {
        console.error('Failed to fetch JWT secret info');
      }
    } catch (error) {
      console.error('Error fetching JWT secret info:', error);
    } finally {
      setIsLoadingSecretInfo(false);
    }
  };

  const handleCompleteReset = () => {
    const wasReset = resetAllTokenStorage();
    if (wasReset) {
      setSuccessMessage('All authentication tokens have been reset. You will need to log in again.');
      setErrorMessage(null);
    } else {
      setErrorMessage('Failed to reset authentication tokens. Try clearing your browser cache.');
      setSuccessMessage(null);
    }
  };

  const handleFullRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await refreshAuthenticationCompletely(username, password);
      
      if (result.success) {
        setSuccessMessage('Authentication has been refreshed successfully with a new token.');
        // Reload secret info to show updated values
        fetchSecretInfo();
      } else {
        setErrorMessage(result.error || 'Failed to refresh authentication.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred during authentication refresh.');
      console.error('Error in handleFullRefresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToTokenTest = () => {
    setLocation('/auth-token-test');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Reset</CardTitle>
            <CardDescription>
              Use this page to fix authentication issues when tokens get out of sync
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="reset" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reset">Reset Tokens</TabsTrigger>
                <TabsTrigger value="debug">Debug Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reset" className="space-y-4 mt-4">
                {errorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
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
                </div>
                
                <div className="flex flex-col space-y-2 mt-6">
                  <Button 
                    onClick={handleCompleteReset}
                    variant="destructive"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Auth Tokens
                  </Button>
                  
                  <Button 
                    onClick={handleFullRefresh}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Login with Fresh Token
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="debug" className="space-y-4 mt-4">
                <div className="bg-slate-50 p-4 rounded-md">
                  <h3 className="text-md font-medium mb-2">JWT Secret Information</h3>
                  
                  {isLoadingSecretInfo ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="animate-spin h-6 w-6 text-slate-500" />
                    </div>
                  ) : secretInfo ? (
                    <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(secretInfo).map(([key, value]: [string, any]) => (
                            <tr key={key} className="border-b border-slate-200">
                              <td className="py-1 pr-4 font-semibold">{key}:</td>
                              <td className="py-1">{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500">Failed to load secret information</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={fetchSecretInfo}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh Info
                  </Button>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    If you see "invalid signature" errors, it means the token was signed with a different secret than what the server is using now.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setLocation('/')}>
              Back to Home
            </Button>
            <Button variant="secondary" onClick={handleGoToTokenTest}>
              Go to Token Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}