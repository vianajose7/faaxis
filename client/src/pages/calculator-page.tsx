import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InitialForm } from "@/components/calculator/initial-form-new";
import { ResultsDashboard } from "@/components/calculator/results-dashboard";
import { FirmSelector } from "@/components/calculator/firm-selector";
import { CompanyProfile } from "@/components/calculator/company-profile";
import { AdvisorInfo, calculateOffers, CalculatorResults } from "@/lib/calculator";
import { useAdvisorInfo } from "@/hooks/use-advisor-info";
import { usePremium } from "@/hooks/use-premium";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDown as LucideArrowDown, ArrowRight, Lock as LockIcon, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useFirmDeals, useFirmParameters } from "@/lib/airtable-service";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DefaultChartPlaceholder, SampleKPICards } from "@/components/calculator/default-chart-placeholder";
import { TestimonialsSection } from "@/components/testimonials";
import { PremiumCTA } from "@/components/calculator/premium-cta";
import { SocialProofKPISection } from "@/components/calculator/social-proof-kpi";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState("calculator");
  const { advisorInfo, calculationResults, setAdvisorInfo, setCalculationResults } = useAdvisorInfo();
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { hasPremium } = usePremium();
  
  // The maximum number of firms non-premium users can select
  const MAX_FREE_SELECTIONS = 3;
  
  // Fetch Airtable data
  const { 
    data: firmDeals, 
    isLoading: isLoadingDeals,
    isError: isErrorDeals,
    error: dealsError
  } = useFirmDeals();
  
  const { 
    data: firmParams, 
    isLoading: isLoadingParams,
    isError: isErrorParams,
    error: paramsError
  } = useFirmParameters();
  
  // Show error toast if data fetching fails
  if (isErrorDeals && dealsError) {
    toast({
      title: "Error fetching firm deals",
      description: dealsError.message,
      variant: "destructive",
    });
  }
  
  if (isErrorParams && paramsError) {
    toast({
      title: "Error fetching firm parameters",
      description: paramsError.message,
      variant: "destructive",
    });
  }
  
  const handleCalculate = (info: AdvisorInfo, selectedFirmsList?: string[]) => {
    // Store advisor info in context
    setAdvisorInfo(info);
    
    // Use provided firms list or existing selection - don't auto-add current firm
    let firmsToCompare = selectedFirmsList || [...selectedFirms];
    
    // Set the firms to compare in state
    setSelectedFirms(firmsToCompare);
    
    // Filter results based on selected firms, or all firms if none selected
    // Pass premium status to the calculation function
    const results = calculateOffers(
      info, 
      firmParams,
      firmDeals,
      firmsToCompare.length > 0 ? firmsToCompare : undefined,
      hasPremium // Pass premium status
    );
    
    setCalculationResults(results);
  };
  
  const handleFirmSelection = (firms: string[]) => {
    setSelectedFirms(firms);
    
    // Recalculate with new firm selection if we already have advisor info
    if (advisorInfo) {
      const results = calculateOffers(
        advisorInfo, 
        firmParams,
        firmDeals,
        firms.length > 0 ? firms : undefined,
        hasPremium // Pass premium status
      );
      setCalculationResults(results);
    }
  };
  
  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="flex flex-col sm:flex-row items-center justify-between my-6">
            <h1 className="text-3xl font-bold mb-2 sm:mb-0">FA Axis Calculator</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section - On mobile it appears after KPIs/charts with order-2, on lg+ it's first (order-1) */}
            <div className="order-2 lg:order-1">
              <InitialForm 
                onCalculate={handleCalculate} 
                initialValues={advisorInfo} 
              />
            </div>
            
            {calculationResults ? (
              /* Results Dashboard Section - On mobile it appears first with order-1, on lg+ it's second (order-2) */
              <div className="lg:col-span-2 order-1 lg:order-2">
                <ResultsDashboard 
                  results={calculationResults}
                  selectedFirms={selectedFirms}
                  firmDeals={firmDeals}
                />
                
                {selectedFirms && selectedFirms.length > 0 && (
                  <CompanyProfile 
                    selectedFirms={selectedFirms} 
                    firmDeals={firmDeals} 
                  />
                )}
                
                {/* Use PremiumCTA component which already handles showing/hiding based on premium status */}
                <PremiumCTA />
                
                {/* Show the alert about firm selection limits only for non-premium users who have reached the limit */}
                {!calculationResults.isPaid && selectedFirms.length >= MAX_FREE_SELECTIONS && (
                  <Alert variant="default" className="mt-4 border-primary/30 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Premium Unlocks All Firms</AlertTitle>
                    <AlertDescription>
                      You've used all {MAX_FREE_SELECTIONS} free comparison slots. Subscribe to premium for <span className="font-medium">unlimited firm comparisons</span>, all 25+ wealth management firms, and advanced calculations.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              /* Default visualization when no calculation has been made - On mobile appears first with order-1, on lg+ it's second (order-2) */
              <div className="lg:col-span-2 order-1 lg:order-2">
                <SampleKPICards />
                <DefaultChartPlaceholder />
                
                <Card className="bg-primary/10 border border-primary/20 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Ready to see your personalized analysis?</h3>
                        <p className="text-muted-foreground">
                          Fill out the form to calculate your offers and see what you can earn at different firms.
                        </p>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                        <LucideArrowDown className="block lg:hidden h-8 w-8 text-primary animate-bounce" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit a Firm Section */}
        <div className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-xl bg-card border shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Don't see your target firm?</h3>
                <p className="text-muted-foreground">
                  Help us expand our database by submitting a firm. We'll research and add it to our calculator.
                </p>
              </div>
              
              <Link href="/submit-firm">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium">
                  Submit a Firm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Social Proof KPI Section */}
        <SocialProofKPISection />
      </main>
      <Footer />
    </div>
  );
}
