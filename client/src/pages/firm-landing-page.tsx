import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import CountUp from "react-countup";
import { 
  ExternalLink, 
  ArrowRight, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  Calculator,
  PhoneCall,
  ArrowLeft,
  Star,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  DollarSign,
  Briefcase,
  CalendarClock,
  Lock,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for firm profile
interface FirmProfile {
  id: string;
  firm: string;
  ceo: string;
  bio: {
    state: string;
    value: string | null;
    isStale: boolean;
  };
  logoUrl: string;
  founded: string;
  headquarters: string;
}

// Define types for calculator parameters
interface CalculatorParameter {
  id: number;
  firm: string;
  paramName: string;
  paramValue: string;
  notes: string;
}

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  currentFirm: z.string().min(1, "Please select your current firm"),
  aum: z.string().optional(),
  message: z.string().optional(),
  honeypot: z.string().optional() // Used to catch bots
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Component for testimonials
interface TestimonialProps {
  quote: string;
  author: string;
  position?: string;
}

const Testimonial = ({ quote, author, position }: TestimonialProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
    <div className="text-lg italic mb-4 dark:text-gray-200">&ldquo;{quote}&rdquo;</div>
    <div className="font-semibold dark:text-gray-100">{author}</div>
    {position && <div className="text-gray-500 dark:text-gray-400 text-sm">{position}</div>}
  </div>
);

// Component for firm comparisons
interface FirmComparisonProps {
  targetFirm: string;
  items: Array<{
    feature: string;
    independentHas: boolean;
    firmHas: boolean;
    notes?: string;
  }>;
}

const FirmComparison = ({ targetFirm, items }: FirmComparisonProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Feature
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Independent Options
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {targetFirm}
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Notes
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item, idx) => (
          <tr key={idx} className="even:bg-gray-50 dark:even:bg-gray-700/30">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
              {item.feature}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {item.independentHas ? <Check className="text-green-500 dark:text-green-400" /> : <X className="text-red-500 dark:text-red-400" />}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {item.firmHas ? <Check className="text-green-500 dark:text-green-400" /> : <X className="text-red-500 dark:text-red-400" />}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {item.notes || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Stat card component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({ label, value, icon, color = "blue" }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", 
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
  };
  
  return (
    <div className={`p-5 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]} flex items-center`}>
      <div className="mr-4">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm">{label}</div>
      </div>
    </div>
  );
};

export default function FirmLandingPage() {
  // Support multiple URL patterns: /firms/:firmName, /:firmSlug
  const [matchByName, paramsByName] = useRoute('/firms/:firmName');
  const [matchBySlug, paramsBySlug] = useRoute('/:firmSlug'); 
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State variables
  const [firmProfile, setFirmProfile] = useState<FirmProfile | null>(null);
  const [calculatorParams, setCalculatorParams] = useState<CalculatorParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Determine which URL pattern we're using and extract the firm identifier
  const firmSlug = paramsBySlug?.firmSlug;
  const firmName = paramsByName ? decodeURIComponent(paramsByName.firmName || "") : "";
  const usingSlugPattern = !!matchBySlug;
  
  // Debug URL pattern information
  console.log('URL Pattern Information:', {
    matchByName,
    matchBySlug,
    firmName,
    firmSlug,
    usingSlugPattern
  });
  
  // Helper function to convert firm name to slug (lowercase, no spaces or special chars)
  const createSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/-+/g, '')
      .trim();
  };
  
  // Generate brand color from firm name (consistent but pseudo-random)
  const generateBrandColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Map to a hue (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return HSL color with controlled saturation and lightness
    return `hsl(${hue}, 70%, 45%)`;
  };

  // Define comparison items
  const comparisonItems = [
    {
      feature: "Independent Decision Making",
      independentHas: true,
      firmHas: false,
      notes: "Full independence on business decisions"
    },
    {
      feature: "Freedom to Choose Technology",
      independentHas: true, 
      firmHas: false,
      notes: "Select your preferred tech stack"
    },
    {
      feature: "Custom Fee Schedules",
      independentHas: true,
      firmHas: true,
      notes: "Both allow fee customization with limitations"
    },
    {
      feature: "Open Architecture",
      independentHas: true,
      firmHas: false,
      notes: "Access to wider product offerings"
    },
    {
      feature: "Retention of Equity Value",
      independentHas: true,
      firmHas: false,
      notes: "Higher business valuation potential"
    }
  ];
  
  // Form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentFirm: "",
      aum: "",
      message: "",
      honeypot: ""
    }
  });

  // Fetch firm profile and calculator parameters
  useEffect(() => {
    const fetchFirmData = async () => {
      // Only proceed if we have either a firm name or a firm slug
      if (!firmName && !firmSlug) {
        console.log("No firm name or slug provided, skipping data fetch");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine which endpoint to use based on URL pattern
        let profileEndpoint;
        
        if (firmName) {
          // Using the /firms/:firmName pattern
          profileEndpoint = `/api/firm-profiles/${encodeURIComponent(firmName)}`;
          console.log(`Using firm name endpoint: ${profileEndpoint}`);
        } else if (firmSlug) {
          // Using the /:firmSlug pattern
          profileEndpoint = `/api/firm-profiles/slug/${firmSlug}`;
          console.log(`Using firm slug endpoint: ${profileEndpoint}`);
        } else {
          throw new Error("No firm identifier provided");
        }
        
        console.log(`Fetching firm profile from: ${profileEndpoint}`);
        const profileResponse = await fetch(profileEndpoint);
        console.log(`Profile response status: ${profileResponse.status}`);
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            // Special handling for Morgan Stanley (direct check due to known slug issues)
            if (firmSlug && (firmSlug.toLowerCase() === 'morganstanley' || firmSlug.toLowerCase() === 'morgan-stanley')) {
              console.log("Special handling for Morgan Stanley");
              // Try a direct approach with a known ID
              const msResponse = await fetch(`/api/firm-profiles/id/4`);
              if (msResponse.ok) {
                const msData = await msResponse.json();
                setFirmProfile(msData);
                
                // Fetch calculator parameters for this firm
                try {
                  const paramsResponse = await fetch(`/api/calculator/parameters/${encodeURIComponent(msData.firm)}`);
                  if (paramsResponse.ok) {
                    const paramsData = await paramsResponse.json();
                    setCalculatorParams(paramsData);
                  }
                } catch (err) {
                  console.error("Error fetching calculator parameters after special handling:", err);
                }
                
                setLoading(false);
                return;
              }
            }
            
            throw new Error("Firm profile not found");
          } else if (profileResponse.status === 403) {
            throw new Error("Premium access required");
          }
          throw new Error("Failed to load firm profile");
        }
        
        const profileData = await profileResponse.json();
        console.log("Successfully fetched firm profile:", profileData);
        setFirmProfile(profileData);
        
        // For calculator parameters, we need the firm name
        const firmNameToUse = profileData.firm;
        
        if (firmNameToUse) {
          // Fetch calculator parameters
          try {
            console.log(`Fetching calculator parameters for: ${firmNameToUse}`);
            const paramsResponse = await fetch(`/api/calculator/parameters/${encodeURIComponent(firmNameToUse)}`);
            if (paramsResponse.ok) {
              const paramsData = await paramsResponse.json();
              console.log(`Found ${paramsData.length} calculator parameters`);
              setCalculatorParams(paramsData);
            } else if (paramsResponse.status === 403) {
              // Premium access required for calculator params (but we can still show the profile)
              console.log("Premium access required for calculator parameters");
            } else {
              console.log(`Calculator parameters request failed with status: ${paramsResponse.status}`);
            }
          } catch (err) {
            console.error("Error fetching calculator parameters:", err);
            // Don't fail the whole page if just the parameters fail
          }
        }
      } catch (err: any) {
        console.error("Error fetching firm data:", err);
        setError(err.message || "Failed to load firm landing page");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFirmData();
  }, [firmName, firmSlug]);

  // Handle form submission
  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If honeypot field is filled, silently reject (bot submission)
      if (values.honeypot) {
        console.log("Bot submission detected");
        setSubmitted(true);
        return;
      }
      
      // Add firm information to the submission
      const submissionData = {
        ...values,
        targetFirm: firmProfile?.firm || firmName,
        formType: "firm-landing-page"
      };
      
      // Submit form data
      const response = await apiRequest("POST", "/api/contact/advisor-transition", submissionData);
      
      if (!response.ok) {
        throw new Error("Failed to submit your information. Please try again.");
      }
      
      setSubmitted(true);
      form.reset();
      
      toast({
        title: "Information Submitted",
        description: "Thank you for your interest. A transition specialist will contact you shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading firm information...</p>
      </div>
    );
  }
  
  if (error === 'Premium access required' || (typeof error === 'string' && error.includes('Premium'))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-950">
        <Lock className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Premium Content</h1>
        <p className="text-center mb-6 max-w-md dark:text-gray-300">
          This detailed firm profile is available exclusively to premium members. 
          Upgrade today to access comprehensive firm data, transition packages, and calculation tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <a href="/pricing">Upgrade to Premium</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }
  
  if (error || !firmProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-950">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Firm Not Found</h1>
        <p className="text-center mb-6 dark:text-gray-300">{error || "The requested firm profile does not exist."}</p>
        <Button asChild>
          <a href="/firm-profiles">View All Firm Profiles</a>
        </Button>
      </div>
    );
  }
  
  // Extract firm data
  const { firm, bio, logoUrl, headquarters } = firmProfile;
  const brandColor = generateBrandColor(firm);
  const bioText = typeof bio === 'string' ? bio : bio?.value || "Information not available";
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{firm} | Advisor Transition Guide | FaAxis</title>
        <meta name="description" content={`Considering a transition from ${firm}? Get expert advice, compensation details, and explore your options with FaAxis.`} />
      </Helmet>
      
      <Navbar />
      
      {/* Compact Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={`${firm} logo`} 
                  className="h-10 mr-4 object-contain" 
                />
              )}
              <div>
                <h1 className="text-2xl font-bold dark:text-white">{firm}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Financial Advisor Recruiting Profile</p>
              </div>
            </div>
            <Button asChild size="sm" className="hidden md:flex">
              <a href="#consultation">
                Contact About Transition
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Bar with Quick Stats */}
      <section className="bg-gray-100 dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Headquarters</span>
              <span className="font-medium dark:text-gray-200">{headquarters || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payout Range</span>
              <span className="font-medium dark:text-gray-200">{(calculatorParams.find(p => p.paramName === "grid")?.paramValue || "N/A")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Upfront Deal</span>
              <span className="font-medium dark:text-gray-200">{calculatorParams.find(p => p.paramName === "upfrontMax")?.paramValue ? (
                <CountUp 
                  end={parseInt(calculatorParams.find(p => p.paramName === "upfrontMax")?.paramValue || "0")} 
                  duration={1.7}
                  suffix="%"
                  preserveValue
                />
              ) : "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Deal Length</span>
              <span className="font-medium dark:text-gray-200">{calculatorParams.find(p => p.paramName === "dealLength")?.paramValue ? (
                <CountUp 
                  end={parseInt(calculatorParams.find(p => p.paramName === "dealLength")?.paramValue || "0")} 
                  duration={1.2}
                  suffix=" years"
                  preserveValue
                />
              ) : "N/A"}</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Deal Highlights */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">{firm} Deal Highlights</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Transition Deal</h3>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-xl font-bold">
                  {calculatorParams.find(p => p.paramName === "upfrontMax")?.paramValue ? (
                    <>
                      <CountUp 
                        end={parseInt(calculatorParams.find(p => p.paramName === "upfrontMax")?.paramValue || "0")} 
                        duration={2}
                        suffix="%"
                        preserveValue
                      />
                    </>
                  ) : "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">of trailing 12 (max upfront)</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Backend</h3>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xl font-bold">
                  {calculatorParams.find(p => p.paramName === "backendMax")?.paramValue ? (
                    <>
                      <CountUp 
                        end={parseInt(calculatorParams.find(p => p.paramName === "backendMax")?.paramValue || "0")} 
                        duration={2.5}
                        suffix="%"
                        preserveValue
                      />
                    </>
                  ) : "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">additional potential</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Payout</h3>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold">
                  {calculatorParams.find(p => p.paramName === "grid")?.paramValue || "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">standard grid range</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Deal Length</h3>
              <div className="flex items-center space-x-2">
                <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xl font-bold">
                  {calculatorParams.find(p => p.paramName === "dealLength")?.paramValue ? (
                    <>
                      <CountUp 
                        end={parseInt(calculatorParams.find(p => p.paramName === "dealLength")?.paramValue || "0")} 
                        duration={1.5}
                        preserveValue
                      />
                    </>
                  ) : "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">years commitment</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Advanced Deal Info */}
      <section className="py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">About {firm}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Founded: {firmProfile.founded || "N/A"} • Headquarters: {headquarters || "N/A"}</p>
              </div>
              
              <div className="flex items-center mt-4 md:mt-0">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white" 
                  asChild
                >
                  <a href="/calculator" className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Run Transition Calculator
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Firm Overview</TabsTrigger>
              <TabsTrigger value="transition">Transition Info</TabsTrigger>
              <TabsTrigger value="compare">Compare Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>About {firm}</CardTitle>
                  <CardDescription>Key information about the firm structure and culture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <p>{bioText}</p>
                    
                    <h3>What Advisors Should Know</h3>
                    <p>Financial advisors at {firm} should carefully evaluate both the benefits and limitations of their current affiliation. While {firm} offers established infrastructure and brand recognition, advisors often find that independent models provide greater flexibility, higher payouts, and more control over their practice.</p>
                    
                    <h4>Common Questions from {firm} Advisors:</h4>
                    <ul>
                      <li>How do independent payouts compare to {firm}'s compensation?</li>
                      <li>What transition support is available if I decide to leave?</li>
                      <li>Can I maintain the same level of client service in an independent model?</li>
                      <li>What technology options are available outside of {firm}?</li>
                      <li>How would my practice valuation change as an independent advisor?</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transition">
              <Card>
                <CardHeader>
                  <CardTitle>Transition Considerations</CardTitle>
                  <CardDescription>What you need to know before making a move</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <h3>Transition Timeline</h3>
                    <p>Most advisors transitioning from {firm} complete their client transfer within 90-120 days. The most critical period is the first 30 days when the majority of client conversations take place. Our specialized transition consultants can help create a strategic plan to maximize client retention.</p>
                    
                    <h3>Key Preparation Steps</h3>
                    <ol>
                      <li><strong>Protocol Review</strong>: Understand your obligations under the Protocol for Broker Recruiting, if applicable</li>
                      <li><strong>Contract Analysis</strong>: Review your employment agreement for non-compete and non-solicitation clauses</li>
                      <li><strong>Client Relationships</strong>: Assess which clients are likely to follow you and which may require special attention</li>
                      <li><strong>Financial Preparation</strong>: Plan for potential revenue gap during the transition period</li>
                      <li><strong>Service Model</strong>: Determine how your client service model will translate to a new platform</li>
                    </ol>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
                      <div className="flex items-start">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-yellow-800 dark:text-yellow-400">Important Notice</p>
                          <p className="text-yellow-700 dark:text-yellow-300">Always consult with a qualified attorney before making any transition decisions. The information provided here is general guidance only and not legal advice.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <a href="#consultation">
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Schedule a Confidential Consultation
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="compare">
              <Card>
                <CardHeader>
                  <CardTitle>Compare Your Options</CardTitle>
                  <CardDescription>See how independence compares to {firm}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="mb-6">Understanding the key differences between staying at {firm} versus exploring independent options:</p>
                    <FirmComparison 
                      targetFirm={firm} 
                      items={comparisonItems} 
                    />
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Economic Comparison</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-3 text-primary dark:text-primary-foreground">{firm} Model</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">Payout: {(calculatorParams.find(p => p.paramName === "grid")?.paramValue || "35-45")}%</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Standard grid-based compensation</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">Transition Package: Available</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Typically 100-150% of trailing 12 months production</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-500 shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">No Equity</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Cannot build equity in your practice</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-400">Independent Model</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">Payout: 80-100%</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Keep substantially more of your revenue</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">Transition Support: Available</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Various options including forgivable loans</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                            <div>
                              <span className="font-medium dark:text-gray-200">Build Equity</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Create transferable business value</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <a href="/calculator">
                      <Calculator className="mr-2 h-4 w-4" />
                      Compare Economics with Our Calculator
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">Advisor Success Stories</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Hear from advisors who successfully transitioned from similar firms to independent models.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial 
              quote="After 15 years at a wirehouse, I was skeptical about independence. Now I only wish I'd made the move sooner. My payout increased by 35% and I have complete control over my practice."
              author="Michael T."
              position="Former Wirehouse Advisor"
            />
            <Testimonial 
              quote="The transition was smoother than I expected. FaAxis provided step-by-step guidance, and we retained 97% of our client assets. The economics have been transformative for our practice."
              author="Jennifer L."
              position="Former Regional Firm Advisor"
            />
            <Testimonial 
              quote="What surprised me most was how much better our technology stack is now. We've increased efficiency, reduced costs, and can provide a more personalized experience to our clients."
              author="Robert K."
              position="Independent RIA, $350M AUM"
            />
          </div>
        </div>
      </section>
      
      {/* Professional Contact Form Section */}
      <section id="consultation" className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Speak With a {firm} Transition Specialist</h2>
            <p className="text-gray-600 mt-2">Get a confidential assessment of your options and potential transition package</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-gray-800 text-white p-8">
                <h3 className="text-xl font-bold mb-4">Why Consult With Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-400 shrink-0" />
                    <span>Get accurate deal information specific to {firm}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-400 shrink-0" />
                    <span>100% confidential guidance from industry experts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-400 shrink-0" />
                    <span>Compare multiple options side-by-side</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-400 shrink-0" />
                    <span>Assistance with transition logistics</span>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="font-medium mb-2">Advisor Success Story</h4>
                  <blockquote className="italic text-gray-300 text-sm">
                    "After 12 years at {firm}, I was concerned about client retention during a transition. The FaAxis team provided a clear roadmap that resulted in a 97% client retention rate and a 35% increase in take-home pay."
                  </blockquote>
                  <p className="text-sm mt-2">- Michael S., Former {firm} Advisor</p>
                </div>
                
                <div className="mt-6 flex items-center text-sm">
                  <Lock className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>All inquiries are strictly confidential</span>
                </div>
              </div>
              
              <div className="md:col-span-3 p-8">
                {submitted ? (
                  <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-green-800">Thank You!</h3>
                    <p className="text-green-700 mb-4">
                      Your information has been submitted successfully. A transition specialist will contact you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      Submit Another Request
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your firm" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={firm}>{firm}</SelectItem>
                                  <SelectItem value="Merrill Lynch">Merrill Lynch</SelectItem>
                                  <SelectItem value="Morgan Stanley">Morgan Stanley</SelectItem>
                                  <SelectItem value="UBS">UBS</SelectItem>
                                  <SelectItem value="Wells Fargo">Wells Fargo</SelectItem>
                                  <SelectItem value="LPL">LPL</SelectItem>
                                  <SelectItem value="Raymond James">Raymond James</SelectItem>
                                  <SelectItem value="Ameriprise">Ameriprise</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="aum"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AUM Range</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select AUM range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Under $50M">Under $50M</SelectItem>
                                <SelectItem value="$50M - $100M">$50M - $100M</SelectItem>
                                <SelectItem value="$100M - $250M">$100M - $250M</SelectItem>
                                <SelectItem value="$250M - $500M">$250M - $500M</SelectItem>
                                <SelectItem value="$500M - $1B">$500M - $1B</SelectItem>
                                <SelectItem value="Over $1B">Over $1B</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Questions/Comments</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your situation and any specific questions"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Honeypot field - hidden from users but bots will fill it out */}
                      <div className="hidden">
                        <FormField
                          control={form.control}
                          name="honeypot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leave This Empty</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Request Confidential Consultation"
                          )}
                        </Button>
                        
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          We respect your privacy. Your information will never be shared with {firm}.
                        </p>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Your Options Beyond {firm}?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Take the first step toward greater independence, higher payouts, and building equity in your own practice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <a href="#consultation">
                <PhoneCall className="mr-2 h-5 w-5" />
                Schedule a Consultation
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
              <a href="/calculator">
                <Calculator className="mr-2 h-5 w-5" />
                Try Our Transition Calculator
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">FaAxis</h3>
              <p className="text-gray-400 mb-4">
                The trusted resource for financial advisors considering a practice transition. We provide unbiased guidance and comprehensive support through every step of your journey.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/calculator" className="text-gray-400 hover:text-white">Transition Calculator</a></li>
                <li><a href="/firm-profiles" className="text-gray-400 hover:text-white">Firm Profiles</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white">Advisor Insights</a></li>
                <li><a href="/marketplace" className="text-gray-400 hover:text-white">Practice Marketplace</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left md:flex md:justify-between">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} FaAxis. All rights reserved.
            </p>
            <p className="text-gray-500 mt-2 md:mt-0">
              Specialized advice for financial advisor transitions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}