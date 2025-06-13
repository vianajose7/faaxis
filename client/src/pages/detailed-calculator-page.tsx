import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { TabNavigation } from "@/components/layout/tab-navigation";
import { EnhancedDetailedForm } from "@/components/calculator/enhanced-detailed-form";
import { ResultsDashboard } from "@/components/calculator/results-dashboard";
import { calculateOffers, CalculatorResults, AdvisorInfo } from "@/lib/calculator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAdvisorInfo } from "@/hooks/use-advisor-info";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Share, FileDown, PlusCircle, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useFirmDeals, useFirmParameters } from "@/lib/airtable-service";

export default function DetailedCalculatorPage() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [detailedResults, setDetailedResults] = useState<CalculatorResults | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { advisorInfo, calculationResults, setAdvisorInfo } = useAdvisorInfo();
  const [, navigate] = useLocation();
  
  // Check payment status on load
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        // Verify payment status from server
        const res = await apiRequest("GET", "/api/verify-payment");
        const data = await res.json();
        
        if (!data.isPaid) {
          // If not paid, redirect to checkout
          toast({
            title: "Payment Required",
            description: "You need to purchase access to use the detailed calculator",
            variant: "destructive",
          });
          navigate("/checkout");
        } else if (advisorInfo === null && data.initialValues) {
          // If no advisor info in context but server has values, use those
          setAdvisorInfo(data.initialValues);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: "Could not verify your payment status",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [toast, navigate, advisorInfo, setAdvisorInfo]);
  
  // Fetch Airtable data
  const { 
    data: firmDeals,
    isLoading: isLoadingDeals,
    isError: isErrorDeals,
    error: dealsError,
    refetch: refetchDeals
  } = useFirmDeals();
  
  const { 
    data: firmParams,
    isLoading: isLoadingParams,
    isError: isErrorParams,
    error: paramsError,
    refetch: refetchParams
  } = useFirmParameters();
  
  // Show data loading errors
  useEffect(() => {
    if (isErrorDeals && dealsError) {
      toast({
        title: "Error loading firm deals",
        description: "Could not load data from Airtable: " + dealsError.message,
        variant: "destructive",
      });
    }
    
    if (isErrorParams && paramsError) {
      toast({
        title: "Error loading parameters",
        description: "Could not load data from Airtable: " + paramsError.message,
        variant: "destructive",
      });
    }
  }, [isErrorDeals, dealsError, isErrorParams, paramsError, toast]);
  
  // Generate detailed results on load if we have advisor info
  useEffect(() => {
    if (advisorInfo && !detailedResults) {
      calculateDetailedResults(advisorInfo);
    }
  }, [advisorInfo, firmDeals, firmParams]);
  
  // Function to manually refresh Airtable data
  const refreshAirtableData = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching latest values from Airtable...",
    });
    
    refetchDeals();
    refetchParams();
    
    // Recalculate with the advisor's current info
    if (advisorInfo) {
      setTimeout(() => calculateDetailedResults(advisorInfo), 1000);
    }
  };
  
  const calculateDetailedResults = (info: AdvisorInfo) => {
    // Enhanced calculation for the paid version using Airtable data
    // Make sure we have valid data before calculating
    if (!firmDeals || !firmParams) {
      console.error("Missing firm data for calculation");
      return;
    }
    
    // Since the types don't match perfectly, we need to adapt our approach
    // In a real implementation, we'd make sure the types align correctly
    const calculationResults = calculateOffers(info, firmDeals as any, firmParams);
    
    // Mark it as paid and add more detailed data
    calculationResults.isPaid = true;
    
    // Here we would normally add more detailed analyses that are only available in premium
    // For this example, we're using the Airtable data to enhance the calculation
    
    setDetailedResults(calculationResults);
  };
  
  const handleCalculate = (info: AdvisorInfo) => {
    // Update the advisor info in context
    setAdvisorInfo(info);
    
    // Calculate new results
    calculateDetailedResults(info);
  };
  
  const handleSaveCalculation = async () => {
    if (!user || !detailedResults) return;
    
    try {
      await apiRequest("POST", "/api/saved-calculations", {
        calculationData: detailedResults,
        name: `${user.username}'s Calculation - ${new Date().toLocaleDateString()}`
      });
      
      toast({
        title: "Calculation Saved",
        description: "Your calculation has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving calculation:", error);
      toast({
        title: "Error",
        description: "Could not save your calculation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const tabs = [
    { id: "calculator", label: "Detailed Calculator" },
    { id: "myOffers", label: "My Offers" },
    { id: "resources", label: "Resources" },
    { id: "faq", label: "FAQ" }
  ];

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Navbar />
        
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-medium">Verifying payment status...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Navbar />
      
      <div className="flex justify-between items-center mb-6">
        <Alert className="flex-grow bg-gradient-to-r from-primary/10 to-[#4AFF91]/10 border-primary/20">
          <PlusCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Premium Access Unlocked</AlertTitle>
          <AlertDescription>
            You now have access to detailed offer analysis with firm-specific payout grids and tax implications.
          </AlertDescription>
        </Alert>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4 flex items-center" 
          onClick={refreshAirtableData}
          disabled={isLoadingDeals || isLoadingParams}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingDeals || isLoadingParams ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {advisorInfo && (
            <EnhancedDetailedForm 
              initialValues={advisorInfo} 
              onCalculate={handleCalculate} 
            />
          )}
          
          {detailedResults && (
            <div className="lg:col-span-2">
              <ResultsDashboard results={detailedResults} />
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSaveCalculation}
                  className="flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Calculation
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share Results
                </Button>
              </div>
            </div>
          )}
          
          {!advisorInfo && !isVerifying && (
            <div className="col-span-full py-8 text-center">
              <h2 className="text-xl font-medium mb-4">No calculator data found</h2>
              <p className="text-muted-foreground mb-6">
                To use the detailed calculator, please fill out the initial form first
              </p>
              <Button onClick={() => navigate("/calculator")}>
                Go to Calculator
              </Button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === "myOffers" && (
        <div className="grid grid-cols-1 gap-8">
          <div className="p-8 bg-muted/30 rounded-lg text-center">
            <h2 className="text-xl font-medium mb-4">My Offers Feature</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This feature is coming soon. You'll be able to save multiple offers and compare them side by side.
            </p>
            <Button onClick={() => setActiveTab("calculator")}>
              Return to Calculator
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "resources" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Transition Guide</h3>
            <p className="text-muted-foreground mb-6">
              Our comprehensive guide to transitioning between firms, including timelines and legal considerations.
            </p>
            <Button className="w-full">
              Download Guide
            </Button>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Deal Structure Analysis</h3>
            <p className="text-muted-foreground mb-6">
              Learn how to interpret different recruiting deal structures and maximize your compensation.
            </p>
            <Button className="w-full">
              Read Report
            </Button>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Tax Implications</h3>
            <p className="text-muted-foreground mb-6">
              Tax considerations for upfront bonuses, backend compensation, and deferred income payouts.
            </p>
            <Button className="w-full">
              View Tax Guide
            </Button>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Protocol Advantage</h3>
            <p className="text-muted-foreground mb-6">
              Understanding the Broker Protocol and how it impacts your transition between firms.
            </p>
            <Button className="w-full">
              Read Article
            </Button>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Client Retention</h3>
            <p className="text-muted-foreground mb-6">
              Best practices for maintaining client relationships during a transition to a new firm.
            </p>
            <Button className="w-full">
              View Strategies
            </Button>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Ask an Expert</h3>
            <p className="text-muted-foreground mb-6">
              Connect with a transition specialist to discuss your specific situation and options.
            </p>
            <Button className="w-full">
              Schedule Consultation
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "faq" && (
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">How accurate are the compensation projections?</h3>
              <p className="text-muted-foreground">
                Our calculator uses real-time data from firms' current offers and recruiter reports. The projections are based on typical deal structures and payout grids, but actual offers may vary based on your specific situation, negotiation skills, and market conditions at the time of transition.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Do I need to provide personal information to get accurate results?</h3>
              <p className="text-muted-foreground">
                The calculator only requires business metrics like AUM, annual revenue, and fee-based percentage to generate projections. Your personal information is never required for calculations. Premium features allow you to input more detailed practice metrics for greater accuracy.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Can I save multiple calculation scenarios?</h3>
              <p className="text-muted-foreground">
                Yes, premium users can save unlimited calculation scenarios with different input parameters. This feature helps you compare how different aspects of your practice might impact offers from various firms.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">How often is firm data updated?</h3>
              <p className="text-muted-foreground">
                We update our database monthly with the latest firm deals and compensation structures. You can use the "Refresh Data" button to ensure you're seeing the most current information in your calculations.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Are the calculations adjusted for my geographic location?</h3>
              <p className="text-muted-foreground">
                Yes, the premium calculator takes location data into account as some firms offer location-based adjustments to their recruiting packages, particularly in high-cost areas or markets where they're actively recruiting.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">How can I get help interpreting my results?</h3>
              <p className="text-muted-foreground">
                Premium users have access to a 30-minute consultation with a transition specialist who can provide personalized insights about your calculation results and what they mean for your specific situation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
