import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdvisorInfo } from "@/hooks/use-advisor-info";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

/**
 * Direct Entry Page - Special Page for Bypassing Authentication
 * This page automatically loads example data and redirects to the calculator
 */
export default function DirectEntryPage() {
  const [location, navigate] = useLocation();
  const { setAdvisorInfo, setCalculationResults } = useAdvisorInfo();
  
  // Immediately load data and redirect
  useEffect(() => {
    console.log("DirectEntryPage: Loading example data and redirecting...");
    
    // Set sample advisor info
    setAdvisorInfo({
      aum: 150000000, // $150 million AUM
      revenue: 1500000, // $1.5 million revenue
      feeBasedPercentage: 85, // 85% fee-based
      city: "New York",
      state: "NY",
      currentFirm: "Merrill Lynch"
    });
    
    // Set pre-calculated sample results
    setCalculationResults({
      metrics: {
        totalDeal: {
          value: 4650000, // 310% of revenue
          change: 950000,
          isUp: true,
          description: "Total deal value over 9 years"
        },
        recruitingRevenue: {
          value: 1500000, // current revenue
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
    
    // Delay navigation slightly to ensure data is set
    const redirectTimer = setTimeout(() => {
      console.log("DirectEntryPage: Redirecting to calculator...");
      navigate("/calculator");
    }, 1500);
    
    return () => clearTimeout(redirectTimer);
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="p-6 shadow-lg w-[500px] max-w-[90vw] text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Financial Advisor Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Setting up example data and preparing your dashboard...
        </p>
        
        <div className="flex justify-center mb-8">
          <LoaderCircle className="h-12 w-12 text-primary animate-spin" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          You will be automatically redirected to the calculator dashboard in a moment.
        </p>
        
        <Button 
          className="w-full" 
          onClick={() => navigate("/calculator")}
        >
          Go to Calculator Now
        </Button>
      </Card>
    </div>
  );
}