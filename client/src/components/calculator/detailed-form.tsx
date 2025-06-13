import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calculator, BarChart2 } from "lucide-react";
import { AdvisorInfo } from "@/lib/calculator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import usStates from "../../lib/us-states";

const detailedFormSchema = z.object({
  // Basic info (carried over from initial form)
  aum: z.string().min(1, "AUM is required"),
  revenue: z.string().min(1, "Annual revenue is required"),
  feeBasedPercentage: z.string().min(1, "Percentage fee-based is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  
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

interface DetailedFormProps {
  initialValues: AdvisorInfo;
  onCalculate: (info: any) => void;
}

export function DetailedForm({ initialValues, onCalculate }: DetailedFormProps) {
  const [hasTeam, setHasTeam] = useState(false);
  
  const form = useForm<z.infer<typeof detailedFormSchema>>({
    resolver: zodResolver(detailedFormSchema),
    defaultValues: {
      // Pre-populate with initial values
      aum: initialValues.aum.toLocaleString(),
      revenue: initialValues.revenue.toLocaleString(),
      feeBasedPercentage: initialValues.feeBasedPercentage.toString(),
      city: initialValues.city,
      state: initialValues.state,
      
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

  const handleSubmit = (values: z.infer<typeof detailedFormSchema>) => {
    // Process the form values and calculate
    onCalculate(values);
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-card/80 rounded-xl">
        <CardContent className="pt-6 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-primary" />
            Detailed Analysis Setup
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">Basic Information</h3>
                
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
                      <FormLabel>Percentage Fee-Based</FormLabel>
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
              
              <div className="space-y-4 pt-2">
                <h3 className="text-md font-medium text-foreground">Professional Details</h3>
                
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
                
                {/* Preferred Firms */}
                <div className="space-y-2">
                  <FormLabel>Preferred Firms to Analyze</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="preferredFirms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("Morgan Stanley")}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, "Morgan Stanley"]);
                                } else {
                                  field.onChange(currentValue.filter(val => val !== "Morgan Stanley"));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Morgan Stanley
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredFirms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("Merrill Lynch")}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, "Merrill Lynch"]);
                                } else {
                                  field.onChange(currentValue.filter(val => val !== "Merrill Lynch"));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Merrill Lynch
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredFirms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("UBS Wealth")}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, "UBS Wealth"]);
                                } else {
                                  field.onChange(currentValue.filter(val => val !== "UBS Wealth"));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            UBS Wealth
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="includeIndependent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Independent
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Target Annual Growth Rate */}
                <FormField
                  control={form.control}
                  name="targetAnnualGrowthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Annual Growth Rate (%)</FormLabel>
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground block mb-2">
                          {field.value}%
                        </span>
                        <FormControl>
                          <Slider
                            min={0}
                            max={25}
                            step={1}
                            className="mb-6"
                            value={[parseInt(field.value)]}
                            onValueChange={(value) => field.onChange(value[0].toString())}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Calculate Button */}
              <Button 
                type="submit" 
                className="w-full py-6 font-medium"
                disabled={form.formState.isSubmitting}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Calculating..." : "Generate Detailed Analysis"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
