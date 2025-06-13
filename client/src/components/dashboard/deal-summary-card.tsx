import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { formatFirmName } from "./dashboard-charts";

// Interface for deal data
export interface FirmDeal {
  upfrontMin: number;
  upfrontMax: number;
  backendMin: number;
  backendMax: number;
  totalDealMin: number;
  totalDealMax: number;
  notes: string;
}

type DealSummaryProps = {
  firm: string;
  deal: FirmDeal;
};

// Fixed color palette for deal types
const dealColors = {
  upfront: "#3b82f6", // Blue
  backend: "#10b981", // Green
  total: "#8b5cf6", // Purple
};

// Format percentage for display
const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export function DealSummaryCard({ firm, deal }: DealSummaryProps) {
  const formattedFirmName = formatFirmName(firm);
  
  // Calculate average values for the progress bars
  const upfrontAvg = Math.round((deal.upfrontMin + deal.upfrontMax) / 2);
  const backendAvg = Math.round((deal.backendMin + deal.backendMax) / 2);
  const totalAvg = Math.round((deal.totalDealMin + deal.totalDealMax) / 2);
  
  // Maximum possible deal value for scaling the progress bars
  const maxPossibleDeal = 450; // Based on industry standards
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{formattedFirmName}</CardTitle>
        <CardDescription>Recruiting Deal Structure</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Upfront</span>
              <span className="text-sm font-medium">
                {formatPercentage(deal.upfrontMin)} - {formatPercentage(deal.upfrontMax)}
              </span>
            </div>
            <Progress 
              value={(upfrontAvg / maxPossibleDeal) * 100} 
              className="h-2" 
              indicatorClassName="bg-blue-500" 
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Backend</span>
              <span className="text-sm font-medium">
                {formatPercentage(deal.backendMin)} - {formatPercentage(deal.backendMax)}
              </span>
            </div>
            <Progress 
              value={(backendAvg / maxPossibleDeal) * 100} 
              className="h-2" 
              indicatorClassName="bg-green-500" 
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Total Deal</span>
              <span className="text-sm font-medium">
                {formatPercentage(deal.totalDealMin)} - {formatPercentage(deal.totalDealMax)}
              </span>
            </div>
            <Progress 
              value={(totalAvg / maxPossibleDeal) * 100} 
              className="h-2" 
              indicatorClassName="bg-purple-500" 
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pt-0 pb-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="notes" className="border-0">
            <AccordionTrigger className="text-sm py-2 px-0">
              Deal Notes
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{deal.notes}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}