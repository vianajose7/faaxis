import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample data for visualization purposes
const sampleData = [
  { year: 1, morganStanley: 0.85, merrillLynch: 0.78, ubsWealth: 0.82, goldman: 0.88 },
  { year: 2, morganStanley: 0.92, merrillLynch: 0.83, ubsWealth: 0.87, goldman: 0.95 },
  { year: 3, morganStanley: 0.99, merrillLynch: 0.90, ubsWealth: 0.93, goldman: 1.03 },
  { year: 4, morganStanley: 1.05, merrillLynch: 0.97, ubsWealth: 1.00, goldman: 1.12 },
  { year: 5, morganStanley: 1.12, merrillLynch: 1.05, ubsWealth: 1.08, goldman: 1.21 },
  { year: 6, morganStanley: 1.19, merrillLynch: 1.13, ubsWealth: 1.16, goldman: 1.31 },
  { year: 7, morganStanley: 1.27, merrillLynch: 1.21, ubsWealth: 1.24, goldman: 1.42 },
  { year: 8, morganStanley: 1.35, merrillLynch: 1.29, ubsWealth: 1.32, goldman: 1.53 },
  { year: 9, morganStanley: 1.44, merrillLynch: 1.37, ubsWealth: 1.40, goldman: 1.65 },
];

// Map all firm types to their colors
const firmColors = {
  morganStanley: "#1B365D",
  merrillLynch: "#0073CF",
  ubsWealth: "#EC0016",
  goldman: "#367639"
};

export function DefaultChartPlaceholder() {
  return (
    <Card className="bg-card/80 rounded-xl mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Multi-Year Comparison</h2>
        </div>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sample Visualization</AlertTitle>
          <AlertDescription>
            This sample chart illustrates the type of data you'll receive. Enter your information below to see personalized results.
          </AlertDescription>
        </Alert>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampleData}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(value) => `Year ${value}`}
                stroke="currentColor" 
                tick={{ fill: "currentColor" }}
              />
              <YAxis 
                stroke="currentColor" 
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) => value >= 1 ? `$${value}M` : `$${value * 1000}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "#fff"
                }}
                formatter={(value) => {
                  const numValue = Number(value);
                  return [numValue >= 1 ? `$${numValue.toFixed(2)}M` : `$${(numValue * 1000).toFixed(0)}K`, ""];
                }}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              {Object.entries(firmColors).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key === "morganStanley" ? "Morgan Stanley" :
                        key === "merrillLynch" ? "Merrill Lynch" :
                        key === "ubsWealth" ? "UBS Wealth" : "Goldman Sachs"}
                  stroke={color}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center mt-4 italic text-muted-foreground text-sm">
          Note: This visualization uses sample data. Complete the form below to see your personalized projections.
        </div>
      </CardContent>
    </Card>
  );
}

// Sample KPI cards to show when no calculation has been performed
export function SampleKPICards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 border border-border/50 bg-card/50">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Total Deal</h3>
            <div className="mt-1 text-2xl font-bold">$3.8M-$4.5M</div>
            <div className="text-xs text-muted-foreground mt-1">Estimated range based on firm averages</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border border-border/50 bg-card/50">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Recruiting Revenue</h3>
            <div className="mt-1 text-2xl font-bold">$1.2M-$1.6M</div>
            <div className="text-xs text-muted-foreground mt-1">Based on your entered details</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border border-border/50 bg-card/50">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Total Comp Delta</h3>
            <div className="mt-1 text-2xl font-bold">$7.2M-$8.5M</div>
            <div className="text-xs text-muted-foreground mt-1">Estimated 9-year difference</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border border-border/50 bg-card/50">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Upfront Cash</h3>
            <div className="mt-1 text-2xl font-bold">$850K-$1.1M</div>
            <div className="text-xs text-muted-foreground mt-1">Estimated cash upon transition</div>
          </div>
        </div>
      </Card>
    </div>
  );
}