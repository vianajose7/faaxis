import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { apiRequest } from '@/lib/queryClient';
// Using a simple header for this page
import { Link } from "wouter";
import { AlertTriangle, Check, CreditCard, Loader2 } from 'lucide-react';

// Simplified Stripe Payment Test Page
export default function SimpleStripePage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Get the Stripe publishable key
  const stripeKey = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  if (!stripeKey) {
    return <div>Error: Stripe publishable key is missing</div>;
  }

  const stripePromise = loadStripe(stripeKey);

  // Create a payment intent when the page loads
  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: 19.99 
        });
        
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError("Failed to set up payment. Please try again.");
        toast({
          title: "Payment Setup Error",
          description: "Could not set up payment. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    createPaymentIntent();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 border rounded-lg bg-destructive/10">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 border rounded-lg bg-green-50 dark:bg-green-950">
          <Check className="h-10 w-10 mx-auto mb-4 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          <p className="mb-4">Your payment has been processed successfully.</p>
          <Button onClick={() => window.location.reload()}>Make Another Payment</Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center py-4 mb-8">
        <Link href="/">
          <div className="font-bold text-xl cursor-pointer">FinancialAXIS</div>
        </Link>
        <div className="flex gap-4">
          <Link href="/">
            <span className="text-primary hover:underline">Home</span>
          </Link>
          <Link href="/calculator">
            <span className="text-primary hover:underline">Calculator</span>
          </Link>
        </div>
      </div>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Stripe Test</h1>
        <Card>
          <CardHeader>
            <CardTitle>Make a Test Payment</CardTitle>
            <CardDescription>
              Use test card 4242 4242 4242 4242 with any future date and CVC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ clientSecret }}
            >
              <CheckoutForm 
                onSuccess={() => setSuccess(true)}
                onError={(msg) => {
                  setError(msg);
                  toast({
                    title: "Payment Failed",
                    description: msg,
                    variant: "destructive"
                  });
                }}
              />
            </Elements>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            <p>This is a test payment. No actual charges will be made.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function CheckoutForm({ 
  onSuccess, 
  onError 
}: { 
  onSuccess: () => void; 
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique payment token
      const paymentToken = `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
      
      // First, store the user's email with the token
      await apiRequest("POST", "/api/payment-session", {
        email,
        token: paymentToken,
        amount: 19.99
      });
      
      console.log("Created payment session with token:", paymentToken);
      
      // Then confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Always include the payment token in the return URL
          return_url: `${window.location.origin}/payment-success?token=${paymentToken}`,
          receipt_email: email,
          // Add payment information for tracking
          payment_method_data: {
            billing_details: { email }
          }
        }
      });

      if (result.error) {
        // Show error to customer
        onError(result.error.message || "An error occurred with your payment");
      } else {
        // The payment succeeded
        onSuccess();
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
        />
      </div>
      
      <div className="space-y-2 bg-muted/40 p-4 rounded-md">
        <Label>Card Details</Label>
        <PaymentElement />
      </div>
      
      <Button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay $19.99
          </>
        )}
      </Button>
    </form>
  );
}