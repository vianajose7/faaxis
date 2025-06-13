import { useState } from "react";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePremium } from "@/hooks/use-premium";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Unlock } from "lucide-react";
import { useLocation } from "wouter";

// Premium features list
const PREMIUM_FEATURES = [
  "Access to all wealth management firms (25+)",
  "Detailed financial projections over 10 years",
  "Side-by-side comparisons of up to 5 firms",
  "Custom payout grid analysis",
  "Fee-based AUM breakdowns",
  "Lending & banking services integration",
  "Tax-efficient transition strategies",
  "Negotiation leverage points",
  "Equity compensation modeling",
  "Retirement plan scenarios",
  "Deferred compensation analysis",
  "International advisor options",
  "Alternative investment offerings",
  "Technology platform comparisons",
  "Downloadable PDF reports",
  "Email report sharing",
  "Customizable deal parameters",
  "Advanced filtering options"
];

interface UpgradeSectionProps {
  demo?: boolean;
}

export function UpgradeSection({ demo = false }: UpgradeSectionProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { hasPremium } = usePremium();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);
    
    if (demo) {
      // In demo mode, show a toast and redirect to calculator
      toast({
        title: "Demo Mode",
        description: "This is a demo. In the real app, this would take you to a payment page."
      });
      
      // Wait a bit and redirect to calculator
      setTimeout(() => {
        window.location.href = "/calculator?premium=true";
      }, 1000);
    } else {
      // Navigate to the checkout page which will handle the payment
      // Using direct window.location.href for more reliable navigation
      window.location.href = `/checkout?userId=${user?.id}`;
    }
    
    setIsLoading(false);
  };

  if (hasPremium) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Premium Member</CardTitle>
            <Badge className="bg-primary text-primary-foreground">Active</Badge>
          </div>
          <CardDescription>
            You have full access to all premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {PREMIUM_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Thank you for being a premium member. Your support helps us continue to provide high-quality services.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Upgrade to Premium</CardTitle>
          <Badge variant="outline" className="text-muted-foreground">Free Plan</Badge>
        </div>
        <CardDescription>
          Get access to all premium features and unlock your full potential
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Unlock className="w-4 h-4 mr-2 text-muted-foreground" />
                Free Plan
              </h3>
              <ul className="space-y-1 text-sm pl-6">
                <li className="text-muted-foreground">Basic firm comparison</li>
                <li className="text-muted-foreground">Limited to 3 firms</li>
                <li className="text-muted-foreground">Basic financial projection</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center text-primary">
                <Lock className="w-4 h-4 mr-2" />
                Premium Plan
              </h3>
              <ul className="space-y-1 text-sm pl-6">
                <li className="font-medium">All 25+ wealth management firms</li>
                <li className="font-medium">10-year detailed projections</li>
                <li className="font-medium">Custom payout grid analysis</li>
                <li className="font-medium">Fee-based AUM breakdowns</li>
                <li className="font-medium">Lending & banking services</li>
                <li className="font-medium">Negotiation leverage points</li>
                <li className="font-medium">Equity compensation modeling</li>
                <li className="font-medium">+10 more premium features</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-center text-lg font-bold mb-2">$299 <span className="text-sm font-normal text-muted-foreground">one-time payment</span></p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Lifetime access to premium features
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-[#4AFF91] hover:from-primary/90 hover:to-[#4AFF91]/90 text-white"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upgrade Now"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
        <p>No contract, cancel anytime. All plans include premium customer support.</p>
        <p className="mt-1">All your existing data will be preserved when you upgrade.</p>
      </CardFooter>
    </Card>
  );
}