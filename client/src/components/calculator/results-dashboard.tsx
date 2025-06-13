import { CalculatorResults } from "@/lib/calculator";
import { MetricCard } from "./metric-card";
import { YearComparisonChart } from "./year-comparison-chart";
import { GuaranteedUpfrontCard, BackendBreakdownCard } from "./info-card";
import { Button } from "@/components/ui/button";
import { LockIcon, BarChart2, DollarSign, ArrowRight, LineChart } from "lucide-react";
import { Link } from "wouter";

interface ResultsDashboardProps {
  results: CalculatorResults;
  selectedFirms?: string[];
  firmDeals?: any[];
}

export function ResultsDashboard({ results, selectedFirms, firmDeals }: ResultsDashboardProps) {
  return (
    <div className="lg:col-span-2">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Deal"
          value={results.metrics.totalDeal.value}
          subValue={results.metrics.totalDeal.description}
          change={results.metrics.totalDeal.change}
          isUp={results.metrics.totalDeal.isUp}
          icon={<BarChart2 className="h-12 w-12 text-[#4AFF91]" />}
        />
        
        <MetricCard
          title="Recruiting Revenue"
          value={results.metrics.recruitingRevenue.value}
          subValue={results.metrics.recruitingRevenue.description}
          change={results.metrics.recruitingRevenue.change}
          isUp={results.metrics.recruitingRevenue.isUp}
          icon={<DollarSign className="h-12 w-12 text-destructive" />}
        />
        
        <MetricCard
          title="Total Comp Delta"
          value={results.metrics.totalCompDelta.value}
          subValue={results.metrics.totalCompDelta.description}
          icon={<LineChart className="h-12 w-12 text-primary" />}
        />
        
        <MetricCard
          title="Upfront Cash"
          value={results.guaranteedUpfront?.averageValue || Math.round(results.metrics.totalDeal.value * 0.35)}
          subValue="Estimated upfront payout"
          icon={<DollarSign className="h-12 w-12 text-primary" />}
        />
      </div>
      
      {/* Multi-Year Comparison Chart */}
      <div className="mb-6">
        <YearComparisonChart 
          data={results.comparisonData} 
          selectedFirms={selectedFirms} 
        />
      </div>
      
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GuaranteedUpfrontCard 
          data={results.guaranteedUpfront} 
          selectedFirms={selectedFirms}
          firmDeals={firmDeals}
        />
        <BackendBreakdownCard data={results.backendBreakdown} />
      </div>
      
      {/* Payment/Upgrade CTA */}
      <div className="mt-8 bg-gradient-to-r from-primary/60 to-[#4AFF91]/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="font-bold text-xl text-white">Ready for the complete analysis?</h3>
            <p className="text-white mt-2 font-medium">
              Get detailed projections with firm-specific payout grids, tax implications, and customized transition planning.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/checkout">
              <Button className="bg-white text-gray-800 hover:bg-white/90 px-6 py-6 rounded-lg font-bold text-md shadow-md transition-colors flex items-center">
                <LockIcon className="mr-2 h-4 w-4 text-gray-800" />
                🔓 Unlock Full Report — $199
              </Button>
            </Link>
          </div>
        </div>
      </div>
      

    </div>
  );
}
