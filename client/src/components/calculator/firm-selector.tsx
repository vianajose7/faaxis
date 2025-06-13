import { useState } from "react";
import { FirmDeal, useFirmDeals } from "@/lib/airtable-service";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { firmList } from "@shared/firmList";

// Constant for maximum selections
const MAX_SELECTIONS = 3;

interface FirmSelectorProps {
  selectedFirms: string[];
  setSelectedFirms: (firms: string[]) => void;
  maxSelections?: number;
  requireSubscription?: boolean;
  userIsPremium?: boolean;
  lockSelection?: boolean; // This is now ignored
}

export function FirmSelector({
  selectedFirms,
  setSelectedFirms,
  maxSelections = MAX_SELECTIONS,
  requireSubscription = false,
  userIsPremium = false,
  lockSelection = false, // Parameter remains for backward compatibility
}: FirmSelectorProps) {
  const { toast } = useToast();
  
  // Fetch firm data from Airtable
  const { data: firmDeals, isLoading, isError } = useFirmDeals();
  
  // Check if selections are locked (reached max and not premium)
  const isSelectionLocked = selectedFirms.length >= maxSelections && !userIsPremium && requireSubscription;
  
  // Handle selecting a firm - simplified logic
  const handleSelectFirm = (firmName: string) => {
    // Check if already selected
    if (selectedFirms.includes(firmName)) {
      // If selections are locked, don't allow deselection
      if (isSelectionLocked || lockSelection) {
        toast({
          title: "Selections Locked",
          description: "You've reached your selection limit. Subscribe to premium for unlimited selections.",
          variant: "destructive",
        });
        return;
      }
      
      // Remove from selection
      setSelectedFirms(selectedFirms.filter(firm => firm !== firmName));
      return;
    }
    
    // Check if selection limit reached
    if (selectedFirms.length >= maxSelections && !userIsPremium) {
      // If subscription required, show a toast with info
      if (requireSubscription) {
        toast({
          title: "Selection Limit Reached",
          description: `Free tier allows comparison of ${maxSelections} firms only. Subscribe to our premium plan for unlimited comparisons.`,
          variant: "destructive",
        });
        return;
      } else {
        // Replace the oldest selection in a first-in-first-out manner
        const newSelection = [...selectedFirms.slice(1), firmName];
        setSelectedFirms(newSelection);
        return;
      }
    }
    
    // Add to selection if under the limit
    setSelectedFirms([...selectedFirms, firmName]);
  };
  
  // Handle removing a firm
  const handleRemoveFirm = (firmName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Prevent deselection if selections are locked
    if (isSelectionLocked || lockSelection) {
      toast({
        title: "Selections Locked",
        description: "You've reached your selection limit. Subscribe to premium for unlimited selections.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFirms(selectedFirms.filter(firm => firm !== firmName));
  };
  
  // Map to standardize firm names to prevent duplicates
  const standardizeFirmName = (name: string): string => {
    if (!name) return "";
    
    const nameLower = name.toLowerCase().trim();
    
    if (nameLower.includes('morgan stanley') || nameLower === 'ms') {
      return "Morgan Stanley";
    } else if (nameLower.includes('merrill') || nameLower === 'ml') {
      return "Merrill Lynch";
    } else if (nameLower.includes('ubs wealth') || nameLower.includes('ubs')) {
      return "UBS";
    } else if (nameLower.includes('ameriprise')) {
      return "Ameriprise";
    } else if (nameLower.includes('finet')) {
      return "Finet";
    } else if (nameLower.includes('lpl financial') || nameLower === 'lpl' || nameLower === 'linsco') {
      return "LPL Financial";
    } else if (nameLower.includes('goldman') || nameLower === 'gs') {
      return "Goldman Sachs";
    } else if (nameLower.includes('jpmorgan') || nameLower.includes('j.p. morgan') || nameLower.includes('jp morgan') || nameLower === 'jpm') {
      return "J.P. Morgan";
    } else if (nameLower.includes('rbc wealth') || nameLower === 'rbc') {
      return "RBC";
    } else if (nameLower.includes('raymond james') || nameLower === 'rj') {
      return "Raymond James";
    } else if (nameLower.includes('rockefeller')) {
      return "Rockefeller";
    } else if (nameLower.includes('sanctuary')) {
      return "Sanctuary";
    } else if (nameLower.includes('wells fargo') || nameLower === 'wf') {
      return "Wells Fargo";
    } else if (nameLower.includes('truist') || nameLower === 'tru') {
      return "tru";
    }
    
    return name; // Return original if no match
  };
  
  // Simplified function to just return the firmList
  const getUniqueFirmNames = () => firmList;
  
  // Show loading state while fetching data
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }
  
  // Show error state if fetch failed
  if (isError) {
    return (
      <div className="text-destructive text-sm">
        Error loading firms. Please try again.
      </div>
    );
  }
  
  const uniqueFirms = getUniqueFirmNames();
  
  return (
    <div className="space-y-3">
      {/* Selected firms badges - with locked state */}
      <div className="flex flex-wrap gap-2 min-h-7">
        {selectedFirms.map(firm => (
          <Badge 
            key={firm} 
            variant="outline" 
            className={cn(
              "py-1 text-sm",
              isSelectionLocked || lockSelection ? "border-primary/30" : ""
            )}
          >
            {firm}
            {!(isSelectionLocked || lockSelection) && (
              <button
                className="ml-1.5 hover:text-destructive"
                onClick={(e) => handleRemoveFirm(firm, e)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {selectedFirms.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Select firms below
          </div>
        )}
      </div>
      
      {/* Selectable firms list - in a 2-column grid, shown only if not at max or if premium */}
      {(!isSelectionLocked || userIsPremium) && (
        <div className="max-h-48 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            {uniqueFirms.map((firm) => (
              <div 
                key={firm}
                className={cn(
                  "px-3 py-2 rounded text-sm flex items-center justify-between",
                  "cursor-pointer hover:bg-primary/10",
                  selectedFirms.includes(firm) ? "bg-primary/20" : "bg-background"
                )}
                onClick={() => handleSelectFirm(firm)}
              >
                <span className="truncate">{firm}</span>
                {selectedFirms.includes(firm) && (
                  <Check className="min-w-5 h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show locked message when max selections reached */}
      {isSelectionLocked && !userIsPremium && (
        <div className="text-sm text-primary bg-primary/5 border border-primary/10 rounded-md p-2.5 flex items-center justify-center gap-2">
          <span className="text-primary font-medium">
            Your {maxSelections} firm selections are locked
          </span>
        </div>
      )}
    </div>
  );
}