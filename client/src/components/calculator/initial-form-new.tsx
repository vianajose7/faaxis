import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calculator, LockIcon, ArrowRight, BarChart2, ChevronDown } from "lucide-react";
import { AdvisorInfo } from "@/lib/calculator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usStates from "../../lib/us-states";
import { defaultAdvisorInfo } from "@/hooks/use-advisor-info";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useFirmDeals } from "@/lib/airtable-service";
import { Link } from "wouter";
import { FirmSelector } from "@/components/calculator/firm-selector";
import { firmList } from "@shared/firmList";

const formSchema = z.object({
  currentFirm: z.string().min(1, "Current firm is required"),
  aum: z.string().min(1, "AUM is required"),
  revenue: z.string().min(1, "Annual revenue is required"),
  feeBasedPercentage: z.string().min(1, "Percentage fee-based is required"),
});

interface InitialFormProps {
  onCalculate: (info: AdvisorInfo, selectedFirms?: string[]) => void;
  initialValues?: AdvisorInfo | null;
}

// Import the utility function instead of defining it here
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/format-utils";

export function InitialForm({ onCalculate, initialValues }: InitialFormProps) {
  const { user } = useAuth();
  const [premiumExpanded, setPremiumExpanded] = useState(false);
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  
  // Maximum number of firms non-premium users can select
  const MAX_FREE_SELECTIONS = 3;
  
  // Fetch firm data from Airtable
  const { data: firmDeals, isLoading } = useFirmDeals();
  
  // Get unique firm names from shared firmList and Airtable data
  const getUniqueFirmNames = (): string[] => {
    // Use the shared firm list as the base set of firms
    let combinedFirms = [...firmList];
    
    // Add Airtable firms if available
    if (firmDeals && firmDeals.length > 0) {
      const airtableFirms = firmDeals.map(deal => deal.firm)
        .filter(Boolean);
      
      // Combine all firms and remove duplicates
      combinedFirms = Array.from(new Set([...combinedFirms, ...airtableFirms]));
    }
    
    // Sort alphabetically and ensure "Other" is at the end
    return [...combinedFirms.sort(), "Other"];
  };
  
  const uniqueFirms = getUniqueFirmNames();
  
  // Use initialValues if provided, otherwise leave fields blank
  const defaultValues = {
    aum: initialValues ? formatNumberWithCommas(initialValues.aum) : "",
    revenue: initialValues ? formatNumberWithCommas(initialValues.revenue) : "",
    feeBasedPercentage: initialValues ? initialValues.feeBasedPercentage.toString() : "",
    currentFirm: initialValues?.currentFirm || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // When AUM changes, automatically calculate revenue as 1% of AUM if not manually set
  const watchAum = form.watch("aum");
  
  // Handle field formatting with commas for AUM
  const handleAumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "") {
      form.setValue("aum", "");
      return;
    }
    
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
    
    const formatted = formatNumberWithCommas(rawValue);
    form.setValue("aum", formatted);
    
    // Auto-calculate revenue if it's empty
    const aumValue = parseFloat(rawValue);
    if (!isNaN(aumValue) && aumValue > 0) {
      const currentRevenue = form.getValues("revenue");
      const isRevenueEmpty = !currentRevenue || currentRevenue === "";
      
      if (isRevenueEmpty) {
        // Auto-calculate revenue as 1% of AUM
        const calculatedRevenue = Math.round(aumValue * 0.01);
        form.setValue("revenue", formatNumberWithCommas(calculatedRevenue));
      }
    }
  };
  
  // Handle field formatting with commas for Revenue
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "") {
      form.setValue("revenue", "");
      return;
    }
    
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
    
    const formatted = formatNumberWithCommas(rawValue);
    form.setValue("revenue", formatted);
  };

  // Update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.reset({
        aum: formatNumberWithCommas(initialValues.aum),
        revenue: formatNumberWithCommas(initialValues.revenue),
        feeBasedPercentage: initialValues.feeBasedPercentage.toString(),
        currentFirm: initialValues.currentFirm || "",
      });
    }
  }, [initialValues, form]);

  // Don't automatically add the current firm to selectedFirms
  // This was causing confusion as it was always adding the current firm to selections
  useEffect(() => {
    // Intentionally left empty - we no longer automatically add the current firm
  }, [initialValues?.currentFirm]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Convert string values to numbers and remove commas
    const aum = parseFloat(values.aum.replace(/,/g, ""));
    const revenue = parseFloat(values.revenue.replace(/,/g, ""));
    const feeBasedPercentage = parseFloat(values.feeBasedPercentage);

    const advisorInfo = {
      aum,
      revenue,
      feeBasedPercentage,
      city: "",
      state: "",
      currentFirm: values.currentFirm || "",
    };
    
    // Use only the firms that were explicitly selected by the user
    // No longer automatically adding the current firm to avoid confusion
    let firmsToCompare = [...selectedFirms];
    
    // Pass selected firms along with advisor info to parent component
    onCalculate(advisorInfo, firmsToCompare);
    
    // If user is logged in, save this info to their profile
    if (user) {
      try {
        await apiRequest("POST", "/api/update-profile", {
          aum: aum.toString(),
          revenue: revenue.toString(),
          feeBasedPercentage: feeBasedPercentage.toString(), 
          firm: values.currentFirm || user.firm || "",
          fullName: user.fullName || "",
          phone: user.phone || "",
        });
        
        // Successfully updated profile, no need to do anything else
        console.log("Profile updated with calculator data");
      } catch (error) {
        console.error("Error updating profile with calculator data:", error);
      }
    }
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-card/80 rounded-xl sticky top-8">
        <CardContent className="pt-6 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-primary" />
            Initial Assessment
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Current Firm - Moved to the top */}
              <FormField
                control={form.control}
                name="currentFirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Firm</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Select current firm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <div className="px-2 py-4 text-center">Loading...</div>
                        ) : (
                          uniqueFirms.map(firm => (
                            <SelectItem key={firm} value={firm}>
                              {firm}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              {/* AUM Input */}
              <FormField
                control={form.control}
                name="aum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assets Under Management</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          {...field}
                          className="pl-8 pr-16 bg-muted"
                          placeholder="e.g., 45,000,000"
                          onChange={handleAumChange}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">USD</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Annual Revenue */}
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          {...field}
                          className="pl-8 pr-16 bg-muted"
                          placeholder="e.g., 450,000"
                          onChange={handleRevenueChange}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">USD</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fee-Based Percentage */}
              <FormField
                control={form.control}
                name="feeBasedPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage Fee-Based</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pr-8 bg-muted"
                          placeholder="e.g., 75"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              
              {/* Firm Selection Component - Enhanced readability */}
              <div className="mt-4">
                <FormItem>
                  <FormLabel className="text-base font-medium">Firms to Compare</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select up to {MAX_FREE_SELECTIONS} firms for comparison
                  </p>
                  <div className="border rounded-md p-4">
                    <FirmSelector 
                      selectedFirms={selectedFirms}
                      setSelectedFirms={setSelectedFirms}
                      maxSelections={MAX_FREE_SELECTIONS}
                      requireSubscription={true}
                      userIsPremium={false}
                    />
                  </div>
                </FormItem>
              </div>
              
              {/* Premium features dropdown (locked) - improved readability */}
              <div className="mt-4">
                <div className="border rounded-md overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setPremiumExpanded(!premiumExpanded)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <LockIcon className="h-4.5 w-4.5 text-primary" />
                        <span className="font-medium text-base">Premium Features</span>
                        <span className="ml-1 bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full border border-primary/20">Pro</span>
                      </div>
                      <div className="text-xs text-primary font-medium ml-6">🔓 Unlock all 25+ firms & detailed analysis</div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${premiumExpanded ? 'transform rotate-180' : ''}`} />
                  </div>
                  
                  {premiumExpanded && (
                    <div className="px-4 pb-4">
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="flex flex-col items-center text-center gap-2">
                          <h3 className="font-medium text-base">Advisor-Specific Calculations</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Get more accurate compensation tailored to your practice details. Premium unlocks <span className="text-primary font-medium">ALL firms</span> plus advanced features.
                          </p>
                          
                          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">Deferred Comp</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">Banking</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">Growth Rate</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">SMA</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">Alternatives</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-muted">+10 more</span>
                          </div>
                          
                          <Link 
                            href="/checkout" 
                            className="text-primary hover:text-primary/80 text-sm flex items-center justify-center gap-1.5 mt-2"
                          >
                            Upgrade to Premium
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculate Button */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full py-6 font-medium"
                  disabled={form.formState.isSubmitting}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Calculating..." : "Calculate Offers"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}