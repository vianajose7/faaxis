import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of component to avoid recreating on each render
// Use the environment variable for the Stripe key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log("Using live Stripe key from environment:", stripeKey);
// Initialize Stripe with the key - this is a Promise that resolves to the Stripe instance
const stripePromise = loadStripe(stripeKey);

// Component for the checkout form
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (createError) {
        throw new Error(createError.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      // Process payment with our backend
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: 99.99, // Example amount, adjust as needed
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.requiresAction && result.clientSecret) {
          // Handle 3D Secure authentication if needed
          const { error: actionError } = await stripe.confirmCardPayment(result.clientSecret);
          if (actionError) {
            throw new Error(actionError.message);
          } else {
            // Payment succeeded after 3D Secure authentication
            toast({
              title: "Payment successful!",
              description: "Thank you for your purchase.",
            });
            navigate('/payment-success');
          }
        } else {
          throw new Error(result.error || "Payment failed");
        }
      } else {
        // Payment succeeded immediately
        toast({
          title: "Payment successful!",
          description: "Thank you for your purchase.",
        });
        navigate('/payment-success');
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast({
        title: "Payment failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Enhanced card options to ensure proper rendering - uses official Stripe styling
  const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    iconStyle: 'solid' as const,
    style: {
      base: {
        iconColor: '#6772E5',
        color: '#32325d',
        fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        lineHeight: '24px',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
        ':-webkit-autofill': {
          color: '#32325d',
        },
      },
      invalid: {
        iconColor: '#ef2961',
        color: '#ef2961',
        '::placeholder': {
          color: '#FFCCA5',
        },
      },
      complete: {
        iconColor: '#4CAF50',
        color: '#4CAF50',
      }
    },
  };

  // Check if Stripe is loaded
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    if (stripe) {
      setStripeReady(true);
    }
  }, [stripe]);

  return (
    <form onSubmit={handleSubmit} className="w-full stripe-form">
      <div className="mb-6">
        <label htmlFor="card-element" className="block text-sm font-medium mb-2">
          Card details
        </label>
        <div className="p-4 border rounded-md bg-white stripe-container">
          {!stripeReady && (
            <div className="py-4 text-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
              Loading payment form...
            </div>
          )}
          
          {/* Payment card icons */}
          <div className="flex mb-4 justify-end">
            <div className="flex space-x-1">
              <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-6" />
              <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="h-6" />
              <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-6" />
              <img src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg" alt="Discover" className="h-6" />
            </div>
          </div>
          
          <div className="stripe-element-container p-3 border border-gray-200 rounded-md bg-white shadow-sm hover:border-gray-300 transition-colors">
            <CardElement 
              id="card-element" 
              options={CARD_ELEMENT_OPTIONS} 
              className={`${stripeReady ? 'block' : 'hidden'}`}
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay $99.99</>
        )}
      </Button>
    </form>
  );
};

const CheckoutPage = () => {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Payment form */}
      <div className="py-12 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-full max-w-md mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
        </div>
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Complete your purchase</CardTitle>
            <CardDescription>
              Enter your payment details to access premium features
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
            <p className="mb-2">
              Your payment is secure and encrypted. We do not store your card details.
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure payment processing</span>
            </div>
            
            {/* Stripe branding */}
            <div className="flex flex-col w-full mt-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-gray-500">Powered by</span>
                <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.99c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.02-13.17 4.02-.86v3.54h3.14V9.1h-3.14v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#6772E5" fillRule="evenodd"></path>
                </svg>
              </div>
              <div className="flex items-center mt-3">
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span className="text-xs text-gray-600">SSL encrypted payment</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Purple background with value proposition */}
      <div className="hidden md:flex items-center justify-center bg-purple-700 text-white p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">🔓 Unlock Premium Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Access detailed advisor transition tools</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Advanced practice valuation calculator</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Premium marketplace listings</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Priority support from industry experts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;