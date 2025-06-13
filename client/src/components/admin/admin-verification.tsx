import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

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
import { Loader2, ShieldCheck } from "lucide-react";

// Form schema
const verificationFormSchema = z.object({
  code: z.string().length(6, "Authentication code must be 6 digits")
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

interface AdminVerificationProps {
  username: string;
  onVerified: () => void;
}

export function AdminVerification({ username, onVerified }: AdminVerificationProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  // Development bypass has been removed
  // Proper security is now enforced for all environments
  
  // Form definition
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: "",
    },
  });

  // Submit verification code - now using TOTP verification
  const onSubmit = async (values: VerificationFormValues) => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-totp", {
        username,
        code: values.code,
      });
      
      const data = await response.json();
      
      if (data.verified) {
        toast({
          title: "Verification Successful",
          description: "You now have access to the admin portal",
        });
        
        // Server will ensure the session has admin verification
        
        // Call the verification callback
        setTimeout(() => {
          onVerified();
        }, 300);
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid authentication code",
        variant: "destructive",
      });
      form.reset();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Please enter the 6-digit code from your authentication app to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit code"
                      {...field}
                      autoComplete="one-time-code"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Open your authenticator app to view your verification code
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}