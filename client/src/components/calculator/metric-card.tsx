import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  change?: number;
  isUp?: boolean;
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subValue,
  change,
  isUp,
  icon
}: MetricCardProps) {
  // Ultra-simplified value formatting for mobile - just clean numbers
  const valueString = typeof value === 'number' ? 
    `$${Math.round(value).toLocaleString()}M` : value;

  return (
    <Card className="bg-card/80 rounded-xl relative overflow-hidden">
      <CardContent className="p-5">
        {/* Mobile-first approach with minimal content */}
        <div className="flex flex-col">
          <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
          <span className="text-2xl font-mono font-bold text-foreground mt-1">
            {valueString}
          </span>
        </div>
        
        {/* Additional content ONLY for tablet/desktop */}
        <div className="hidden md:block">
          {/* Options button */}
          <button className="absolute top-5 right-5 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {/* Change indicators */}
          {(change !== undefined && isUp !== undefined) && (
            <div className={cn(
              "flex items-center mt-2 text-sm",
              isUp ? "text-[#4AFF91]" : "text-destructive"
            )}>
              {isUp ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{isUp ? 'Up' : 'Down'} {change}%</span>
            </div>
          )}
          
          {/* Descriptive text */}
          {(!change && subValue) && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span>{subValue}</span>
            </div>
          )}
          
          {/* Background icon */}
          <div className="absolute bottom-0 right-4 opacity-20">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
