import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  // Add logging to debug auth page loading
  console.log("AuthPage component rendered");
  
  const [location, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Form states
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  
  // Verification code state (for 2FA flow)
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      // First check for dev usernames which is more reliable
      const devUsernames = ['dev@local', 'admin@dev-access'];
      const isDevByUsername = devUsernames.includes(user.username);
      
      // Then check ID safely with type checking
      let isDevById = false;
      if (typeof user.id === 'string' && user.id === 'dev') {
        isDevById = true;
      } else if (typeof user.id === 'number' && user.id === 9999) {
        isDevById = true;
      }
      
      // If it's a real user (not dev), redirect to dashboard
      const isRealUser = !isDevByUsername && !isDevById;
      
      if (isRealUser) {
        console.log("Auth page: Redirecting authenticated user to dashboard page", 
                   { id: user.id, username: user.username });
        // Add a short delay to avoid immediate redirects
        const timer = setTimeout(() => {
          navigate("/dashboard");
        }, 500);
        
        return () => clearTimeout(timer);
      } else {
        console.log("Auth page: Showing login form for development users");
      }
    }
  }, [user, isLoading, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync(loginData);
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
      // After successful login, we might need verification
      // Normally we'd get this from the API response
      if (loginData.username === "vianajose7@gmail.com") {
        setShowVerification(true);
        setVerificationEmail(loginData.username);
      } else {
        // Redirect to user dashboard after successful login
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 Register form submitted with data:", {
      username: registerData.username,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      hasPassword: !!registerData.password,
      hasPhone: !!registerData.phone
    });
    
    try {
      // Try direct fetch first if mutation is failing
      console.log("🔄 Attempting to register via direct fetch to debug 404 issue");
      
      // Try the JWT registration endpoint first
      console.log("🔄 Trying JWT registration endpoint at /api/jwt/register");
      const directResponse = await fetch("/api/jwt/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData),
        credentials: "include"
      });
      
      console.log("📥 Direct registration API response:", {
        status: directResponse.status,
        statusText: directResponse.statusText,
        ok: directResponse.ok
      });
      
      if (directResponse.ok) {
        // If direct request works, use the response
        const userData = await directResponse.json();
        console.log("✅ Direct registration successful:", userData);
        
        // Update the user query cache
        queryClient.setQueryData(["/api/user"], userData);
        
        toast({
          title: "Registration successful",
          description: userData.message || "Your account has been created. You are now logged in.",
        });
        
        navigate("/dashboard");
        return;
      } else {
        // If JWT registration fails, try the original endpoint as fallback
        console.log("❌ JWT registration failed, trying standard endpoint as fallback");
        const responseText = await directResponse.text();
        console.log("JWT registration error response text:", responseText);
        
        // Try the standard registration endpoint as a fallback
        console.log("🔄 Trying standard registration endpoint at /api/register");
        const standardResponse = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerData),
          credentials: "include"
        });
        
        console.log("📥 Standard registration API response:", {
          status: standardResponse.status,
          statusText: standardResponse.statusText,
          ok: standardResponse.ok
        });
        
        if (standardResponse.ok) {
          // If standard request works, use the response
          const userData = await standardResponse.json();
          console.log("✅ Standard registration successful:", userData);
          
          // Update the user query cache
          queryClient.setQueryData(["/api/user"], userData);
          
          toast({
            title: "Registration successful",
            description: userData.message || "Your account has been created. You are now logged in.",
          });
          
          navigate("/dashboard");
          return;
        } else {
          // If both endpoints fail, log the errors
          console.log("❌ Both registration endpoints failed");
          const stdResponseText = await standardResponse.text();
          console.log("Standard registration error response text:", stdResponseText);
        }
      }
      
      // Use the mutation as a fallback
      const user = await registerMutation.mutateAsync(registerData);
      console.log("✅ Registration mutation successful:", user);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You are now logged in.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      
      // Create a more detailed error message
      let errorMessage = error.message || "An error occurred during registration.";
      
      // Add context about the type of error
      if (error.message?.includes("404")) {
        errorMessage = "Registration service unavailable (404). Please try again later or contact support.";
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Send verification code to the API
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Invalid verification code");
      }
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "An error occurred during verification.",
        variant: "destructive",
      });
    }
  };
  
  // If showing verification form
  if (showVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              Please enter the verification code sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerificationSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter the 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={!verificationCode}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => window.history.back()}
          >
            ← Back to Home
          </Button>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Financial Advisor Axis</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="advisor.pro@wealthaxis.com"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password <span className="text-red-500">*</span></Label>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="p-0 h-auto text-xs text-muted-foreground"
                          onClick={() => navigate("/forgot-password")}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">First Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="register-firstName"
                          placeholder="John"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          placeholder="Doe"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="wealthbuilder@faaxis.pro"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone</Label>
                      <Input
                        id="register-phone"
                        type="tel" 
                        placeholder="(123) 456-7890"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Button 
              type="button" 
              variant="link" 
              className="p-0 h-auto text-sm ml-1"
              onClick={() => navigate("/terms")}
            >
              Terms of Service
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-primary-foreground flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 animate-fadeIn">Maximize Your Potential</h1>
          <p className="text-lg mb-6 animate-slideInRight" style={{ animationDelay: "0.3s" }}>
            Financial Advisor Axis helps financial advisors transition their practice, calculate offers, and find the right firm.
          </p>
          <ul className="space-y-2 text-left">
            <li className="flex items-center animate-slideInRight" style={{ animationDelay: "0.5s" }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Advanced Offer Calculators
            </li>
            <li className="flex items-center animate-slideInRight" style={{ animationDelay: "0.7s" }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Firm Comparison Tools
            </li>
            <li className="flex items-center animate-slideInRight" style={{ animationDelay: "0.9s" }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Practice Growth Resources
            </li>
            <li className="flex items-center animate-slideInRight" style={{ animationDelay: "1.1s" }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Transition Expertise
            </li>
          </ul>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }
          .animate-slideInRight {
            opacity: 0;
            animation: slideInRight 0.8s ease-out forwards;
          }
        ` }} />
      </div>
    </div>
  );
}