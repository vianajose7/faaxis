import { useState, useEffect } from "react";
import { useElements, Elements, PaymentElement, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Loader2, Lock } from "lucide-react";
import { Link } from "wouter";

// Initialize Stripe once outside of the component to prevent re-initialization on each render
// Prioritize test key if available
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripeKey) {
  console.error('Missing Stripe public key in environment variables');
}
// Only use this variable internally for code logic, don't display it to users
const isTestMode = stripeKey?.startsWith('pk_test_');
const stripePromise = loadStripe(stripeKey as string);

// Form component
function SubmitFirmPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [, navigate] = useLocation();
  
  // Get form data from URL parameters if available
  const searchParams = new URLSearchParams(window.location.search);
  const firmName = searchParams.get('firmName') || '';
  const contactName = searchParams.get('contactName') || '';
  const contactEmail = searchParams.get('contactEmail') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate a unique payment token to identify this transaction
      const paymentToken = `firm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Process the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + `/submit-firm?success=true&firmName=${encodeURIComponent(firmName)}`,
          payment_method_data: {
            billing_details: {
              name: contactName,
              email: contactEmail,
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error("Payment error:", error);
        let errorMessage = error.message || "Payment failed. Please try again.";
        
        // Handle common Stripe errors with more user-friendly messages
        if (error.type === 'card_error') {
          switch(error.code) {
            case 'card_declined':
              errorMessage = "Your card was declined. Please try another payment method.";
              break;
            case 'expired_card':
              errorMessage = "Your card has expired. Please use another card.";
              break;
            case 'incorrect_cvc':
              errorMessage = "The security code (CVC) is incorrect. Please check and try again.";
              break;
            case 'processing_error':
              errorMessage = "An error occurred while processing your card. Please try again.";
              break;
            default:
              errorMessage = error.message || "There was an issue with your card. Please try again.";
          }
        }
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Thank you for your submission. We'll review and add your firm soon.",
        });
        
        setIsSuccess(true);
        
        // Redirect to success page after a brief delay
        setTimeout(() => {
          navigate(`/submit-firm?success=true&firmName=${encodeURIComponent(firmName)}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="dark:text-foreground dark:bg-background py-4">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full py-6" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay $49 to Submit Firm
          </>
        )}
      </Button>
    </form>
  );
}

// Main payment page
export default function SubmitFirmPaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Get form data from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const firmName = searchParams.get('firmName');
    const contactName = searchParams.get('contactName');
    const contactEmail = searchParams.get('contactEmail');
    
    // Make sure we have the minimum required data
    if (!firmName || !contactName || !contactEmail) {
      toast({
        title: "Information Required",
        description: "Please complete the firm submission form first",
      });
      navigate("/submit-firm");
      return;
    }

    // Create payment intent when the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: 49,
      customerInfo: {
        name: contactName,
        email: contactEmail
      },
      metadata: {
        type: 'firm_submission',
        firmName
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
        console.error("Error creating payment intent:", error);
      });
  }, [toast, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="my-6">
            <Link href="/submit-firm">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
            </Link>
          </div>
          
          <div className="max-w-3xl mx-auto my-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-4 text-foreground">
                Submit Your Firm
              </h1>
              <p className="text-muted-foreground">
                Complete your submission with a one-time processing fee
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Benefits of Submission</CardTitle>
                  <CardDescription>
                    Why it's worth adding your firm to our database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Check className="text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Increased Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Get your firm in front of thousands of financial advisors looking for new opportunities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Check className="text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Accurate Compensation Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure your firm's deals and offers are accurately represented
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Check className="text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Industry Presence</h3>
                      <p className="text-sm text-muted-foreground">
                        Join other top firms in our comprehensive database
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Secure Payment</CardTitle>
                  <CardDescription>
                    One-time submission fee of $49
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  
                  {clientSecret ? (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'night',
                          variables: {
                            colorPrimary: '#6243FF',
                          },
                        },
                      }}
                    >
                      <SubmitFirmPaymentForm />
                    </Elements>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>All payments are secure and encrypted</span>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}