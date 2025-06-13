import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  clientSecret: string;
}

export default function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
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
        setErrorMessage(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        setTimeout(() => setLocation('/payment-success'), 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Payment Failed</h3>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <div className="flex gap-3 mt-2">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => {
                setErrorMessage('');
                if (stripe && elements) {
                  elements.getElement(PaymentElement)?.clear();
                }
              }}
            >
              Try Again
            </Button>
          </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form space-y-6">
      <div className="py-2">
        <PaymentElement
          className="!bg-white"
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              }
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              },
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start text-sm text-red-500 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-primary hover:bg-primary/90"
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
    </form>
  );
}