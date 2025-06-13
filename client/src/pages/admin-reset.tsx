import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Mail, KeyRound } from "lucide-react";

// Form schemas
const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  otp: z.string().length(6, "OTP code must be 6 digits"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{10,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestResetValues = z.infer<typeof requestResetSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function AdminResetPasswordPage() {
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
      email: "",
    },
  });
  
  // Form for resetting password
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resetToken || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle request password reset
  const handleRequestReset = async (data: RequestResetValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/admin-auth/request-reset", {
        email: data.email,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request password reset");
      }
      
      toast({
        title: "Reset Email Sent",
        description: "Check your email for a verification code.",
      });
      
      setResetRequested(true);
      
      // Get token from response
      const responseData = await response.json();
      setResetToken(responseData.token);
      
      // Set token in the reset form
      resetForm.setValue("token", responseData.token);
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "An error occurred while requesting a password reset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = async (data: ResetPasswordValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/admin-auth/reset", {
        token: data.token,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      
      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate("/admin-login");
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
              {resetRequested ? (
                <KeyRound className="w-6 h-6 text-primary" />
              ) : (
                <Mail className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {resetRequested ? 'Verify & Reset' : 'Request Password Reset'}
            </CardTitle>
            <CardDescription className="text-center">
              {resetRequested 
                ? 'Enter the verification code sent to your email' 
                : 'Enter your administrator email to receive a reset code'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetRequested ? (
              // Step 1: Request reset form
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@example.com" 
                            type="email" 
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              // Step 2: Reset password form
              <>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <input type="hidden" {...resetForm.register("token")} />
                    
                    <FormField
                      control={resetForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 6-digit code" 
                              maxLength={6}
                              {...field}
                              className="text-center tracking-widest text-lg" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resetForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter secure password" {...field} />
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
                            <Input type="password" placeholder="Confirm password" {...field} />
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