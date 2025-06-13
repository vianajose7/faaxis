import { useState } from 'react';
import { useJwtAuth } from '@/hooks/use-jwt-auth';
import { useLocation } from 'wouter';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, LogIn, UserPlus, EyeOff, Eye, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function JwtAuthPage() {
  const { login, register, user, isLoading } = useJwtAuth();
  const [, navigate] = useLocation();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }
  
  // Form states
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  
  // Error states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Success states
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error and success states
    setLoginError(null);
    setLoginSuccess(null);
    
    try {
      await login({ username: loginForm.username, password: loginForm.password });
      setLoginSuccess('Login successful! Redirecting...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    }
  };
  
  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error and success states
    setRegisterError(null);
    setRegisterSuccess(null);
    
    try {
      await register(registerForm);
      setRegisterSuccess('Registration successful! Redirecting...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setRegisterError(error.message || 'Registration failed');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Axis</h1>
        
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loginError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {loginSuccess && (
                    <Alert className="mb-4 bg-green-500/10 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{loginSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-primary hover:underline"
                    >
                      Register
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {registerError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {registerSuccess && (
                    <Alert className="mb-4 bg-green-500/10 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{registerSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-first-name">First Name</Label>
                        <Input
                          id="register-first-name"
                          placeholder="John"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-last-name">Last Name</Label>
                        <Input
                          id="register-last-name"
                          placeholder="Doe"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Register
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-primary hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}