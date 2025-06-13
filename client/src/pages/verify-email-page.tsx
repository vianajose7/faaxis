import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleNavbar } from "@/components/layout/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function VerifyEmailPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    const checkVerificationStatus = () => {
      // Check if this is a redirect from server with success or error param
      const searchParams = new URLSearchParams(window.location.search);
      const success = searchParams.get("success");
      const error = searchParams.get("error");
      
      if (success === "true") {
        setIsVerified(true);
        setIsLoading(false);
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully.",
        });
        return;
      }
      
      if (error) {
        setError(decodeURIComponent(error).replace(/\+/g, ' '));
        setIsLoading(false);
        return;
      }
      
      // If no success or error param, look for a token to verify
      const token = searchParams.get("token");
      
      if (!token) {
        setError("Verification link is invalid or missing token");
        setIsLoading(false);
        return;
      }
      
      // Call the API to verify the token
      setIsLoading(true);
      apiRequest('/api/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          setIsVerified(true);
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully.",
          });
        })
        .catch(err => {
          setError(err.message || "Verification failed. The token may be invalid or expired.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    
    checkVerificationStatus();
  }, [toast]);
  
  const handleLogin = () => {
    navigate("/auth");
  };
  
  const handleContinue = () => {
    navigate("/");
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <SimpleNavbar />
        
        <div className="max-w-md mx-auto mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Verifying Your Email</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SimpleNavbar />
      
      <div className="max-w-md mx-auto mt-10">
        {isVerified ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Email Verified</CardTitle>
              <CardDescription className="text-center">
                Your email has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Thank you for verifying your email address. You now have full access to all features.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                {user ? (
                  <Button onClick={handleContinue}>Continue to Dashboard</Button>
                ) : (
                  <Button onClick={handleLogin}>Log In Now</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Verification Failed</CardTitle>
              <CardDescription className="text-center">
                We couldn't verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error || "The verification link is invalid or has expired."}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button onClick={() => navigate("/")}>Back to Home</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}