import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowRight, Check, PhoneCall, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  firm: z.string().min(1, "Please select your current firm"),
  aum: z.string().optional(),
  message: z.string().optional(),
  honeypot: z.string().optional() // Used to catch bots
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function CommonwealthLPLLanding() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      firm: "",
      aum: "",
      message: "",
      honeypot: ""
    }
  });

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
      
      // Submit form data
      const response = await apiRequest("POST", "/api/contact/advisor-transition", values);
      
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

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-900 py-20 text-white" id="advisory">
        <div className="max-w-6xl mx-auto px-6">
          {/* Logos Section */}
          <div className="flex justify-center items-center mb-10 gap-12">
            <div className="bg-white p-4 rounded-lg shadow">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c6/Commonwealth_Financial_Network_logo.svg" 
                alt="Commonwealth Financial Network" 
                className="h-14" 
              />
            </div>
            <div className="text-4xl font-bold text-white">+</div>
            <div className="bg-white p-4 rounded-lg shadow">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/LPL_Financial_logo.svg" 
                alt="LPL Financial" 
                className="h-14" 
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                ADVISORY ALERT: READ BEFORE DECIDING
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                What Commonwealth Advisors NEED to Know
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                With LPL's acquisition, Commonwealth Advisors now should carefully consider all options before making hasty decisions about their future.
              </p>
              <div>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Independent Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-bold mb-4">Critical Considerations</div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-1 text-blue-300" />
                  <span>Long-term commitment is required for full bonus payout</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-1 text-blue-300" />
                  <span>Cultural shift from boutique to large corporate environment</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-1 text-blue-300" />
                  <span>Tech integration challenges likely during transition</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-1 text-blue-300" />
                  <span>Potential changes to service model and support</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-1 text-blue-300" />
                  <span>Opportunity to explore all alternatives now</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Firm Comparison Section */}
      <section className="py-20 bg-slate-50" id="firms">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Why Advisors Should Consider All Options</h2>
          <p className="text-slate-600 text-center max-w-3xl mx-auto mb-12">
            LPL's acquisition of Commonwealth will create significant changes for the advisors of both firms. Before rushing to a decision, 
            Commonwealth advisors should carefully evaluate how this acquisition affects their specific practice and business goals.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-600 text-white p-4">
                <h3 className="text-xl font-bold">Potential Concerns with LPL</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Corporate Culture Shift</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Commonwealth's boutique culture will likely be diluted within LPL's large corporate structure, potentially affecting service quality and advisor satisfaction.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Restricted Independence</span>
                      <p className="text-slate-600 text-sm mt-1">
                        LPL's standardized approach may reduce the flexibility and customization that many advisors currently enjoy with their existing firms.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Technology Integration Issues</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Past acquisitions by LPL have shown challenges in technology transitions, potentially disrupting advisor workflows and client service.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Long-Term Commitment Requirements</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Transition bonuses often come with 7-10 year commitments, limiting future flexibility and requiring thorough contract review.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-600 text-white p-4">
                <h3 className="text-xl font-bold">Independent Alternatives Worth Exploring</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">True RIA Independence</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Establishing your own RIA can provide 100% ownership, higher payouts, and complete business autonomy with no long-term contractual lock-ins.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Boutique Firm Models</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Several boutique firms offer high-touch service models, advanced technology integration, and personalized transition deals with more competitive economics.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Hybrid Platforms</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Modern hybrid platforms provide the benefits of independence with the support infrastructure of larger organizations, offering flexible affiliation options.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Strategic Partnership Models</span>
                      <p className="text-slate-600 text-sm mt-1">
                        Equity partnerships and succession planning models can provide immediate capital while maintaining control over your practice's direction.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-8">Firm-Specific Considerations</h3>
          
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Goldman Sachs Advisors</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-bold">Tier 1</div>
                </div>
                <div className="mb-6 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Current AUM:</strong> $2.8T<br />
                      <strong>Typical Payout:</strong> 40-45%<br />
                      <strong>Known for:</strong> Institutional expertise
                    </div>
                    <div>
                      <strong>Advisors:</strong> 2,500+<br />
                      <strong>Avg Client Size:</strong> $10M+<br />
                      <strong>Culture:</strong> Corporate elite
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h4 className="font-bold mb-2 text-blue-700">Current Challenges</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Limited payout potential (40-45% ceiling)</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Rigid corporate structure limits autonomy</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Heavy compliance and bureaucracy</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>No equity or true business ownership</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-blue-700">Alternative Benefits</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>True independence with premiere infrastructure</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Maintain institutional-quality research</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Higher payout structure (80-95%)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                        <span>Business equity ownership opportunities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-600 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Kestra Advisors</h3>
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-bold">Boutique</div>
                </div>
                <div className="mb-6 p-4 bg-purple-50 rounded-md text-sm text-purple-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Current AUM:</strong> $45B<br />
                      <strong>Typical Payout:</strong> 85-90%<br />
                      <strong>Known for:</strong> Practice development
                    </div>
                    <div>
                      <strong>Advisors:</strong> 1,800+<br />
                      <strong>Avg Client Size:</strong> $1.2M<br />
                      <strong>Culture:</strong> Entrepreneurial
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h4 className="font-bold mb-2 text-purple-700">Current Challenges</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Limited technology integrations</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Ongoing ownership changes causing uncertainty</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Inconsistent support for larger practices</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Limited succession planning resources</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-purple-700">Alternative Benefits</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Larger scale and resources with independence</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Enhanced technology suite with API flexibility</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Competitive transition packages without lockups</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-purple-600" />
                        <span>Flexible affiliation options for hybrid models</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-600 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Cetera Advisors</h3>
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-bold">Network</div>
                </div>
                <div className="mb-6 p-4 bg-red-50 rounded-md text-sm text-red-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Current AUM:</strong> $341B<br />
                      <strong>Typical Payout:</strong> 80-90%<br />
                      <strong>Known for:</strong> Community focus
                    </div>
                    <div>
                      <strong>Advisors:</strong> 8,000+<br />
                      <strong>Avg Client Size:</strong> $750K<br />
                      <strong>Culture:</strong> Community-oriented
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h4 className="font-bold mb-2 text-red-700">Current Challenges</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Multi-layered organizational structure</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Inconsistent advisor experience across entities</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Private equity ownership driving cost control</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Technology platform requires modernization</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-red-700">Alternative Benefits</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Simplified operational structure</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>More favorable economics and fee structures</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Premium support services for complex needs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-red-600" />
                        <span>Reduced regulatory complexity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-600 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">tru Advisors</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold">Innovative</div>
                </div>
                <div className="mb-6 p-4 bg-green-50 rounded-md text-sm text-green-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Current AUM:</strong> $8.3B<br />
                      <strong>Typical Payout:</strong> 85-94%<br />
                      <strong>Known for:</strong> Tech innovation
                    </div>
                    <div>
                      <strong>Advisors:</strong> 250+<br />
                      <strong>Avg Client Size:</strong> $1.5M<br />
                      <strong>Culture:</strong> Tech-forward
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h4 className="font-bold mb-2 text-green-700">Current Challenges</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Limited brand recognition with clients</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Smaller support team compared to large firms</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Developing institutional capabilities</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Newer entity with evolving processes</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-green-700">Alternative Benefits</h4>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Superior technology integration options</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Expanded investment platform access</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Dedicated transition deal team</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                        <span>Enhanced succession planning tools</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-6">What Commonwealth Advisors Are Saying</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-4">
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "FA Axis helped me navigate what was initially an overwhelming process. Their detailed comparison of alternatives to LPL made all the difference in my decision-making. I couldn't have made this move confidently without their guidance."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    JW
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">James Wilson</div>
                    <div className="text-sm text-slate-500">Managing Partner, $400M AUM</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-4">
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "When news of the acquisition broke, I was immediately concerned about what it meant for our practice. FA Axis provided objective analysis and showcased options I hadn't considered. Their contract review alone saved me from a potential 9-year commitment."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    MC
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">Michelle Carter</div>
                    <div className="text-sm text-slate-500">Commonwealth Advisor since 2011</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-4">
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "The team at FA Axis helped us evaluate our RIA launch versus taking the LPL offer. Their detailed financial projections and technology stack comparisons gave us the confidence to make our move. The transition has been smoother than we expected."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    DR
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">David Rodriguez, CFP®</div>
                    <div className="text-sm text-slate-500">Former Commonwealth Team, $280M AUM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Our USP Section */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 mb-12">
            <h3 className="text-2xl font-bold text-center mb-6">Why Work With FA Axis During Your Transition</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Legal Expertise</h4>
                <p className="text-slate-600 text-center">
                  Industry-specific legal reviews of transition agreements, protecting your interests with expertise in advisor contracts and negotiations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Firm Creation Support</h4>
                <p className="text-slate-600 text-center">
                  Complete RIA formation assistance, from business structure optimization to compliance framework development and technology implementation.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Private Equity Access</h4>
                <p className="text-slate-600 text-center">
                  Exclusive connections to PE investors interested in advisor practices, providing capital for acquisitions and succession without sacrificing control.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Deal Negotiation</h4>
                <p className="text-slate-600 text-center">
                  Expert negotiators who understand the nuances of transition packages, ensuring you receive optimal terms and identify hidden clauses.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Comparative Analysis</h4>
                <p className="text-slate-600 text-center">
                  Comprehensive landscape documentation comparing platforms, technology, economics, and transition deals across multiple firms and models.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-center mb-3">Free & Confidential</h4>
                <p className="text-slate-600 text-center">
                  Our services are provided at no cost to advisors, with strict confidentiality protocols to protect your practice and client relationships.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Request Comprehensive Comparison Report
            </Button>
          </div>
        </div>
      </section>

      {/* Options to Consider */}
      <section className="py-20 bg-white" id="options">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">Your Options Now That Commonwealth Is Being Acquired</h2>
          <p className="text-slate-600 text-center max-w-3xl mx-auto mb-12">
            Before making a hasty transition to LPL, financial advisors should thoroughly explore all available options, 
            including both alternatives to LPL and understanding the fine print of LPL's acquisition terms.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 hover:shadow-xl transition">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-6 mx-auto">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Read the LPL Fine Print</h3>
              <p className="text-slate-600 mb-6 text-center">
                Understand the specific terms of the acquisition before committing. Many transition deals include:
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-1 text-amber-600" />
                  <span>7-10 year clawback provisions on bonuses</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-1 text-amber-600" />
                  <span>Strict non-solicitation agreements</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-1 text-amber-600" />
                  <span>Lock-up periods limiting future moves</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-1 text-amber-600" />
                  <span>Graduated payout structures that can decrease</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 hover:shadow-xl transition">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Explore Other Broker-Dealers</h3>
              <p className="text-slate-600 mb-6 text-center">
                This acquisition creates a competitive environment where other broker-dealers are offering enhanced transition packages:
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                  <span>Boutique broker-dealers with high-touch service</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                  <span>Mid-sized firms with competitive economics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                  <span>Specialized firms targeting your niche</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                  <span>Regional players with local market expertise</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 hover:shadow-xl transition">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Consider True Independence</h3>
              <p className="text-slate-600 mb-6 text-center">
                Going fully independent provides maximum flexibility and long-term value building:
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                  <span>Establish your own RIA with complete autonomy</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                  <span>Capture 100% of your revenue (90-100% payout)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                  <span>Build equity in your own business</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-1 text-green-600" />
                  <span>Select best-in-class technology partners</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-slate-100 p-8 rounded-lg border border-slate-200">
            <h3 className="text-2xl font-bold mb-6 text-center">What You Need to Know About the LPL-Commonwealth Deal</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-red-700">Potential Drawbacks</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Service Dilution:</strong> Commonwealth's renowned service model may be difficult to maintain under LPL's larger corporate structure
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Technology Disruption:</strong> Integration of systems has historically been challenging in such acquisitions
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Fee Pressure:</strong> Post-acquisition fee increases or changes to payout structures are common
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Cultural Shift:</strong> Commonwealth's boutique culture may struggle to survive within LPL
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4 text-green-700">If You Decide to Move Forward</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Negotiate Terms:</strong> All transition deals are negotiable - don't accept the first offer
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Get Legal Review:</strong> Have an industry-specific attorney review all contracts
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Get Specifics in Writing:</strong> Ensure all promises are documented in your agreement
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <strong>Plan for Contingencies:</strong> Always have a backup plan for unexpected changes
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button className="bg-primary hover:bg-primary/90">
                Request Confidential Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-slate-900 text-white" id="contact">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Ready to Explore Your Options?</h2>
          <p className="text-xl text-center text-slate-300 mb-12 max-w-3xl mx-auto">
            Complete the form below for a confidential consultation with a transition specialist. Your information will never be shared.
          </p>
          
          {submitted ? (
            <div className="max-w-md mx-auto bg-green-900/30 rounded-lg p-8 border border-green-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-600 p-3 rounded-full mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Thank You</h3>
                <p className="mb-6">
                  Your information has been submitted successfully. A transition specialist will contact you within 24 hours.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSubmitted(false)}
                  className="border-white text-white hover:bg-white hover:text-slate-900"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white/10 rounded-lg p-8 backdrop-blur-sm border border-white/20">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Hidden honeypot field to catch bots */}
                  <div className="hidden">
                    <Input
                      id="honeypot"
                      type="text" 
                      autoComplete="off"
                      {...form.register("honeypot")}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Your email" 
                              className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                              {...field} 
                            />
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
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="Your phone" 
                              className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Firm</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select firm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="goldman">Goldman Sachs</SelectItem>
                              <SelectItem value="kestra">Kestra</SelectItem>
                              <SelectItem value="cetera">Cetera</SelectItem>
                              <SelectItem value="tru">TRU</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assets Under Management</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select AUM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under50m">Under $50M</SelectItem>
                              <SelectItem value="50-100m">$50M - $100M</SelectItem>
                              <SelectItem value="100-250m">$100M - $250M</SelectItem>
                              <SelectItem value="250-500m">$250M - $500M</SelectItem>
                              <SelectItem value="over500m">Over $500M</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your practice and transition goals"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Request Confidential Consultation"}
                  </Button>
                  
                  <p className="text-xs text-center text-slate-400">
                    By submitting this form, you agree to our <a href="#" className="underline hover:text-white">privacy policy</a> and consent to be contacted regarding your transition options.
                  </p>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-slate-400">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold text-white">Commonwealth + LPL</div>
              <div className="text-sm">Advisor Transition Support</div>
            </div>
            
            <div className="text-sm text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} FA Axis. All rights reserved.</p>
              <p>Confidential Information - Not for Public Distribution</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}