
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Check, Star, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdvisorInfo } from "@/hooks/use-advisor-info";
import { useAuth } from "@/hooks/use-auth";
import CheckoutForm from '@/components/stripe/checkout-form';
import { ErrorBoundary } from 'react-error-boundary';
import { Link } from 'wouter';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

// Error fallback component specific for payment processing
function PaymentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle>Payment System Error</CardTitle>
          <CardDescription>
            We encountered an issue with the payment system
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            {error.message || "Something went wrong with the payment processing system. Please try again later."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={resetErrorBoundary} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const testimonials = [
  {
    quote: "FA Axis helped me secure a deal worth $2.3M more than originally offered.",
    author: "Michael R.",
    role: "Senior Advisor",
    stars: 5
  },
  {
    quote: "The calculator predictions were within 6% of actual offers received.",
    author: "David K.",
    role: "Team Lead",
    stars: 5
  },
  {
    quote: "Used the insights to negotiate an additional $450K in upfront money.",
    author: "Robert M.",
    role: "Portfolio Manager",
    stars: 5
  }
];

// Main checkout component wrapped with error boundary
function CheckoutPageContent() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { advisorInfo } = useAdvisorInfo();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      setIsLoading(true);
      try {
        console.log("Initializing premium membership payment...");
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerInfo: {
              name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
              email: user?.username || '',
            }
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Payment service error:", data);
          toast({
            title: "Payment Service Error",
            description: data.message || "Could not initialize payment. Please try again later.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        toast({
          title: "Payment Service Error",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left side - Payment form */}
        <div className="py-12 px-4 md:px-8 lg:px-12 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Complete your purchase</CardTitle>
              <CardDescription>
                Enter your payment details to unlock premium features
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Initializing payment form...</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#635BFF',
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                      colorDanger: '#ef4444',
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue"',
                      spacingUnit: '4px',
                      borderRadius: '8px',
                    },
                    rules: {
                      '.Tab': {
                        border: '1px solid #E0E0E0',
                        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03)',
                        borderRadius: '6px',
                      },
                      '.Tab--selected': {
                        borderColor: '#635BFF',
                        boxShadow: '0px 1px 1px rgba(99, 91, 255, 0.2)',
                      }
                    }
                  },
                }}>
                  <CheckoutForm clientSecret={clientSecret} />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-destructive font-medium mb-2">Payment Service Unavailable</p>
                  <p className="text-muted-foreground">
                    We're having trouble connecting to our payment service. Please try again later.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-start space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://salesforceventures.com/wp-content/uploads/2022/05/stripe-logo-blue-copy.png?w=1024" 
                  alt="Stripe" 
                  className="h-7 w-auto" 
                />
                <span className="text-sm text-muted-foreground">Secure payment processing</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-xs text-muted-foreground">256-bit SSL encryption for maximum security</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your payment information is secure and encrypted. We do not store your card details.
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Right side - Value proposition with testimonials */}
        <div className="hidden md:flex flex-col justify-center bg-primary p-12 text-primary-foreground">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 animate-bounce" style={{animation: "softBounce 3s ease-in-out infinite"}}>🔓 Unlock Premium Features</h2>
            <ul className="space-y-4 mb-12">
              <li className="flex items-start" style={{ animation: 'slideIn 0.4s ease-out 0.1s both' }}>
                <Check className="h-6 w-6 mr-3 mt-0.5 text-white" />
                <span>Detailed Year-by-Year Breakdown of compensation over a 10-year period</span>
              </li>
              <li className="flex items-start" style={{ animation: 'slideIn 0.4s ease-out 0.2s both' }}>
                <Check className="h-6 w-6 mr-3 mt-0.5 text-white" />
                <span>Firm-Specific Payout Grids for every major firm</span>
              </li>
              <li className="flex items-start" style={{ animation: 'slideIn 0.4s ease-out 0.3s both' }}>
                <Check className="h-6 w-6 mr-3 mt-0.5 text-white" />
                <span>Tax Implications Analysis for different types of transition deals</span>
              </li>
              <li className="flex items-start" style={{ animation: 'slideIn 0.4s ease-out 0.4s both' }}>
                <Check className="h-6 w-6 mr-3 mt-0.5 text-white" />
                <span>Team Compensation Modeling for multi-advisor transitions</span>
              </li>
            </ul>

            <div className="h-[200px] relative">
              {testimonials.map((testimonial, index) => {
                return (
                  <div 
                    key={index} 
                    className="bg-white/10 rounded-lg p-4 transition-all duration-500 shadow-lg absolute w-full"
                    style={{
                      animation: `testimonialSlide 9s linear ${index * 3}s infinite`,
                      opacity: 0,
                      transform: 'translateY(20px)',
                      zIndex: testimonials.length - index
                    }}
                  >
                    <div className="flex mb-2">
                      {[...Array(testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" style={{
                          animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                        }} />
                      ))}
                    </div>
                    <p className="mb-3 text-sm">{testimonial.quote}</p>
                    <div className="text-sm opacity-80">
                      <strong>{testimonial.author}</strong> · {testimonial.role}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Testimonial animations added via CSS in index.css */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a wrapped component with error boundary
export default function CheckoutPage() {
  return (
    <ErrorBoundary
      FallbackComponent={PaymentErrorFallback}
      onReset={() => window.location.reload()}
    >
      <CheckoutPageContent />
    </ErrorBoundary>
  );
}
