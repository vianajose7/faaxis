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
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [paymentToken, setPaymentToken] = useState("");
  
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

  // Generate a unique payment session token if one doesn't exist
  useEffect(() => {
    // Generate a random token if we don't have one yet
    if (!paymentToken) {
      const randomToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
      setPaymentToken(randomToken);
    }
  }, [paymentToken]);

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

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First save the user info to the session
      const userResponse = await apiRequest("POST", "/api/payment-session", {
        email,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || '',
        token: paymentToken,
        amount: parseFloat(amount)
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to create payment session");
      }

      // Submit card details to Stripe for processing
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect to the payment success page with the token
          return_url: window.location.origin + "/payment-success?token=" + paymentToken,
        },
        redirect: 'if_required'
      });

      // Handle immediate errors (like invalid card details)
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
        console.error("Payment error:", error);
        setIsLoading(false);
        return;
      }
      
      // If there's no immediate error and no redirect, update UI
      toast({
        title: "Processing Payment",
        description: "Your payment is being processed...",
      });
      
      // Redirect manually in case the automatic redirect didn't happen
      window.location.href = `/payment-success?token=${paymentToken}`;
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
      {/* User information section */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
        <h3 className="font-medium text-lg">Your Information</h3>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            Email Address <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            You'll use this email to access your account after payment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Payment information section */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Payment Details</h3>
        <PaymentElement 
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                email: email || undefined,
                name: firstName && lastName ? `${firstName} ${lastName}` : firstName || undefined
              }
            }
          }} 
        />
      </div>
      
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
      
      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          By proceeding with this payment, you agree to our Terms of Service and Privacy Policy. 
          After payment, you'll be able to complete your account setup.
        </p>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isLoading}
          size="lg"
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
      </div>
    </form>
  );
}

function CreatePaymentIntentForm() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("19.99");
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
              theme: 'stripe',
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

export default function StripeTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="max-w-3xl mx-auto mt-10 mb-20">
        <div className="bg-green-500 text-white py-1 px-4 rounded-t-md text-center font-medium">
          TEST MODE - No real charges will be made
        </div>
        
        <div className="border-green-500 border-2 border-t-0 rounded-b-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Stripe Payment Test</h1>
            <div className="flex items-center bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">Test Environment</span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Complete Test Payment</CardTitle>
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
        </div>
      </div>
    </div>
  );
}