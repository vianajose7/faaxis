import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, CreditCard } from "lucide-react";

export default function StripeTestSimplePage() {
  const { toast } = useToast();
  const [stripeKey, setStripeKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Test Stripe key
  const handleTestKey = async () => {
    setIsLoading(true);
    
    try {
      // Just verify the key starts with pk_
      if (stripeKey.startsWith('pk_')) {
        toast({
          title: "Valid key format",
          description: "The key appears to be in the correct format (starts with pk_).",
        });
        
        // Store in localStorage for testing
        localStorage.setItem('stripe_test_key', stripeKey);
        
        setIsSuccess(true);
        
        // Environment variable check
        const envValue = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        if (envValue) {
          toast({
            title: "Environment variable present",
            description: `VITE_STRIPE_PUBLIC_KEY starts with: ${envValue.substring(0, 4)}...`,
          });
        } else {
          toast({
            title: "Environment variable missing",
            description: "VITE_STRIPE_PUBLIC_KEY is not set in environment",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid key format",
          description: "Stripe publishable keys should start with 'pk_'",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while testing the key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Populate from environment variable if available
  useEffect(() => {
    const envValue = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (envValue) {
      setStripeKey(envValue);
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="mt-10 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Simple Stripe Key Test</CardTitle>
            <CardDescription>
              Verify your Stripe publishable key is configured correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stripe Publishable Key</h3>
              <p className="text-sm text-muted-foreground">
                Enter your Stripe publishable key to verify it's in the correct format
              </p>
              
              <div className="space-y-2">
                <Input 
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  placeholder="pk_test_..."
                  disabled={isSuccess}
                />
                
                <p className="text-xs text-muted-foreground">
                  Publishable keys start with 'pk_test_' for test mode or 'pk_live_' for production
                </p>
              </div>
              
              <Button 
                onClick={handleTestKey}
                disabled={!stripeKey || isLoading || isSuccess}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Key...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Key Verified
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Test Key
                  </>
                )}
              </Button>
              
              {isSuccess && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Key Verified Successfully
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <p>
                          The key is in the correct format for a Stripe publishable key.
                          This key has been saved for testing.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            window.location.href = "/test-stripe";
                          }}
                        >
                          Continue to Stripe Test Page
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              This is a simple test to validate that your Stripe publishable key is in the correct format
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}