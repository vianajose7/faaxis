import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ComparisonData } from "@/lib/calculator";
import { ChevronDown, ChevronUp, BarChart2, Layers, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface YearComparisonChartProps {
  data: ComparisonData[];
  selectedFirms?: string[];
}

export function YearComparisonChart({ data, selectedFirms }: YearComparisonChartProps) {
  // View mode states
  const [viewMode, setViewMode] = useState<"all" | "single" | "compare">("all");
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);
  const [compareFirm1, setCompareFirm1] = useState<string | null>(null);
  const [compareFirm2, setCompareFirm2] = useState<string | null>(null);
  
  // If no firms are explicitly selected, show all firms
  const hasSelections = selectedFirms && selectedFirms.length > 0;
  
  // Standardize firm names function
  const standardizeFirmName = (name: string): string => {
    if (!name) return "";
    
    const nameLower = name.toLowerCase().trim();
    
    if (nameLower.includes('morgan stanley') || nameLower === 'ms') {
      return "morgan stanley";
    } else if (nameLower.includes('merrill') || nameLower === 'ml') {
      return "merrill lynch";
    } else if (nameLower.includes('ubs')) {
      return "ubs";
    } else if (nameLower.includes('ameriprise')) {
      return "ameriprise";
    } else if (nameLower.includes('finet')) {
      return "finet";
    } else if (nameLower.includes('lpl financial') || nameLower === 'lpl' || nameLower === 'linsco' || nameLower.includes('independent')) {
      // Ensure we consistently use "lpl financial" in the UI to map to "independent" in the data
      return "lpl financial";
    } else if (nameLower.includes('goldman') || nameLower === 'gs') {
      return "goldman sachs";
    } else if (nameLower.includes('jpmorgan') || nameLower.includes('jp morgan') || nameLower.includes('j.p. morgan') || nameLower === 'jpm') {
      return "jpmorgan";
    } else if (nameLower.includes('rbc wealth') || nameLower === 'rbc') {
      return "rbc";
    } else if (nameLower.includes('raymond james') || nameLower === 'rj') {
      return "raymond james";
    } else if (nameLower.includes('rockefeller')) {
      return "rockefeller";
    } else if (nameLower.includes('sanctuary')) {
      return "sanctuary";
    } else if (nameLower.includes('wells fargo') || nameLower === 'wf') {
      return "wells fargo";
    } else if (nameLower.includes('truist') || nameLower === 'tru') {
      return "truist";
    } else if (nameLower.includes('first republic')) {
      return "first republic";
    } else if (nameLower.includes('edward jones')) {
      return "edward jones";
    } else if (nameLower.includes('stifel')) {
      return "stifel";
    }
    
    return nameLower; // Return lowercase version if no match
  };
  
  // Map all firm types to their data keys and display names
  const firmMap = {
    "morgan stanley": { key: "morganStanley", display: "Morgan Stanley", color: "#1B365D" },
    "merrill lynch": { key: "merrillLynch", display: "Merrill Lynch", color: "#0073CF" },
    "ubs": { key: "ubsWealth", display: "UBS", color: "#EC0016" },
    "ameriprise": { key: "ameriprise", display: "Ameriprise", color: "#00539B" },
    "finet": { key: "finet", display: "Finet", color: "#6A5ACD" },
    "lpl financial": { key: "independent", display: "LPL Financial", color: "#4AFF91" },
    "goldman sachs": { key: "goldman", display: "Goldman Sachs", color: "#367639" },
    "jpmorgan": { key: "jpm", display: "J.P. Morgan", color: "#C99700" },
    "rbc": { key: "rbc", display: "RBC", color: "#005DAA" },
    "raymond james": { key: "raymondJames", display: "Raymond James", color: "#0033A0" },
    "rockefeller": { key: "rockefeller", display: "Rockefeller", color: "#003366" },
    "sanctuary": { key: "sanctuary", display: "Sanctuary", color: "#7F00FF" },
    "wells fargo": { key: "wellsFargo", display: "Wells Fargo", color: "#D71E28" },
    "truist": { key: "tru", display: "Truist", color: "#612E8C" },
    "first republic": { key: "firstRepublic", display: "First Republic", color: "#0A6978" },
    "edward jones": { key: "raymondJames", display: "Edward Jones (Regional)", color: "#007934" },
    "stifel": { key: "raymondJames", display: "Stifel (Regional)", color: "#0E2240" }
  };
  
  // Function to check if a firm is selected
  const isFirmSelected = (firmType: string): boolean => {
    if (!hasSelections) return true; // Show all if nothing selected
    
    // Check if any selected firm matches this firm type after standardization
    return selectedFirms!.some(selected => 
      standardizeFirmName(selected) === firmType
    );
  };
  
  // Get the list of firms to show based on selections
  const allFirmsToShow = Object.keys(firmMap).filter(isFirmSelected);
  
  // Firms to actually display based on view mode
  let firmsToDisplay: string[] = [];
  
  if (viewMode === "all") {
    firmsToDisplay = allFirmsToShow;
  } else if (viewMode === "single" && selectedFirm) {
    firmsToDisplay = [selectedFirm];
  } else if (viewMode === "compare" && compareFirm1 && compareFirm2) {
    firmsToDisplay = [compareFirm1, compareFirm2];
  } else {
    // Fallback to all if conditions aren't met
    firmsToDisplay = allFirmsToShow;
  }
  
  // Handler to switch view modes
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as "all" | "single" | "compare");
    
    // Set defaults when switching modes
    if (mode === "single" && !selectedFirm && allFirmsToShow.length > 0) {
      setSelectedFirm(allFirmsToShow[0]);
    }
    
    if (mode === "compare") {
      if (!compareFirm1 && allFirmsToShow.length > 0) {
        setCompareFirm1(allFirmsToShow[0]);
      }
      if (!compareFirm2 && allFirmsToShow.length > 1) {
        setCompareFirm2(allFirmsToShow[1]);
      } else if (!compareFirm2 && allFirmsToShow.length === 1) {
        // If only one firm is available, use it for both (will show flat comparison)
        setCompareFirm2(allFirmsToShow[0]);
      }
    }
  };
  
  // Formatter for money values
  const formatMoney = (value: number): string => {
    return value >= 1 ? `$${value.toFixed(2)}M` : `$${(value * 1000).toFixed(0)}K`;
  };
  
  return (
    <Card className="bg-card/80 rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Multi-Year Comparison</h2>
          
          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-auto">
              <TabsList className="bg-muted/30">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
                  <Layers className="h-4 w-4 mr-2" />
                  All Firms
                </TabsTrigger>
                <TabsTrigger value="single" className="data-[state=active]:bg-primary/20">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Single View
                </TabsTrigger>
                <TabsTrigger value="compare" className="data-[state=active]:bg-primary/20">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {viewMode === "single" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {selectedFirm ? firmMap[selectedFirm as keyof typeof firmMap]?.display : "Select Firm"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Select Firm to View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allFirmsToShow.map(firm => (
                    <DropdownMenuItem 
                      key={firm}
                      onClick={() => setSelectedFirm(firm)}
                      className="cursor-pointer"
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: firmMap[firm as keyof typeof firmMap].color }}
                      ></span>
                      {firmMap[firm as keyof typeof firmMap].display}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {viewMode === "compare" && (
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <span 
                        className="inline-block w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: compareFirm1 ? firmMap[compareFirm1 as keyof typeof firmMap]?.color : "#fff" }}
                      ></span>
                      {compareFirm1 ? firmMap[compareFirm1 as keyof typeof firmMap]?.display : "Firm 1"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Select First Firm</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allFirmsToShow.map(firm => (
                      <DropdownMenuItem 
                        key={firm}
                        onClick={() => setCompareFirm1(firm)}
                        className="cursor-pointer"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: firmMap[firm as keyof typeof firmMap].color }}
                        ></span>
                        {firmMap[firm as keyof typeof firmMap].display}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <span 
                        className="inline-block w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: compareFirm2 ? firmMap[compareFirm2 as keyof typeof firmMap]?.color : "#fff" }}
                      ></span>
                      {compareFirm2 ? firmMap[compareFirm2 as keyof typeof firmMap]?.display : "Firm 2"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Select Second Firm</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allFirmsToShow.map(firm => (
                      <DropdownMenuItem 
                        key={firm}
                        onClick={() => setCompareFirm2(firm)}
                        className="cursor-pointer"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: firmMap[firm as keyof typeof firmMap].color }}
                        ></span>
                        {firmMap[firm as keyof typeof firmMap].display}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "compare" && compareFirm1 && compareFirm2 ? (
              // Comparison chart with side-by-side bars
              <ComposedChart
                data={data}
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
                    // Format to K for thousands, M for millions
                    const numValue = Number(value);
                    return [numValue >= 1 ? `$${numValue.toFixed(2)}M` : `$${(numValue * 1000).toFixed(0)}K`, ""];
                  }}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey={firmMap[compareFirm1 as keyof typeof firmMap].key}
                  name={firmMap[compareFirm1 as keyof typeof firmMap].display}
                  fill={firmMap[compareFirm1 as keyof typeof firmMap].color}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey={firmMap[compareFirm2 as keyof typeof firmMap].key}
                  name={firmMap[compareFirm2 as keyof typeof firmMap].display}
                  fill={firmMap[compareFirm2 as keyof typeof firmMap].color}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            ) : (
              // Standard line chart for single or all firms
              <LineChart
                data={data}
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
                    // Format to K for thousands, M for millions
                    const numValue = Number(value);
                    return [numValue >= 1 ? `$${numValue.toFixed(2)}M` : `$${(numValue * 1000).toFixed(0)}K`, ""];
                  }}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend />
                {firmsToDisplay.map(firm => (
                  <Line
                    key={firm}
                    type="monotone"
                    dataKey={firmMap[firm as keyof typeof firmMap].key}
                    name={firmMap[firm as keyof typeof firmMap].display}
                    stroke={firmMap[firm as keyof typeof firmMap].color}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}