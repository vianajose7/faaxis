import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { 
  ExternalLink, 
  ArrowRight, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPage {
  id: number;
  title: string;
  slug: string;
  targetFirm: string;
  description: string;
  content?: string;
  logoUrl?: string | null;
  heroColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialProps {
  quote: string;
  author: string;
  position?: string;
}

const Testimonial = ({ quote, author, position }: TestimonialProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-lg italic mb-4">&ldquo;{quote}&rdquo;</div>
    <div className="font-semibold">{author}</div>
    {position && <div className="text-gray-500 text-sm">{position}</div>}
  </div>
);

interface FirmComparisonProps {
  firm1: string;
  firm2: string;
  items: Array<{
    feature: string;
    firm1Has: boolean;
    firm2Has: boolean;
    notes?: string;
  }>;
}

const FirmComparison = ({ firm1, firm2, items }: FirmComparisonProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Feature
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {firm1}
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {firm2}
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Notes
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item, idx) => (
          <tr key={idx}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.feature}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.firm1Has ? <Check className="text-green-500" /> : <X className="text-red-500" />}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.firm2Has ? <Check className="text-green-500" /> : <X className="text-red-500" />}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {item.notes || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function DynamicLandingPage() {
  const [match, params] = useRoute("/landing/:slug");
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slug = params?.slug || "";
  
  useEffect(() => {
    async function fetchLandingPage() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/landing-pages/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("The requested landing page does not exist.");
          } else {
            setError("There was an error loading this landing page.");
          }
          setLandingPage(null);
          return;
        }
        
        const data = await response.json();
        setLandingPage(data);
      } catch (error) {
        console.error("Error fetching landing page:", error);
        setError("Failed to load landing page. Please try again later.");
        setLandingPage(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchLandingPage();
    }
  }, [slug]);
  
  // Implement a comparison table specifically for LPL vs other firms
  // (this can be expanded to be more dynamic in the future)
  const comparisonItems = [
    {
      feature: "Independent Decision Making",
      firm1Has: true,
      firm2Has: false,
      notes: "Full independence on business decisions"
    },
    {
      feature: "Freedom to Choose Technology",
      firm1Has: true, 
      firm2Has: false,
      notes: "Select your preferred tech stack"
    },
    {
      feature: "Custom Fee Schedules",
      firm1Has: true,
      firm2Has: true,
      notes: "Both allow fee customization with limitations"
    },
    {
      feature: "Open Architecture",
      firm1Has: true,
      firm2Has: false,
      notes: "Access to wider product offerings"
    },
    {
      feature: "Retention of Equity Value",
      firm1Has: true,
      firm2Has: false,
      notes: "Higher business valuation potential"
    }
  ];
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading landing page...</p>
      </div>
    );
  }
  
  if (error || !landingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-center mb-6">{error || "The requested landing page does not exist."}</p>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    );
  }
  
  const { title, targetFirm, description, heroColor, logoUrl } = landingPage;
  
  return (
    <>
      <Helmet>
        <title>{title} | FaAxis</title>
        <meta name="description" content={description} />
      </Helmet>
      
      {/* Hero Section with Dynamic Color */}
      <div className="w-full" style={{ backgroundColor: heroColor || "#1d4ed8" }}>
        <div className="container mx-auto px-4 py-16 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            <p className="text-lg md:text-xl mb-8">{description}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-white text-blue-800 hover:bg-gray-100">
                <a href="#learn-more">Learn More</a>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/20">
                <a href="/contact">Schedule a Consultation</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Firm Logos Section */}
      {logoUrl && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold mb-2">Exploring options beyond {targetFirm}?</h2>
                <p className="text-gray-600">We specialize in helping advisors make informed transitions.</p>
              </div>
              <img src={logoUrl} alt={`${targetFirm} logo`} className="h-16 object-contain" />
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Section */}
      <div id="learn-more" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">What {targetFirm} Advisors Need to Know</h2>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p>Financial advisors at {targetFirm} face crucial decisions about their practice's future. With industry consolidation accelerating, understanding all available options is essential to protect your clients and preserve your practice value.</p>
            
            <p>At FaAxis, we offer specialized transition consulting services for financial advisors considering a move. Our approach focuses on your unique needs, helping you navigate complex decisions with confidence.</p>
            
            <h3>Why Advisors Consider Transitioning</h3>
            <ul>
              <li><strong>Greater independence</strong> and business control</li>
              <li><strong>Enhanced economics</strong> with improved payout structures</li>
              <li><strong>Technology flexibility</strong> to choose systems that work best for your practice</li>
              <li><strong>Long-term equity</strong> building opportunities</li>
              <li><strong>Client-first approach</strong> without corporate mandates</li>
            </ul>
            
            <blockquote>
              The right affiliation decision can significantly impact your revenue, client relationships, and overall practice value for years to come.
            </blockquote>
          </div>
          
          {/* Firm Comparison Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Compare Your Options</h2>
            <p className="mb-6">See how independent options compare to {targetFirm} across key areas that matter to advisors:</p>
            <FirmComparison 
              firm1="Independent Options" 
              firm2={targetFirm} 
              items={comparisonItems} 
            />
          </section>
          
          {/* Testimonials Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Advisor Success Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Testimonial 
                quote="Working with FaAxis gave me clarity on my options. Their transition support made what seemed impossible actually straightforward."
                author="Michael T."
                position="Former Advisor at Major Wirehouse"
              />
              <Testimonial 
                quote="I wish I'd made this move years ago. The increased payout structure and ability to run my practice my way has been transformative."
                author="Jennifer L."
                position="Independent Advisor, formerly with Large Broker-Dealer"
              />
            </div>
          </section>
          
          {/* CTA Section */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Explore Your Options?</h2>
            <p className="mb-6">Schedule a confidential consultation with our transition specialists. No obligation, just expert guidance tailored to your situation.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="flex items-center gap-2">
                <a href="/contact">
                  Schedule Consultation
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/calculator">Try Our Transition Value Calculator</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} FaAxis. All rights reserved.</p>
              <p className="text-sm text-gray-400">Specialized advice for financial advisor transitions.</p>
            </div>
            <div className="flex gap-4">
              <a href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</a>
              <a href="/terms" className="text-gray-300 hover:text-white">Terms of Service</a>
              <a href="/contact" className="text-gray-300 hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}