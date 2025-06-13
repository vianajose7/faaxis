import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { Honeypot, withSpamProtection } from "@/components/ui/honeypot";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  feedbackType: z.enum(["suggestion", "bug", "question", "praise", "other"], {
    required_error: "Please select a feedback type",
  }),
  area: z.string({
    required_error: "Please select an area",
  }),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  feedback: z.string().min(10, "Please provide detailed feedback (at least 10 characters)"),
  screenshot: z.string().optional(),
  honeypot: z.string().optional(),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

const feedbackAreas = [
  { value: "calculator", label: "Compensation Calculator" },
  { value: "marketplace", label: "Marketplace" },
  { value: "dealParamsAndFirms", label: "Deal Parameters & Firms" },
  { value: "dashboard", label: "User Dashboard" },
  { value: "auth", label: "Account & Authentication" },
  { value: "blog", label: "Blog & Content" },
  { value: "ui", label: "User Interface" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeverity, setShowSeverity] = useState(false);
  
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      feedbackType: "suggestion",
      area: "",
      feedback: "",
      screenshot: "",
      honeypot: "",
    },
  });
  
  const watchFeedbackType = form.watch("feedbackType");
  
  React.useEffect(() => {
    setShowSeverity(watchFeedbackType === "bug");
  }, [watchFeedbackType]);
  
  const handleSubmit = async (values: FeedbackValues) => {
    try {
      setIsSubmitting(true);
      
      // Submit feedback to the API
      const response = await apiRequest("POST", "/api/feedback", values);
      
      if (response.ok) {
        toast({
          title: "Feedback submitted successfully!",
          description: "Thank you for helping us improve FaAxis.",
        });
        
        // Reset form
        form.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit feedback");
      }
    } catch (error: any) {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = withSpamProtection(handleSubmit);

  return (
    <div className="container py-12 md:py-20">
      <Helmet>
        <title>Submit Feedback | FaAxis Beta</title>
        <meta
          name="description"
          content="Help us improve FaAxis by submitting your feedback, reporting bugs, or suggesting new features."
        />
      </Helmet>
      
      <PageHeader
        title="Submit Feedback"
        description="Help us improve FaAxis by sharing your thoughts, reporting issues, or suggesting new features."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 mt-10">
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="warren@valueinvest.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    <FormField
                      control={form.control}
                      name="feedbackType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-base">Feedback Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="suggestion" id="suggestion" />
                                <FormLabel htmlFor="suggestion" className="font-normal cursor-pointer">
                                  Suggestion
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bug" id="bug" />
                                <FormLabel htmlFor="bug" className="font-normal cursor-pointer">
                                  Bug Report
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="question" id="question" />
                                <FormLabel htmlFor="question" className="font-normal cursor-pointer">
                                  Question
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="praise" id="praise" />
                                <FormLabel htmlFor="praise" className="font-normal cursor-pointer">
                                  Praise
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <FormLabel htmlFor="other" className="font-normal cursor-pointer">
                                  Other
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {feedbackAreas.map((area) => (
                                <SelectItem key={area.value} value={area.value}>
                                  {area.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Which part of FaAxis are you providing feedback on?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {showSeverity && (
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Bug Severity</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="low" />
                                <FormLabel htmlFor="low" className="font-normal cursor-pointer">
                                  Low
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <FormLabel htmlFor="medium" className="font-normal cursor-pointer">
                                  Medium
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="high" />
                                <FormLabel htmlFor="high" className="font-normal cursor-pointer">
                                  High
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="critical" id="critical" />
                                <FormLabel htmlFor="critical" className="font-normal cursor-pointer">
                                  Critical
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            How severe is this bug?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your feedback in detail..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        {watchFeedbackType === "bug" && (
                          <FormDescription>
                            Please include steps to reproduce, what you expected to happen, and what actually happened.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="screenshot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screenshot URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://imgur.com/your-screenshot"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a link to a screenshot that helps illustrate your feedback.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Honeypot field for spam protection */}
                  <Honeypot name="honeypot" form={form} />
                  
                  <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Alert className="p-5 shadow-md">
            <InfoIcon className="h-5 w-5 text-primary" />
            <AlertTitle className="text-xl font-semibold mb-2">Why Your Feedback Matters</AlertTitle>
            <AlertDescription className="text-base">
              As a beta product, FaAxis is constantly evolving based on user feedback. Your input directly shapes our roadmap and development priorities.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6 bg-muted/30 p-6 rounded-xl">
            <div className="border-l-4 border-primary/30 pl-4">
              <h3 className="text-lg font-medium mb-3 text-foreground">What happens to my feedback?</h3>
              <p className="text-muted-foreground">
                All feedback is reviewed by our product team and prioritized based on user impact and strategic alignment. 
                High-priority items are added to our development sprint within 1-2 weeks.
              </p>
            </div>
            
            <div className="border-l-4 border-primary/30 pl-4">
              <h3 className="text-lg font-medium mb-3 text-foreground">Will I hear back?</h3>
              <p className="text-muted-foreground">
                For bug reports and specific questions, we'll follow up via email within 2 business days. For suggestions and general feedback, 
                we may reach out if we need clarification or want to involve you in testing.
              </p>
            </div>
            
            <div className="border-l-4 border-primary/30 pl-4">
              <h3 className="text-lg font-medium mb-3 text-foreground">Beta Program Benefits</h3>
              <p className="text-muted-foreground">
                Active beta participants get early access to new features, influence product direction, and may receive 
                special offers when we launch premium features. We regularly invite our most engaged users to exclusive preview sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}