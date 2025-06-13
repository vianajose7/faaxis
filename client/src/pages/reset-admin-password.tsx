import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft } from "lucide-react";

// Form schema for initial request
const requestResetSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
});

// Form schema for password reset
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestResetValues = z.infer<typeof requestResetSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetAdminPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetRequested, setResetRequested] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get the token from the URL if present
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
    }
  });
  
  // Form for requesting a reset
  const requestForm = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      username: "",
    },
  });
  
  // Form for resetting password
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle request for password reset
  const onRequestReset = async (values: RequestResetValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/forgot-password", {
        username: values.username,
      });
      
      const data = await response.json();
      
      setResetRequested(true);
      
      toast({
        title: "Password Reset Requested",
        description: "If an account exists with this email, a password reset link will be sent.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while requesting password reset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password reset
  const onResetPassword = async (values: ResetPasswordValues) => {
    if (!resetToken) {
      toast({
        title: "Invalid Request",
        description: "No reset token provided",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        token: resetToken,
        password: values.password,
      });
      
      const data = await response.json();
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "An error occurred while resetting your password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">
            Admin Password Reset
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reset your password to regain access
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              {resetToken ? "Reset Your Password" : "Forgot Your Password?"}
            </CardTitle>
            <CardDescription className="text-center">
              {resetToken 
                ? "Enter your new password below" 
                : resetRequested 
                  ? "Check your email for a reset link" 
                  : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetToken ? (
              // Reset password form
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm new password" 
                            {...field} 
                          />
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
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              // Request reset form
              <>
                {resetRequested ? (
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground mb-4">
                      We've sent a password reset link to your email if an account exists.
                      Please check your inbox and follow the instructions.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setResetRequested(false)}
                    >
                      Try Another Email
                    </Button>
                  </div>
                ) : (
                  <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
                      <FormField
                        control={requestForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email" 
                                {...field} 
                                autoComplete="email"
                              />
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
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </>
            )}
            
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                className="text-sm" 
                onClick={() => navigate("/admin-login")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}