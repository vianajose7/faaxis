import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Dedicated component for Stripe checkout
export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  console.log("CheckoutForm rendering with clientSecret:", clientSecret);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js hasn't loaded yet");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('idle');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        setErrorMessage(error.message || 'An unexpected error occurred');
        setPaymentStatus('error');
        
        toast({
          title: 'Payment Failed',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        
        // Redirect to success page after short delay
        setTimeout(() => {
          setLocation('/payment-success');
        }, 1500);
      } else {
        setPaymentStatus('error');
        setErrorMessage('Payment status unknown. Please contact support.');
        
        toast({
          title: 'Payment Status Unknown',
          description: 'Please check your email for confirmation or contact our support team.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      setPaymentStatus('error');
      
      toast({
        title: 'Payment Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Thank you for your purchase. You will be redirected shortly.
        </p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="stripe-form space-y-6"
      id="payment-form"
    >
      <div className="py-2">
        <PaymentElement 
          id="payment-element" 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }} 
        />
      </div>
      
      {errorMessage && (
        <div className="flex items-start text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          'Complete Payment'
        )}
      </Button>
      
      <div className="text-xs text-center text-muted-foreground">
        By submitting payment, you agree to our Terms of Service and Privacy Policy.
      </div>
    </form>
  );
}