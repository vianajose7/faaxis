import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calculator, Plus, Minus, BarChart2, Info } from "lucide-react";
import { AdvisorInfo } from "@/lib/calculator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import usStates from "../../lib/us-states";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const enhancedDetailedFormSchema = z.object({
  // Basic info (carried over from initial form)
  aum: z.string().min(1, "AUM is required"),
  revenue: z.string().min(1, "Annual revenue is required"),
  feeBasedPercentage: z.string().min(1, "Percentage fee-based is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  currentFirm: z.string().optional(),
  
  // Additional premium fields
  deferredComp: z.boolean().default(false),
  onADeal: z.boolean().default(false),
  banking: z.boolean().default(false),
  international: z.boolean().default(false),
  internationalCountries: z.array(z.string()).optional(),
  lending: z.boolean().default(false),
  smas: z.boolean().default(false),
  households: z.string().min(0, "Households cannot be negative").optional(),
  
  // Extended fields for the detailed version
  yearsInIndustry: z.string().min(1, "Years in industry is required"),
  clientRetentionRate: z.string().min(1, "Client retention rate is required"),
  currentPayout: z.string().min(1, "Current payout percentage is required"),
  transitionPreference: z.string().min(1, "Transition preference is required"),
  retirementTimeline: z.string().min(1, "Retirement timeline is required"),
  hasTeam: z.boolean().default(false),
  teamSize: z.string().optional(),
  preferredFirms: z.array(z.string()).optional(),
  includeIndependent: z.boolean().default(true),
  targetAnnualGrowthRate: z.string().min(1, "Target growth rate is required"),
});

interface EnhancedDetailedFormProps {
  initialValues: AdvisorInfo;
  onCalculate: (info: any) => void;
}

