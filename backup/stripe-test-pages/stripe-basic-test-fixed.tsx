import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Check, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Function to safely load Stripe
const getStripePromise = () => {
  const key = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
  
  // Verify that it's a publishable key
  if (!key) {
    console.error("Missing Stripe publishable key");
    return null;
  }
  
  if (!key.startsWith('pk_')) {
    console.error("Invalid Stripe publishable key. Keys should start with 'pk_'");
    return null;
  }
  
  // Check if we're in test or live mode
  const isTestMode = key.startsWith('pk_test_');
  const mode = isTestMode ? 'test' : 'live';
  
  console.log(`Initializing Stripe with ${mode} mode key`);
  return loadStripe(key);
};

function StripeTestForm({ amount }: { amount: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  
  // Parse the amount for display
  const displayAmount = parseFloat(amount).toFixed(2);
  
  // Check if we're in test mode
  useEffect(() => {
    const checkTestMode = async () => {
      try {
        const response = await apiRequest("GET", "/api/check-stripe-config");
        const data = await response.json();
        setIsTestMode(data.isTestMode === true);
      } catch (error) {
        console.error("Failed to check Stripe mode:", error);
      }
    };
    
    checkTestMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Stripe not ready",
        description: "Please wait for Stripe to initialize",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/stripe-basic-test?success=true",
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
        console.error("Payment error:", error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentCompleted(true);
        toast({
          title: "Payment Successful",
          description: "Test payment completed successfully!",
        });
      }
    } catch (err) {
      console.error("Stripe error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentCompleted) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Your test payment was processed successfully.
        </p>
        <Button onClick={() => window.location.reload()}>
          Test Another Payment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {isTestMode ? (
        <div className="bg-muted p-3 rounded-md text-sm">
          <p className="flex items-center text-muted-foreground mb-2">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
            Use test card: <span className="font-mono mx-1">4242 4242 4242 4242</span> 
            with any future expiry date and CVC
          </p>
          <div className="text-xs text-muted-foreground">
            Other test cards:
            <ul className="mt-1 space-y-1">
              <li><span className="font-mono">4000 0027 6000 3184</span> - 3D Secure authentication</li>
              <li><span className="font-mono">4000 0000 0000 9995</span> - Insufficient funds decline</li>
              <li><span className="font-mono">4000 0000 0000 0002</span> - Generic decline</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md text-sm">
          <p className="flex items-center text-yellow-800 dark:text-yellow-300 mb-2">
            <ShieldAlert className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
            <strong>LIVE MODE:</strong> Real credit cards will be charged
          </p>
          <div className="text-xs text-yellow-800 dark:text-yellow-300">
            <p className="mb-1">Important notes for live mode:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Test cards (4242...) will be rejected in live mode</li>
              <li>For testing in live mode, use a real card with small amounts</li>
              <li>The error "invalid card" often means the card is not supported or declined</li>
              <li>For production use, additional security features like 3D Secure may be required</li>
            </ul>
          </div>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing {isTestMode ? "Test" : "Live"} Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${displayAmount} {isTestMode ? "(Test Mode)" : "(Live Mode)"}
          </>
        )}
      </Button>
    </form>
  );
}

function CreatePaymentIntentForm() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("4.99");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isTestMode, setIsTestMode] = useState(true);
  const stripePromise = getStripePromise();
  
  // Check Stripe mode
  useEffect(() => {
    const checkMode = async () => {
      try {
        // Check server config for live/test mode
        const response = await apiRequest("GET", "/api/check-stripe-config");
        const data = await response.json();
        setIsTestMode(data.isTestMode === true);
      } catch (error) {
        console.error("Failed to check Stripe mode:", error);
      }
    };
    
    checkMode();
  }, []);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: numAmount 
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      
      toast({
        title: "Payment Intent Created",
        description: "You can now proceed with the test payment",
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast({
        title: "Error",
        description: "Failed to create payment intent. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#0ea5e9',
              },
            },
          }}
        >
          {isTestMode && (
            <div className="bg-green-100 dark:bg-green-900 border-2 border-green-500 p-3 rounded-md mb-4">
              <div className="flex items-center justify-center gap-2 bg-green-200 dark:bg-green-800 py-1 px-2 rounded mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-700 dark:text-green-300 text-sm uppercase tracking-wider">
                  Test Mode Active
                </span>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                No real cards will be charged. Use test cards like 4242 4242 4242 4242.
              </p>
            </div>
          )}
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Payment intent created successfully! Complete the payment below.
            </p>
          </div>
          <StripeTestForm amount={amount} />
        </Elements>
      ) : (
        <form onSubmit={handleCreateIntent} className="space-y-4">
          {isTestMode && (
            <div className="bg-green-100 dark:bg-green-900 border-2 border-green-500 p-3 rounded-md mb-4">
              <div className="flex items-center justify-center gap-2 bg-green-200 dark:bg-green-800 py-1 px-2 rounded mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-700 dark:text-green-300 text-sm uppercase tracking-wider">
                  Test Mode Active
                </span>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                You are in test mode. No real cards will be charged.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.50"
              max="100"
            />
            <p className="text-xs text-muted-foreground">
              Enter {isTestMode ? 'a test' : 'an'} amount between $0.50 and $100
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Payment Intent...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Create {isTestMode ? 'Test' : 'Live'} Payment Intent
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

function StripeConfigCheck() {
  const [isChecking, setIsChecking] = useState(true);
  const [publicKey, setPublicKey] = useState("");
  const [hasSecretKey, setHasSecretKey] = useState(false);
  const [hasWebhookKey, setHasWebhookKey] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isPublicKeyTestMode, setIsPublicKeyTestMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkConfig = async () => {
      setIsChecking(true);

      try {
        // Check publishable key
        const pubKey = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
        if (pubKey) {
          const masked = `${pubKey.substring(0, 8)}...${pubKey.substring(pubKey.length - 4)}`;
          setPublicKey(masked);
          setIsPublicKeyTestMode(pubKey.startsWith('pk_test_'));
          
          if (!pubKey.startsWith('pk_')) {
            toast({
              title: "Invalid Publishable Key",
              description: "Your VITE_STRIPE_PUBLIC_KEY does not start with 'pk_'",
              variant: "destructive",
            });
          } else if (!pubKey.startsWith('pk_test_')) {
            toast({
              title: "Live Mode Publishable Key",
              description: "Your VITE_STRIPE_PUBLIC_KEY is set to a live mode key that starts with 'pk_live_'",
            });
          }
        } else {
          toast({
            title: "Missing Publishable Key",
            description: "VITE_STRIPE_PUBLIC_KEY is not set in environment",
            variant: "destructive",
          });
        }

        // Check server config
        const response = await apiRequest("GET", "/api/check-stripe-config");
        const data = await response.json();
        
        setHasSecretKey(data.hasSecretKey);
        setHasWebhookKey(data.hasWebhookKey);
        setIsTestMode(data.isTestMode);
        
        if (!data.hasSecretKey || !data.hasWebhookKey) {
          toast({
            title: "Incomplete Stripe Configuration",
            description: "One or more server-side Stripe keys are missing",
            variant: "destructive",
          });
        }
        
        if (!data.isTestMode) {
          toast({
            title: "Live Mode Configuration",
            description: "Your STRIPE_SECRET_KEY is set to a live mode key that starts with 'sk_live_'",
          });
        }

        // Display the current mode in a focused toast
        toast({
          title: `Stripe ${data.isTestMode ? 'Test' : 'Live'} Mode`,
          description: `Your Stripe integration is currently in ${data.isTestMode ? 'TEST' : 'LIVE'} mode`,
          variant: data.isTestMode ? "default" : "destructive",
        });

      } catch (error) {
        console.error("Config check error:", error);
        toast({
          title: "Configuration Check Failed",
          description: "Failed to verify Stripe configuration",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkConfig();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={publicKey ? (isPublicKeyTestMode ? 'border-green-500' : 'border-yellow-500') : 'border-red-500'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publishable Key</CardTitle>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : publicKey ? (
              <div className="space-y-1">
                <p className="text-xs font-mono">{publicKey}</p>
                {isPublicKeyTestMode ? (
                  <p className="text-xs text-green-500">✓ Test Mode</p>
                ) : (
                  <p className="text-xs text-yellow-500">⚠ Live Mode</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-500">Not configured</p>
            )}
          </CardContent>
        </Card>
        
        <Card className={hasSecretKey ? (isTestMode ? 'border-green-500' : 'border-yellow-500') : 'border-red-500'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Secret Key</CardTitle>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasSecretKey ? (
              <div className="space-y-1">
                <p className="text-xs text-green-500">✓ Configured</p>
                {isTestMode ? (
                  <p className="text-xs text-green-500">✓ Test Mode</p>
                ) : (
                  <p className="text-xs text-yellow-500">⚠ Live Mode</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-500">Not configured</p>
            )}
          </CardContent>
        </Card>
        
        <Card className={hasWebhookKey ? 'border-green-500' : 'border-red-500'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Webhook Secret</CardTitle>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasWebhookKey ? (
              <p className="text-xs text-green-500">✓ Configured</p>
            ) : (
              <p className="text-xs text-red-500">Not configured</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Required Stripe Configuration</h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-start">
            <span className="font-bold mr-2">VITE_STRIPE_TEST_PUBLIC_KEY:</span> 
            <span>Your Stripe test publishable key (starts with pk_test_)</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">STRIPE_TEST_SECRET_KEY:</span> 
            <span>Your Stripe test secret key (starts with sk_test_)</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">STRIPE_WEBHOOK_SECRET:</span> 
            <span>Your Stripe webhook signing secret (starts with whsec_)</span>
          </li>
        </ul>
      </div>
      
      {(!isTestMode || !isPublicKeyTestMode) && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-4 rounded-md">
          <h3 className="font-medium mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Live Mode Notice
          </h3>
          <div className="text-sm">
            <p>One or more of your Stripe keys are in live mode. This means:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Real credit cards will be charged</li>
              <li>Test cards like 4242 4242 4242 4242 will not work</li>
              <li>Transactions will appear in your Stripe dashboard</li>
            </ul>
            <p className="mt-2 font-semibold">Ensure you are using production-ready code before processing live payments.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveModeTabIndicator() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  useEffect(() => {
    const checkLiveMode = async () => {
      try {
        const response = await apiRequest("GET", "/api/check-stripe-config");
        const data = await response.json();
        
        // If secret key is in live mode OR public key is in live mode
        const pubKey = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
        const isPublicKeyLiveMode = pubKey ? !pubKey.startsWith('pk_test_') : false;
        
        setIsLiveMode(data.isTestMode === false || isPublicKeyLiveMode);
      } catch (error) {
        console.error("Failed to check Stripe mode:", error);
      }
    };
    
    checkLiveMode();
  }, []);
  
  if (!isLiveMode) return null;
  
  return (
    <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" title="Live Mode Active"></span>
  );
}

function LiveModeFooter() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in live mode
    const checkLiveMode = async () => {
      try {
        const response = await apiRequest("GET", "/api/check-stripe-config");
        const data = await response.json();
        
        // If secret key is in live mode OR public key is in live mode
        const pubKey = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
        const isPublicKeyLiveMode = pubKey ? !pubKey.startsWith('pk_test_') : false;
        
        setIsLiveMode(data.isTestMode === false || isPublicKeyLiveMode);
      } catch (error) {
        console.error("Failed to check Stripe mode:", error);
        // Default to showing test mode notice
        setIsLiveMode(false);
      }
    };
    
    checkLiveMode();
  }, []);
  
  if (isLiveMode) {
    return (
      <div className="flex items-start space-x-2">
        <ShieldAlert className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
        <p>
          <span className="font-semibold text-yellow-500">LIVE MODE ACTIVE</span>
          <span className="block mt-1">
            Real credit cards will be charged. Transactions will appear in your Stripe dashboard and bank account.
          </span>
        </p>
      </div>
    );
  }
  
  // Default test mode notice
  return (
    <p>
      This is a test mode payment. No actual charges will be made.
      Use the test card number 4242 4242 4242 4242 with any future
      expiry date and CVC.
    </p>
  );
}

export default function StripeBasicTestPage() {
  // Check URL parameters to determine the initial tab
  const queryParams = new URLSearchParams(window.location.search);
  const tabParam = queryParams.get('tab');
  const defaultTab = tabParam === 'payment' ? 'payment' : 'config';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="max-w-3xl mx-auto my-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Stripe Integration Test</h1>
          <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">Test Environment</span>
          </div>
        </div>
        
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="payment" className="relative group">
              <LiveModeTabIndicator />
              Payment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Stripe Configuration Check</CardTitle>
                <CardDescription>
                  Verify your Stripe integration setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StripeConfigCheck />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Testing</CardTitle>
                <CardDescription>
                  Create a payment intent and complete the payment process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreatePaymentIntentForm />
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <LiveModeFooter />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}