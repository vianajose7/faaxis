import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, Copy, AlarmClock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Form schema
const totpVerificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits")
});

type TotpVerificationValues = z.infer<typeof totpVerificationSchema>;

interface TotpSetupProps {
  username: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export function TotpSetup({ username, onVerified, onCancel }: TotpSetupProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  
  // Load QR code on component mount
  useEffect(() => {
    const loadTotpSecret = async () => {
      try {
        // Standard flow - proper security is enforced
        const response = await apiRequest("POST", "/api/generate-totp-secret", { username });
        const data = await response.json();
          
        if (data.success) {
          setQrCodeUrl(data.qrCodeUrl);
          setSecret(data.secret);
          setOtpauthUrl(data.otpauthUrl);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to generate TOTP secret",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate TOTP secret",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTotpSecret();
  }, [username, toast]);
  
  // Form definition
  const form = useForm<TotpVerificationValues>({
    resolver: zodResolver(totpVerificationSchema),
    defaultValues: {
      code: "",
    },
  });
  
  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard.`,
        });
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: `Could not copy: ${err}`,
          variant: "destructive",
        });
      }
    );
  };
  
  // Submit verification code
  const onSubmit = async (values: TotpVerificationValues) => {
    setIsVerifying(true);
    try {
      // Standard verification flow - proper security is enforced
      const response = await apiRequest("POST", "/api/verify-totp", {
        username,
        code: values.code,
      });
      
      const data = await response.json();
      
      if (data.verified) {
        toast({
          title: "TOTP Verification Successful",
          description: "Two-factor authentication has been enabled for your account",
        });
        
        // Call the verification callback
        setTimeout(() => {
          onVerified();
        }, 300);
        return;
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code",
          variant: "destructive",
        });
        form.reset();
      }
    } catch (error: any) {
      console.error("TOTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
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
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authentication app (1Password, Google Authenticator, etc.) or enter the code manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for TOTP setup" 
                  className="border border-border rounded-md p-2 bg-white" 
                />
                
                <Alert className="mt-4">
                  <AlarmClock className="h-4 w-4" />
                  <AlertTitle>Time-based codes</AlertTitle>
                  <AlertDescription>
                    The verification codes will change every 30 seconds. Make sure your device's clock is in sync.
                  </AlertDescription>
                </Alert>
                
                {secret && (
                  <div className="w-full mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Manual entry code:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-secondary p-2 rounded text-xs md:text-sm w-full overflow-x-auto whitespace-nowrap">
                        {secret}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(secret, "Secret key")}
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
                          inputMode="numeric"
                          maxLength={6}
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
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify & Enable 2FA
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </CardContent>
      
      {onCancel && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}