export function EnhancedDetailedForm({ initialValues, onCalculate }: EnhancedDetailedFormProps) {
  const [hasTeam, setHasTeam] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');
  
  const form = useForm<z.infer<typeof enhancedDetailedFormSchema>>({
    resolver: zodResolver(enhancedDetailedFormSchema),
    defaultValues: {
      // Pre-populate with initial values
      aum: initialValues.aum.toLocaleString(),
      revenue: initialValues.revenue.toLocaleString(),
      feeBasedPercentage: initialValues.feeBasedPercentage.toString(),
      city: initialValues.city,
      state: initialValues.state,
      currentFirm: initialValues.currentFirm || '',
      
      // Advanced variables default values
      deferredComp: initialValues.deferredComp || false,
      onADeal: initialValues.onADeal || false,
      banking: initialValues.banking || false,
      international: initialValues.international || false,
      internationalCountries: initialValues.internationalCountries || [],
      lending: initialValues.lending || false,
      smas: initialValues.smas || false,
      households: initialValues.households?.toString() || "0",
      
      // Default values for extended fields
      yearsInIndustry: "10",
      clientRetentionRate: "92",
      currentPayout: "40",
      transitionPreference: "wirehouse",
      retirementTimeline: "10+",
      hasTeam: false,
      teamSize: "0",
      preferredFirms: ["Morgan Stanley", "Merrill Lynch", "UBS Wealth"],
      includeIndependent: true,
      targetAnnualGrowthRate: "8",
    },
  });

  const toggleHasTeam = (checked: boolean) => {
    setHasTeam(checked);
    form.setValue("hasTeam", checked);
  };
  
  const toggleInternational = (checked: boolean) => {
    setIsInternational(checked);
    form.setValue("international", checked);
    if (!checked) {
      form.setValue("internationalCountries", []);
      setCountries([]);
    }
  };
  
  const addCountry = () => {
    if (newCountry && !countries.includes(newCountry)) {
      const updatedCountries = [...countries, newCountry];
      setCountries(updatedCountries);
      form.setValue("internationalCountries", updatedCountries);
      setNewCountry('');
    }
  };
  
  const removeCountry = (country: string) => {
    const updatedCountries = countries.filter(c => c !== country);
    setCountries(updatedCountries);
    form.setValue("internationalCountries", updatedCountries);
  };

  const handleSubmit = (values: z.infer<typeof enhancedDetailedFormSchema>) => {
    // Process the form values and calculate
    const processedValues = {
      ...values,
      aum: parseFloat(String(values.aum).replace(/,/g, '')),
      revenue: parseFloat(String(values.revenue).replace(/,/g, '')),
      feeBasedPercentage: parseFloat(values.feeBasedPercentage),
      households: values.households ? parseInt(values.households) : 0,
      yearsInIndustry: parseInt(values.yearsInIndustry),
      currentPayout: parseFloat(values.currentPayout),
      targetAnnualGrowthRate: parseFloat(values.targetAnnualGrowthRate),
      teamSize: values.teamSize ? parseInt(values.teamSize) : 0,
    };
    
    onCalculate(processedValues);
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-card/80 rounded-xl shadow-sm">
        <CardContent className="pt-6 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-primary" />
            Premium Advisor Analysis
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Accordion type="single" collapsible defaultValue="basic">
                <AccordionItem value="basic">
                  <AccordionTrigger className="text-md font-medium">Basic Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
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
                                  placeholder="0"
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
                                  placeholder="0"
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
                            <div className="flex items-center gap-2">
                              <FormLabel>Percentage Fee-Based</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>85%+ fee-based means +5% upfront and +10% in backend payouts. Under 65% means -5% upfront and -5% in backend payouts.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  className="pr-8 bg-muted"
                                  placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Current Firm */}
                      <FormField
                        control={form.control}
                        name="currentFirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Firm (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-muted"
                                placeholder="Your current firm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-muted"
                                  placeholder="City"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-muted">
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {usStates.map(state => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="professional">
                  <AccordionTrigger className="text-md font-medium">Professional Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Years in Industry */}
                      <FormField
                        control={form.control}
                        name="yearsInIndustry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years in Industry</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-muted"
                                type="number"
                                min="0"
                                max="50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Client Retention Rate */}
                      <FormField
                        control={form.control}
                        name="clientRetentionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Retention Rate (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  className="pr-8 bg-muted"
                                  type="number"
                                  min="0"
                                  max="100"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Current Payout */}
                      <FormField
                        control={form.control}
                        name="currentPayout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Payout (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  className="pr-8 bg-muted"
                                  type="number"
                                  min="0"
                                  max="100"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Transition Preference */}
                      <FormField
                        control={form.control}
                        name="transitionPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transition Preference</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-muted">
                                  <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="wirehouse">Wirehouse</SelectItem>
                                <SelectItem value="independent">Independent</SelectItem>
                                <SelectItem value="regionalBD">Regional Broker-Dealer</SelectItem>
                                <SelectItem value="ria">RIA</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Retirement Timeline */}
                      <FormField
                        control={form.control}
                        name="retirementTimeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retirement Timeline</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-muted">
                                  <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-5">0-5 Years</SelectItem>
                                <SelectItem value="5-10">5-10 Years</SelectItem>
                                <SelectItem value="10+">10+ Years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Team Information */}
                      <FormField
                        control={form.control}
                        name="hasTeam"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Team Structure</FormLabel>
                              <FormDescription>Do you work with a team?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  toggleHasTeam(checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {hasTeam && (
                        <FormField
                          control={form.control}
                          name="teamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Size (# of producers)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-muted"
                                  type="number"
                                  min="1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Number of Households */}
                      <FormField
                        control={form.control}
                        name="households"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Households</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-muted"
                                type="number"
                                min="0"
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="premium">
                  <AccordionTrigger className="text-md font-medium">Premium Variables</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Deferred Comp */}
                      <FormField
                        control={form.control}
                        name="deferredComp"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Deferred Compensation</FormLabel>
                              <FormDescription>Do you have deferred compensation at your current firm?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* On a Deal */}
                      <FormField
                        control={form.control}
                        name="onADeal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Currently On a Deal</FormLabel>
                              <FormDescription>Are you currently on a recruiting deal?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* Banking */}
                      <FormField
                        control={form.control}
                        name="banking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Banking Business</FormLabel>
                              <FormDescription>Do you have significant banking business?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* International */}
                      <FormField
                        control={form.control}
                        name="international"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">International Business</FormLabel>
                              <FormDescription>Do you have international clients?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  toggleInternational(checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {isInternational && (
                        <div className="pl-4 border-l-2 border-muted space-y-2">
                          <FormLabel>Which countries?</FormLabel>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {countries.map(country => (
                              <Badge key={country} variant="secondary" className="flex items-center gap-1">
                                {country}
                                <button 
                                  type="button" 
                                  onClick={() => removeCountry(country)}
                                  className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-xs"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={newCountry}
                              onChange={(e) => setNewCountry(e.target.value)}
                              className="bg-muted"
                              placeholder="Enter country name"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline" 
                              onClick={addCountry}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Lending */}
                      <FormField
                        control={form.control}
                        name="lending"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Lending</FormLabel>
                              <FormDescription>Do you use securities based lending products?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* SMAs */}
                      <FormField
                        control={form.control}
                        name="smas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Separately Managed Accounts</FormLabel>
                              <FormDescription>Do you utilize SMAs in your practice?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="growth">
                  <AccordionTrigger className="text-md font-medium">Growth & Analysis</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Target Annual Growth Rate */}
                      <FormField
                        control={form.control}
                        name="targetAnnualGrowthRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Annual Growth Rate (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  className="pr-8 bg-muted"
                                  type="number"
                                  min="0"
                                  max="30"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Include Independent Analysis */}
                      <FormField
                        control={form.control}
                        name="includeIndependent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Independent Options</FormLabel>
                              <FormDescription>Include independent options in analysis?</FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button type="submit" className="w-full">
                <BarChart2 className="h-4 w-4 mr-2" />
                Generate Premium Analysis
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}