import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleNavbar } from "@/components/layout/navbar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Form schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(pwd => passwordRegex.test(pwd), {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Extract parameters from URL query
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");
    
    if (errorParam) {
      setIsInvalidToken(true);
      toast({
        title: "Error",
        description: decodeURIComponent(errorParam).replace(/\+/g, ' '),
        variant: "destructive",
      });
      return;
    }
    
    if (!tokenParam) {
      setIsInvalidToken(true);
      return;
    }
    
    // Set the token and validate it with the API directly
    setToken(tokenParam);
    
    // Call API to validate token
    const validateToken = async () => {
      try {
        console.log("Validating token:", tokenParam);
        const response = await apiRequest("POST", "/api/validate-reset-token", { token: tokenParam });
        
        if (!response.ok) {
          const data = await response.json();
          console.log("Token validation failed:", data);
          setIsInvalidToken(true);
          toast({
            title: "Invalid Token",
            description: data.message || "This reset link is no longer valid. Please request a new one.",
            variant: "destructive",
          });
        } else {
          console.log("Token validated successfully");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsInvalidToken(true);
        toast({
          title: "Error",
          description: "Failed to validate reset token. Please try again or request a new link.",
          variant: "destructive",
        });
      }
    };
    
    validateToken();
  }, [toast]);
  
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  
  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      setIsInvalidToken(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        token,
        password: values.password
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
        
        if (data.message === "Invalid reset token" || data.message === "Reset token has expired") {
          setIsInvalidToken(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isInvalidToken) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <SimpleNavbar />
        
        <div className="max-w-md mx-auto mt-10">
          <Alert className="my-4 border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle>Invalid or Expired Token</AlertTitle>
            <AlertDescription>
              The password reset link is invalid or has expired. Please request a new password reset link.
            </AlertDescription>
          </Alert>
          
          <Button 
            className="w-full mt-4"
            onClick={() => navigate("/forgot-password")}
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SimpleNavbar />
      
      <div className="max-w-md mx-auto mt-10">
        {submitted ? (
          <Alert className="my-4 border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Password Reset Successful</AlertTitle>
            <AlertDescription>
              Your password has been reset successfully. You will be redirected to the login page in a few seconds.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Enter a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}