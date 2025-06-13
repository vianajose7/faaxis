import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calculator, LockIcon, ArrowRight, BarChart2 } from "lucide-react";
import { AdvisorInfo } from "@/lib/calculator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usStates from "../../lib/us-states";
import { defaultAdvisorInfo } from "@/hooks/use-advisor-info";
import { useEffect } from "react";

const formSchema = z.object({
  aum: z.string().min(1, "AUM is required"),
  revenue: z.string().min(1, "Annual revenue is required"),
  feeBasedPercentage: z.string().min(1, "Percentage fee-based is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

interface InitialFormProps {
  onCalculate: (info: AdvisorInfo) => void;
  initialValues?: AdvisorInfo | null;
}

// Helper function to format numbers with commas
function formatNumberWithCommas(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function InitialForm({ onCalculate, initialValues }: InitialFormProps) {
  // Use initialValues if provided, otherwise leave fields blank
  const defaultValues = {
    aum: initialValues ? formatNumberWithCommas(initialValues.aum) : "",
    revenue: initialValues ? formatNumberWithCommas(initialValues.revenue) : "",
    feeBasedPercentage: initialValues ? initialValues.feeBasedPercentage.toString() : "",
    city: initialValues ? initialValues.city : "",
    state: initialValues ? initialValues.state : "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.reset({
        aum: formatNumberWithCommas(initialValues.aum),
        revenue: formatNumberWithCommas(initialValues.revenue),
        feeBasedPercentage: initialValues.feeBasedPercentage.toString(),
        city: initialValues.city,
        state: initialValues.state,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert string values to numbers and remove commas
    const aum = parseFloat(values.aum.replace(/,/g, ""));
    const revenue = parseFloat(values.revenue.replace(/,/g, ""));
    const feeBasedPercentage = parseFloat(values.feeBasedPercentage);

    onCalculate({
      aum,
      revenue,
      feeBasedPercentage,
      city: values.city,
      state: values.state,
    });
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
                    <div className="text-xs text-muted-foreground mt-1">
                      Update your revenue to see projected KPIs
                    </div>
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
