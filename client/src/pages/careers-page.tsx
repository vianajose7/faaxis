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
import { Honeypot } from "@/components/ui/honeypot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Head } from "@/components/layout/head";

const jobApplicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  position: z.string().min(1, "Please select a position"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
  honeypot: z.string().optional(),
});

type JobApplicationValues = z.infer<typeof jobApplicationSchema>;

const positions = [
  {
    id: "advisor-success-manager",
    title: "Advisor Success Manager",
    location: "Remote",
    salary: "$150,000 - $175,000",
    description: "Guide financial advisors through their transition journey, optimize their experience with our platform, and ensure they achieve their growth objectives."
  },
  {
    id: "senior-financial-analyst",
    title: "Senior Financial Analyst",
    location: "Remote",
    salary: "$175,000 - $200,000",
    description: "Analyze complex financial data, develop predictive models, and provide strategic insights to help advisors make informed decisions about their practice transitions."
  },
  {
    id: "head-of-business-development",
    title: "Head of Business Development",
    location: "Remote",
    salary: "$200,000 - $225,000",
    description: "Lead our strategic partnerships, develop relationships with key industry players, and drive growth initiatives to expand our platform's reach and impact."
  }
];

export default function CareersPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("");
  
  const form = useForm<JobApplicationValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      coverLetter: "",
      resumeUrl: "",
      honeypot: "",
    },
  });
  
  const handleSubmit = async (values: JobApplicationValues) => {
    try {
      setIsSubmitting(true);
      
      // Submit application to the API
      const response = await apiRequest("POST", "/api/applications", values);
      
      if (response.ok) {
        toast({
          title: "Application submitted successfully!",
          description: "Thank you for your interest. We'll be in touch soon.",
        });
        
        // Reset form
        form.reset();
        setSelectedPosition("");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePositionSelect = (positionId: string) => {
    setSelectedPosition(positionId);
    const position = positions.find(p => p.id === positionId);
    if (position) {
      form.setValue("position", position.title);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Head 
        title="Careers | FaAxis"
        description="Join the FaAxis team. Explore career opportunities and help shape the future of financial advisor transitions."
        canonicalUrl="/careers"
      />
      
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-10 md:py-16">
        <PageHeader
          title="Join Our Team"
          description="Explore opportunities to work with us and help revolutionize the financial advisor transition industry."
        />
      
        <div className="grid grid-cols-1 gap-8 mb-12">
          <div className="prose prose-lg max-w-none text-foreground">
            <p>
              At FaAxis, we're building the future of financial advisor transitions through innovative technology 
              and data-driven insights. Our team combines deep industry expertise with cutting-edge AI and 
              analytics to help advisors make better career decisions.
            </p>
            <p>
              We're looking for passionate individuals who are excited about transforming an industry and 
              creating meaningful impact. If you're interested in joining our mission, explore our current 
              opportunities below.
            </p>
          </div>
        </div>
      
        <h2 className="text-2xl font-bold mb-6 text-foreground">Open Positions</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {positions.map((position) => (
            <Card 
              key={position.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedPosition === position.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => handlePositionSelect(position.id)}
            >
              <CardHeader>
                <CardTitle className="text-foreground">{position.title}</CardTitle>
                <CardDescription>
                  <div className="flex flex-col space-y-1 mt-2">
                    <div className="text-sm">{position.location}</div>
                    <div className="text-sm font-medium text-primary">{position.salary}</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{position.description}</p>
                <Button 
                  variant={selectedPosition === position.id ? "default" : "outline"} 
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePositionSelect(position.id);
                    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {selectedPosition === position.id ? "Selected" : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      
        <Separator className="my-12" />
      
        <div id="application-form" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Apply Now</h2>
          
          <div className="bg-card border rounded-lg p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
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
                        <FormLabel className="text-foreground">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Position</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Select a position above"
                            {...field}
                            readOnly
                            value={field.value}
                            className={selectedPosition ? "bg-muted cursor-not-allowed" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Cover Letter (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you're interested in this position and what you would bring to the team..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share your relevant experience and why you'd be a good fit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Resume URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://drive.google.com/file/d/your-resume"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a link to your resume on Google Drive, Dropbox, or similar service.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Honeypot field for spam protection */}
                <div style={{ display: 'none' }}>
                  <FormField
                    control={form.control}
                    name="honeypot"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}