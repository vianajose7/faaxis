import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Loader2, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Simplify the admin login page to use a two-step password + email OTP flow
export default function AdminLoginPage() {
  // Two step process: password then OTP
  const [step, setStep] = useState<'password' | 'otp'>('password');
  
  // Form state
  const [email, setEmail] = useState(''); // Admin email will be entered by user
  const [password, setPassword] = useState('');
  const [otpKey, setOtpKey] = useState('');
  const [code, setCode] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Submit admin password and email to get OTP
      const response = await fetch('/api/admin-auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, email }),
        credentials: 'include', // Must include to send/receive the session cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Store the OTP key for verification
      setOtpKey(data.otpKey);
      
      // Show success message and move to OTP step
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your email for a 6-digit verification code.',
      });
      
      setStep('otp');
      
      // No dev mode bypass or visible codes - security is enforced even in development
      // Verification codes will only be available in email
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Please check your password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use XMLHttpRequest to avoid issues with fetch JSON parsing
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin-auth/verify-code', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success - redirect to admin dashboard
          toast({
            title: 'Login Successful',
            description: 'You are now logged in as an administrator.',
          });
          
          // Redirect to secure management portal
          setTimeout(() => {
            window.location.href = '/secure-management-portal';
          }, 1000);
        } else {
          // Error handling
          let errorMessage = 'Verification failed';
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.error) {
              errorMessage = response.error;
            }
          } catch (e) {
            // If JSON parsing fails, use default error message
          }
          
          toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: errorMessage,
          });
        }
        setIsLoading(false);
      };
      
      xhr.onerror = function() {
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'Failed to connect to the server. Please try again.',
        });
        setIsLoading(false);
      };
      
      xhr.send(JSON.stringify({ otpKey, code }));
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired verification code',
      });
      setIsLoading(false);
    }
  };

  // Check session status when component mounts
  useEffect(() => {
    // Try to check if the user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include', // Important for sending cookies
        });
        
        // If we get a 200 response, user is already logged in
        if (response.status === 200) {
          const userData = await response.json();
          
          // If already logged in and is admin, redirect to admin dashboard
          if (userData.isAdmin) {
            setTimeout(() => {
              window.location.href = '/secure-management-portal';
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, []);

  // Handle digit input for verification code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setCode(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">
            Management Portal
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure access for Financial Advisor Axis administrators
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              {step === 'password' ? (
                <Lock className="w-6 h-6 text-primary" />
              ) : (
                <KeyRound className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {step === 'password' ? 'Admin Login' : 'Verification Required'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'password' 
                ? 'Enter your administrator password' 
                : 'Enter the verification code sent to your email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'password' ? (
              <form onSubmit={requestOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Email</label>
                  <Input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your administrator email address
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Password</label>
                  <Input
                    type="password"
                    placeholder="Enter administrator password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !password || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/admin-reset")} 
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={handleCodeChange}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Log In"
                  )}
                </Button>
                
                <Separator />
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('password')}
                  disabled={isLoading}
                >
                  ← Back to Password Entry
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-muted-foreground">
              Protected administrator area. Unauthorized access attempts will be logged.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}