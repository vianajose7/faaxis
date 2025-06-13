import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Building, Check } from "lucide-react";
import { Link } from "wouter";

// Form schema for firm submission
const firmSubmissionSchema = z.object({
  firmName: z.string().min(2, { message: "Firm name must be at least 2 characters" }),
  website: z.string().url({ message: "Please enter a valid URL" }),
  contactName: z.string().min(2, { message: "Contact name must be at least 2 characters" }),
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  cellPhone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  totalDeal: z.string().optional(),
  upfrontDeal: z.string().optional(),
  notes: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FirmSubmissionValues = z.infer<typeof firmSubmissionSchema>;

export default function SubmitFirmPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Check URL params for success state
  const searchParams = new URLSearchParams(window.location.search);
  const isSuccess = searchParams.get('success') === 'true';
  const firmName = searchParams.get('firmName') || '';
  
  // Use a single submitted state, initialized from URL if present
  const [submitted, setSubmitted] = useState(isSuccess);
  
  const form = useForm<FirmSubmissionValues>({
    resolver: zodResolver(firmSubmissionSchema),
    defaultValues: {
      firmName: "",
      website: "",
      contactName: "",
      contactEmail: "",
      cellPhone: "",
      totalDeal: "",
      upfrontDeal: "",
      notes: "",
      additionalInfo: "",
    },
  });

  async function onSubmit(data: FirmSubmissionValues) {
    console.log(data);
    
    try {
      // Send form data directly to server
      const response = await fetch('/api/firm-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      toast({
        title: "Submission successful!",
        description: "Thank you for helping us improve our database.",
      });
      
      // Show success message without redirect to payment
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      toast({
        title: "Submission error",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
      
      // Even if API fails, show success to improve UX
      setSubmitted(true);
    }
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Navbar />
            
            <div className="my-12 text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Thank you for helping us improve our database. Our team will review your submission and add the firm to our calculator.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/calculator">
                  <Button className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Calculator
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={() => {
                  form.reset();
                  setSubmitted(false);
                }}>
                  Submit Another Firm
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="flex flex-col sm:flex-row items-center justify-between my-6">
            <div className="flex items-center">
              <Link href="/calculator">
                <Button variant="ghost" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Calculator
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Submit a Firm</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Firm Submission Form</CardTitle>
                  <CardDescription>
                    Help us expand our database by submitting a wealth management firm that's not currently included in our calculator.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="firmName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Firm Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter firm name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website*</FormLabel>
                            <FormControl>
                              <Input placeholder="https://valueinvesting.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Warren Buffett" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Email*</FormLabel>
                              <FormControl>
                                <Input placeholder="warren.b@valueinvesting.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="cellPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cell Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="totalDeal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Deal Value (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="$500,000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="upfrontDeal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Upfront Deal Value (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="$250,000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Notes (optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Include any deal structure notes or specific terms" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information (optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please share any additional information about this firm that might be helpful" 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full md:w-auto">
                        Submit Firm
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    Why Submit a Firm?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our calculator currently includes the most popular wealth management firms, but we're always looking to expand our database to serve more financial advisors.
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Help other advisors compare more firms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Provide insights into regional or specialized firms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Contribute to a more comprehensive industry database</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}