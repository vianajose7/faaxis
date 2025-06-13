import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const [calculatorData, setCalculatorData] = useState<{ calculatorId?: string; result?: string } | null>(null);

  useEffect(() => {
    // Analytics tracking could go here
    console.log("Payment success page viewed");
    
    // Retrieve calculator data from sessionStorage if it exists
    try {
      const storedData = sessionStorage.getItem('calculatorData');
      if (storedData) {
        setCalculatorData(JSON.parse(storedData));
      }
    } catch (err) {
      console.error('Error retrieving calculator data:', err);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="max-w-lg mx-auto my-10">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl lg:text-3xl">Welcome to Premium!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your premium membership has been activated
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-3 py-4">
            <p>
              Your payment of <span className="font-semibold">$299.00</span> has been processed successfully.
            </p>
            <p className="text-muted-foreground">
              You now have access to all premium features and content.
            </p>
            {!user && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md text-left">
                <h3 className="text-base font-medium text-amber-800 dark:text-amber-300 mb-2">
                  🎉 You're in! Create your login to unlock everything.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  To access all premium features and keep track of your subscription, create an account now.
                </p>
              </div>
            )}
            
            {/* Show calculator data if available */}
            {calculatorData && (calculatorData.result || calculatorData.calculatorId) && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-left">
                <div className="flex items-center mb-2">
                  <Calculator className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Calculator Information Saved</h3>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {calculatorData.calculatorId && (
                    <p className="mb-1">Calculator: {calculatorData.calculatorId}</p>
                  )}
                  {calculatorData.result && (
                    <p>Result: {calculatorData.result}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to Dashboard" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}