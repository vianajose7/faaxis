import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2, Lock, CheckCircle } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

// Load Stripe outside of component to avoid recreating on each render
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Initialize Stripe with API key
const stripePromise = loadStripe(stripeKey);

// Component for the checkout form
function TestPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  // Handler function as per instructions
  async function handlePay() {
    try {
      setLoading(true);
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1.00 }), // $1.00
      });
      if (!res.ok) throw new Error(await res.text());
      const { clientSecret } = await res.json();
      const stripe = await stripePromise;
      if (!elements) throw new Error('Stripe elements not loaded');
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not loaded');
      
      const { error } = await stripe!.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (error) alert(error.message);
      else alert('Payment success');
    } catch (error: any) { 
      console.error(error); 
      alert(error.message); 
    }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Payment Amount: $1.00</h3>
          <div className="py-2">
            <CardElement />
          </div>
        </div>
        
        {errorMessage && (
          <div className="flex items-start text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {paymentStatus === 'succeeded' && (
          <div className="flex items-center bg-green-50 dark:bg-green-900/30 p-3 rounded-md text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>LIVE payment successful!</span>
          </div>
        )}
        
        <Button 
          type="button"
          onClick={handlePay} 
          disabled={!stripe || !elements || isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay $1.00
            </>
          )}
        </Button>
        
        <div className="text-xs text-center text-muted-foreground">
          <div className="flex items-center justify-center mb-2">
            <svg className="h-4 mr-2" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 10.4267H56.8933C56.5467 10.4267 56.24 10.6133 56.08 10.9067L52.6 17.7733L49.44 10.9067C49.28 10.6133 48.9733 10.4267 48.6267 10.4267H45.64L50.8267 20.9867L46.1067 29H49.2133C49.56 29 49.8667 28.8133 50.0267 28.52L60 10.4267ZM40 11.2133C39.08 10.6133 37.84 10.24 36.28 10.24C34.7333 10.24 33.4667 10.6133 32.5467 11.3333C31.6267 12.0533 31.1067 13.0667 31.1067 14.4C31.1067 16.9867 33.1333 18.2533 36.2 18.8533L37.5733 19.12C39.0267 19.4133 39.7467 19.84 39.7467 20.6267C39.7467 21.6533 38.6 22.36 36.8133 22.36C35.0267 22.36 33.8667 21.6533 33.3467 20.3867L30.5733 20.7333C31.3333 23.0933 33.48 24.56 36.8133 24.56C40.6 24.56 43 22.8 43 20.44C43 17.8533 40.9733 16.56 37.9867 15.96L36.6133 15.6933C35.3067 15.44 34.4667 15.0933 34.4667 14.2C34.4667 13.2667 35.4933 12.7467 36.6667 12.7467C38.0267 12.7467 38.9333 13.4133 39.4 14.52L40 11.2133ZM17.9467 10.24C16.5867 10.24 15.4267 10.7467 14.64 11.6133V10.56H11.5467V24.2H14.7733V17.6C14.7733 15.0933 16.0133 13.6267 18.1333 13.6267C18.7333 13.6267 19.3867 13.7333 19.8 13.92L20.6667 10.56C20.1467 10.3733 19.2 10.24 17.9467 10.24ZM7.78667 10.56H4.56V6.34667L1.33333 7.33333V10.56H0V13.7867H1.33333V19.7467C1.33333 22.36 2.86667 24.56 6.42667 24.56C7.36 24.56 8.4 24.3467 9.06667 24.08L8.53333 20.9067C8.08 21.0667 7.52 21.1733 7.01333 21.1733C5.86667 21.1733 4.56 20.8267 4.56 18.7333V13.7867H7.78667V10.56ZM21.5333 22.84C21.5333 23.8533 22.3333 24.6533 23.3467 24.6533C24.36 24.6533 25.16 23.8533 25.16 22.84C25.16 21.8267 24.36 21.0267 23.3467 21.0267C22.3333 21.0267 21.5333 21.8267 21.5333 22.84ZM26.6933 10.56V24.2H29.92V10.56H26.6933Z" fill="currentColor"/>
            </svg>
            Powered by Stripe
          </div>
          Secure payment processing. Your card details are never stored on our servers.
        </div>
      </form>
    </div>
  );
}

// Main page component wrapped with error boundary
function PaymentPageContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
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
        
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader>
          <CardTitle>Live Payment Test</CardTitle>
          <CardDescription>
            Process a $1.00 live payment to verify Stripe integration
          </CardDescription>
        </CardHeader>
          
        <CardContent>
          <Elements stripe={stripePromise}>
            <TestPaymentForm />
          </Elements>
        </CardContent>
          
        <CardFooter className="flex flex-col space-y-2 text-xs text-muted-foreground border-t pt-4">
          <div className="space-y-1">
            <p className="font-medium">Important:</p>
            <p>This page processes real payments using your live Stripe account.</p>
            <p>Only use a real card with a small test amount ($1.00).</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Fallback UI for error boundary
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader>
          <CardTitle>Payment Error</CardTitle>
          <CardDescription>
            There was a problem loading the payment form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-md border border-red-200 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Error Details</h3>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
          <Button onClick={resetErrorBoundary} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Root component with error boundary
export default function TestPaymentPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PaymentPageContent />
    </ErrorBoundary>
  );
}