import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Format currency values (0.82M to 820K, etc.)
function formatCurrency(value: number): string {
  if (value >= 1) {
    return `$${value.toFixed(1)}M`;
  } else if (value >= 0.1) {
    return `$${(value * 1000).toFixed(0)}K`;
  } else {
    return `$${(value * 1000000).toFixed(0)}`;
  }
}

interface InfoCardProps {
  title: string;
  subtitle: string;
  borderColor: string;
  children: React.ReactNode;
}

export function InfoCard({
  title,
  subtitle,
  borderColor,
  children
}: InfoCardProps) {
  return (
    <Card className={cn(
      "bg-card/80 rounded-xl border-l-4",
      borderColor
    )}>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        <div className="mt-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function GuaranteedUpfrontCard({
  data,
  selectedFirms,
  firmDeals
}: {
  data: Record<string, number>;
  selectedFirms?: string[];
  firmDeals?: any[];
}) {
  // Map of firm name keys to display names and colors
  const firmMap: Record<string, { display: string, color: string }> = {
    "morganStanley": { display: "Morgan Stanley", color: "text-[#1B365D]" },
    "merrillLynch": { display: "Merrill Lynch", color: "text-[#0073CF]" },
    "ubsWealth": { display: "UBS Wealth", color: "text-[#EC0016]" },
    "ameriprise": { display: "Ameriprise", color: "text-[#00539B]" },
    "finet": { display: "Finet", color: "text-[#6A5ACD]" },
    "independent": { display: "Independent", color: "text-[#4AFF91]" },
    "goldman": { display: "Goldman Sachs", color: "text-[#367639]" },
    "jpm": { display: "JPMorgan", color: "text-[#C99700]" },
    "rbc": { display: "RBC", color: "text-[#005DAA]" },
    "raymondJames": { display: "Raymond James", color: "text-[#0033A0]" },
    "rockefeller": { display: "Rockefeller", color: "text-[#003366]" },
    "sanctuary": { display: "Sanctuary", color: "text-[#7F00FF]" },
    "wellsFargo": { display: "Wells Fargo", color: "text-[#D71E28]" },
    "tru": { display: "Truist", color: "text-[#612E8C]" }
  };
  
  // Firm name normalizer to match API data keys
  const normalizeFirmName = (name: string): string => {
    const firmLower = name.toLowerCase();
    
    if (firmLower.includes('morgan') || firmLower === 'ms') return "morganStanley";
    if (firmLower.includes('merrill') || firmLower === 'ml') return "merrillLynch";
    if (firmLower.includes('ubs wealth') || firmLower === 'ubs') return "ubsWealth";
    if (firmLower.includes('ameriprise')) return "ameriprise";
    if (firmLower.includes('finet')) return "finet";
    if (firmLower.includes('independent') || firmLower === 'lpl' || firmLower.includes('lpl financial')) return "independent";
    if (firmLower.includes('goldman') || firmLower === 'gs') return "goldman";
    if (firmLower.includes('jpmorgan') || firmLower.includes('jp morgan') || firmLower === 'jpm') return "jpm";
    if (firmLower.includes('rbc wealth') || firmLower === 'rbc') return "rbc";
    if (firmLower.includes('raymond james') || firmLower === 'rj') return "raymondJames";
    if (firmLower.includes('edward jones') || firmLower.includes('ed jones')) return "raymondJames"; // Edward Jones is a Regional firm like Raymond James
    if (firmLower.includes('stifel')) return "raymondJames"; // Stifel is also a Regional firm
    if (firmLower.includes('rockefeller')) return "rockefeller";
    if (firmLower.includes('sanctuary')) return "sanctuary";
    if (firmLower.includes('wells fargo') || firmLower === 'wf') return "wellsFargo";
    if (firmLower.includes('truist') || firmLower === 'tru') return "tru";
    
    return "independent"; // Default fallback
  };
  
  if (!selectedFirms || selectedFirms.length === 0) {
    // If no firms selected, show all default firms
    return (
      <InfoCard
        title="Guaranteed Upfront"
        subtitle="Cash payment upon transition"
        borderColor="border-[white]"
      >
        <div className="space-y-2">
          {Object.entries(data)
            .filter(([key]) => key !== "undefined" && data[key] > 0)
            .slice(0, 6) // Limit to first 6 firms with data
            .map(([key, value]) => {
              const firmInfo = firmMap[key] || { display: key, color: "text-white" };
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className={`${firmInfo.color} font-medium text-base`}>{firmInfo.display}</span>
                  <span className="font-mono text-lg">{formatCurrency(value)}</span>
                </div>
              );
            })}
        </div>
      </InfoCard>
    );
  }
  
  // Map selected firms to their actual firm names and display data
  return (
    <InfoCard
      title="Guaranteed Upfront"
      subtitle="Cash payment upon transition"
      borderColor="border-[white]"
    >
      <div className="space-y-2">
        {selectedFirms.map((selectedFirm, index) => {
          // Look up the firm in the Airtable data or use the selected name
          const firmDeal = firmDeals?.find(deal => 
            deal.firm.toLowerCase() === selectedFirm.toLowerCase()
          );
          
          // Normalize the firm name to match the data keys
          const normalizedName = normalizeFirmName(selectedFirm);
          
          // Get the upfront value or default to 0
          const upfrontValue = data[normalizedName] || 0;
          
          // Get the display info for this firm
          const firmInfo = firmMap[normalizedName] || { 
            display: firmDeal?.firm || selectedFirm, 
            color: "text-white" 
          };
          
          return (
            <div key={selectedFirm} className="flex justify-between items-center">
              <span className={`${firmInfo.color} font-medium text-base`}>
                {firmDeal?.firm || firmInfo.display}
              </span>
              <span className="font-mono text-lg">{formatCurrency(upfrontValue)}</span>
            </div>
          );
        })}
        
        {selectedFirms.length === 0 && (
          <div className="text-muted-foreground text-sm italic">
            Select firms to view upfront offers
          </div>
        )}
      </div>
    </InfoCard>
  );
}

