import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdvisorInfo } from "@/hooks/use-advisor-info";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { defaultAdvisorInfo } from "@/hooks/use-advisor-info";

export default function TestStripePage() {
  const { toast } = useToast();
  const { setAdvisorInfo } = useAdvisorInfo();
  const [, navigate] = useLocation();
  
  // Set up test data and navigate to checkout
  const handleStartCheckout = () => {
    // Set default advisor info
    setAdvisorInfo({
      ...defaultAdvisorInfo,
      aum: 150000000, // $150 million AUM
      revenue: 1500000, // $1.5 million revenue
      feeBasedPercentage: 85, // 85% fee-based
      city: "New York",
      state: "NY",
      currentFirm: "Merrill Lynch"
    });
    
    toast({
      title: "Test data set",
      description: "Navigating to checkout page",
    });
    
    // Navigate to checkout page
    setTimeout(() => {
      navigate("/checkout");
    }, 1000);
  };
  
  // Test create payment intent directly
  const handleTestPaymentIntent = async () => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount: 199 });
      const data = await response.json();
      
      toast({
        title: "Payment Intent Created",
        description: `Client Secret: ${data.clientSecret.substring(0, 10)}...`,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast({
        title: "Error",
        description: "Failed to create payment intent. Check console for details.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="mt-10 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Stripe Integration</CardTitle>
            <CardDescription>
              Tools for testing Stripe payment functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Step 1: Test Payment Intent API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will test the server's ability to communicate with Stripe and create a payment intent.
              </p>
              <Button onClick={handleTestPaymentIntent}>
                Test Create Payment Intent
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Step 2: Test Complete Checkout Flow</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will set up test data and navigate to the checkout page to test the full payment flow.
              </p>
              <Button onClick={handleStartCheckout}>
                Start Test Checkout
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Note: You will need to use a test card like 4242 4242 4242 4242 with any future expiry date and CVC.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}