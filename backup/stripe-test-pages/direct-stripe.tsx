import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

const stripeKey = import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

// The simplest possible checkout form
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Create a payment token to track this session
      const paymentToken = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Store user info with payment token
      await apiRequest('POST', '/api/payment-session', {
        email,
        firstName,
        lastName,
        city,
        state,
        token: paymentToken,
        amount: 19.99
      });
      
      // Get the card element 
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Use card element to create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { 
          email,
          name: `${firstName} ${lastName}`,
          address: {
            city,
            state
          }
        }
      });

      if (error) {
        throw new Error(error.message || "Payment method creation failed");
      }

      // Create a payment intent on server
      const createIntentResponse = await apiRequest('POST', '/api/create-payment-intent', {
        amount: 19.99,
        paymentToken,
        paymentMethodId: paymentMethod.id,
        customerInfo: {
          name: `${firstName} ${lastName}`,
          email,
          city,
          state
        }
      });
      
      if (!createIntentResponse.ok) {
        const errorData = await createIntentResponse.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const { clientSecret } = await createIntentResponse.json();
      
      // Confirm the payment 
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
      
      if (confirmError) {
        throw new Error(confirmError.message || "Payment confirmation failed");
      }

      // Payment succeeded
      setPaymentStatus('succeeded');
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
        variant: "default",
      });
      
      // Redirect to success page
      window.location.href = `/payment-success?token=${paymentToken}`;
    } catch (err: any) {
      console.error("Payment error:", err);
      setPaymentStatus('error');
      setErrorMessage(err.message || "An unexpected error occurred");
      toast({
        title: "Payment failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900 rounded-lg">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="mb-4 text-muted-foreground">
          Your payment has been processed successfully. You'll be redirected to the success page.
        </p>
        <Button asChild>
          <Link href="/payment-success">Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-3 border rounded-md">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Test card: 4242 4242 4242 4242 with any future expiry date and CVC
        </p>
      </div>

      {paymentStatus === 'error' && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Payment failed</p>
            <p className="text-sm text-red-600 dark:text-red-300">{errorMessage}</p>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay $19.99'
        )}
      </Button>
    </form>
  );
};

export default function DirectStripe() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="flex justify-between items-center py-4 mb-8">
        <Link href="/">
          <div className="font-bold text-xl cursor-pointer">FinancialAXIS</div>
        </Link>
        <div className="flex gap-4">
          <Link href="/">
            <span className="text-primary hover:underline">Home</span>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Simple Payment</CardTitle>
          <CardDescription>
            Complete your payment using our secure checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
          <p>Secure payment processing by Stripe. Your card details are never stored on our servers.</p>
        </CardFooter>
      </Card>
    </div>
  );
}