export function BackendBreakdownCard({
  data
}: {
  data: {
    growth: number;
    assets: number;
    lengthOfService: number;
  }
}) {
  return (
    <InfoCard
      title="Backend Breakdown"
      subtitle="Long-term compensation structure (10 years)"
      borderColor="border-[#4AFF91]"
    >
      {/* Chart section */}
      <div className="mt-4 relative mb-6">
        <div className="flex items-center">
          <div className="relative w-28 h-28 ml-1">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="#4AFF91" 
                strokeWidth="20"
                strokeDasharray={`${data.growth * 2.51} ${200 - data.growth * 2.51}`}
                strokeDashoffset="0"
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="white" 
                strokeWidth="20"
                strokeDasharray={`${data.assets * 2.51} ${200 - data.assets * 2.51}`}
                strokeDashoffset={`-${data.growth * 2.51}`}
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="#E2E2E2" 
                strokeWidth="20"
                strokeDasharray={`${data.lengthOfService * 2.51} ${200 - data.lengthOfService * 2.51}`}
                strokeDashoffset={`-${(data.growth + data.assets) * 2.51}`}
              />
              <circle cx="50" cy="50" r="30" fill="hsl(var(--card))" />
            </svg>
          </div>
          
          <div className="ml-6 space-y-1.5">
            <div className="flex items-center">
              <span className="w-3 h-3 inline-block mr-2 rounded-sm bg-[#4AFF91]"></span>
              <span className="text-sm font-medium whitespace-nowrap">Growth ({data.growth}%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 inline-block mr-2 rounded-sm bg-white"></span>
              <span className="text-sm font-medium whitespace-nowrap">Assets ({data.assets}%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 inline-block mr-2 rounded-sm bg-gray-300"></span>
              <span className="text-sm font-medium whitespace-nowrap">Service ({data.lengthOfService}%)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabular breakdown with striping */}
      <div className="border rounded-md overflow-hidden shadow-sm">
        <div className="grid grid-cols-3 text-center bg-primary/10 py-2.5 font-medium text-sm text-foreground">
          <div>Component</div>
          <div>Percentage</div>
          <div>Factor</div>
        </div>
        
        <div className="grid grid-cols-3 text-center bg-card py-3 text-sm border-t border-border">
          <div className="font-medium text-primary">Growth</div>
          <div className="font-bold text-foreground">{data.growth}%</div>
          <div className="text-foreground">Annual increases</div>
        </div>
        
        <div className="grid grid-cols-3 text-center bg-muted/40 py-3 text-sm border-t border-border">
          <div className="font-medium text-primary">Assets</div>
          <div className="font-bold text-foreground">{data.assets}%</div>
          <div className="text-foreground">AUM transferred</div>
        </div>
        
        <div className="grid grid-cols-3 text-center bg-card py-3 text-sm border-t border-border">
          <div className="font-medium text-primary">Service</div>
          <div className="font-bold text-foreground">{data.lengthOfService}%</div>
          <div className="text-foreground">Years at firm</div>
        </div>
      </div>
    </InfoCard>
  );
}
