import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EnhancedDetailedForm } from "@/components/calculator/enhanced-detailed-form";
import { ResultsDashboard } from "@/components/calculator/results-dashboard";
import { FirmSelector } from "@/components/calculator/firm-selector";
import { CompanyProfile } from "@/components/calculator/company-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFirmDeals, useFirmParameters } from "@/lib/airtable-service";
import { AlertCircle, ArrowLeft, FileDown, Save, Share, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AdvisorInfo } from "@/lib/calculator";

/**
 * Simple Enhanced Calculator Page
 * Standalone version of the enhanced calculator without payment/authentication requirements
 */
export default function SimpleEnhancedCalculatorPage() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  
  // Example premium data (pre-filled)
  const [calculatorData, setCalculatorData] = useState({
    aum: 150000000, // $150 million AUM
    revenue: 1500000, // $1.5 million revenue
    feeBasedPercentage: 85, // 85% fee-based
    city: "New York",
    state: "NY",
    currentFirm: "Merrill Lynch",
    // Advanced variables for premium calculator
    deferredComp: true,
    onADeal: false,
    banking: true,
    international: true,
    internationalCountries: ["Canada", "UK"],
    lending: true,
    smas: true,
    households: 120
  });
  
  // Example calculation results
  const [calculationResults, setCalculationResults] = useState({
    metrics: {
      totalDeal: {
        value: 4650000,
        change: 950000,
        isUp: true,
        description: "Total deal value over 9 years"
      },
      recruitingRevenue: {
        value: 1500000,
        change: 150000,
        isUp: true,
        description: "Revenue used for recruiting calculation"
      },
      totalCompDelta: {
        value: 9250000,
        description: "Cumulative compensation increase across all firms"
      }
    },
    comparisonData: [
      {
        year: 1,
        morganStanley: 1050000,
        merrillLynch: 750000,
        ubsWealth: 900000,
        ameriprise: 1200000,
        finet: 860000,
        independent: 1350000,
        goldman: 1100000,
        jpm: 1000000,
        rbc: 950000,
        raymondJames: 920000,
        rockefeller: 1150000
      },
      {
        year: 2,
        morganStanley: 1100000,
        merrillLynch: 780000,
        ubsWealth: 940000,
        ameriprise: 1250000,
        finet: 900000,
        independent: 1420000,
        goldman: 1150000,
        jpm: 1050000,
        rbc: 980000,
        raymondJames: 960000,
        rockefeller: 1210000
      },
      {
        year: 3,
        morganStanley: 1150000,
        merrillLynch: 810000,
        ubsWealth: 980000,
        ameriprise: 1300000,
        finet: 940000,
        independent: 1490000,
        goldman: 1200000,
        jpm: 1100000,
        rbc: 1010000,
        raymondJames: 1000000,
        rockefeller: 1270000
      }
    ],
    guaranteedUpfront: {
      morganStanley: 2250000,
      merrillLynch: 1950000,
      ubsWealth: 2100000,
      ameriprise: 2400000,
      finet: 2000000,
      independent: 1800000,
      goldman: 2300000,
      jpm: 2250000,
      rbc: 2150000,
      raymondJames: 2050000,
      rockefeller: 2350000,
      sanctuary: 1900000,
      wellsFargo: 2000000,
      tru: 1850000
    },
    backendBreakdown: {
      growth: 450000,
      assets: 1250000,
      lengthOfService: 350000
    },
    isPaid: true
  });
  
  // Fetch firm data from API
  const { 
    data: firmDeals, 
    isLoading: isLoadingDeals
  } = useFirmDeals();
  
  const { 
    data: firmParams, 
    isLoading: isLoadingParams
  } = useFirmParameters();
  
  // Handle form submission with enhanced parameters
  const handleCalculate = (data: AdvisorInfo) => {
    setIsCalculating(true);
    setCalculatorData({
      ...data,
      currentFirm: data.currentFirm || "Merrill Lynch", // Ensure we have a default
      deferredComp: data.deferredComp || false,
      onADeal: data.onADeal || false,
      banking: data.banking || false,
      international: data.international || false,
      internationalCountries: data.internationalCountries || [],
      lending: data.lending || false,
      smas: data.smas || false,
      households: data.households || 100
    });
    
    // Success message
    toast({
      title: "Calculation Complete",
      description: "Your enhanced results have been calculated.",
    });
    
    setIsCalculating(false);
  };
  
  // Handle firm selection for comparison
  const handleFirmSelection = (firms: string[]) => {
    setSelectedFirms(firms);
  };
  
  // Toggle between calculator and dashboard views
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="flex flex-col sm:flex-row items-center justify-between my-6">
            <div className="flex items-center">
              <Link href="/calculator">
                <Button variant="ghost" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Basic Calculator
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Enhanced Calculator</h1>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              Premium Features Enabled
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mt-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Deal Calculator</CardTitle>
                  <CardDescription>
                    This premium calculator includes additional variables for more precise deal calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedDetailedForm 
                    onCalculate={handleCalculate}
                    initialValues={calculatorData}
                  />
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Select Firms to Compare</CardTitle>
                  <CardDescription>
                    Premium users can select unlimited firms to compare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FirmSelector 
                    selectedFirms={selectedFirms}
                    setSelectedFirms={handleFirmSelection}
                    maxSelections={10}
                    requireSubscription={false}
                    userIsPremium={true}
                    lockSelection={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Results */}
            <div className="lg:col-span-7">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Results Dashboard</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Save calculation locally
                      const savedData = {
                        calculatorData,
                        calculationResults,
                        selectedFirms,
                        timestamp: new Date().toISOString(),
                        name: `Calculation ${new Date().toLocaleDateString()}`
                      };
                      
                      try {
                        // Get existing saved calculations or initialize empty array
                        const existingSaved = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
                        existingSaved.push(savedData);
                        localStorage.setItem('savedCalculations', JSON.stringify(existingSaved));
                        
                        toast({
                          title: "Calculation Saved",
                          description: "Your calculation has been saved locally.",
                        });
                      } catch (e) {
                        toast({
                          title: "Error Saving",
                          description: "Could not save calculation locally.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Create shareable link with calculation data encoded in URL
                      const shareData = {
                        aum: calculatorData.aum,
                        revenue: calculatorData.revenue,
                        feeBasedPercentage: calculatorData.feeBasedPercentage,
                        firms: selectedFirms.join(',')
                      };
                      
                      // Create a shareable URL with query parameters
                      const queryParams = new URLSearchParams();
                      Object.entries(shareData).forEach(([key, value]) => {
                        queryParams.append(key, String(value));
                      });
                      
                      const shareableUrl = `${window.location.origin}/simple-enhanced-calculator?${queryParams.toString()}`;
                      
                      // Copy to clipboard
                      navigator.clipboard.writeText(shareableUrl)
                        .then(() => {
                          toast({
                            title: "Link Copied",
                            description: "Shareable link copied to clipboard!",
                          });
                        })
                        .catch(() => {
                          toast({
                            title: "Copy Failed",
                            description: "Could not copy link to clipboard.",
                            variant: "destructive"
                          });
                        });
                    }}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Exporting Results",
                        description: "This feature is coming soon. Results will be downloadable as PDF or CSV.",
                      });
                    }}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <ResultsDashboard 
                results={calculationResults}
                selectedFirms={selectedFirms}
                firmDeals={firmDeals}
              />
              
              {selectedFirms && selectedFirms.length > 0 && (
                <CompanyProfile 
                  selectedFirms={selectedFirms} 
                  firmDeals={firmDeals}
                  isPaid={true} // Enhanced calculator shows the premium content
                />
              )}
              
              <Alert className="mt-6">
                <PlusCircle className="h-4 w-4" />
                <AlertTitle>Premium Feature</AlertTitle>
                <AlertDescription>
                  You're using the enhanced calculator with premium features including detailed analysis of deferred compensation, banking, and international business factors.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}