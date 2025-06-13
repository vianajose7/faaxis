import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowRight, Check, Globe, Layout, MoveRight, BarChart2, Search, Shield, Smartphone, MousePointer, Coffee, Layers, Zap, PenTool, Code, Lightbulb, StarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useRef, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Reviews data with city and state
const reviews = [
  {
    name: "Michael",
    location: "Boston, MA",
    text: "The Google Ads campaign managed by FinancialAXIS transformed my practice. I'm now connecting with high-net-worth clients who specifically need my expertise in retirement planning."
  },
  {
    name: "Jennifer",
    location: "Chicago, IL",
    text: "Their social media management has completely removed the content creation burden from my shoulders. Compliance-approved posts are consistently published, and my LinkedIn presence has never been stronger."
  },
  {
    name: "Robert",
    location: "Austin, TX",
    text: "The website design team at FinancialAXIS delivered a beautiful, modern site that perfectly represents my brand. The lead generation forms are bringing in qualified prospects every week."
  },
  {
    name: "Sarah",
    location: "Seattle, WA",
    text: "I've tried other marketing companies before, but none understood the unique compliance requirements of our industry. FinancialAXIS gets it and delivers results without compliance headaches."
  },
  {
    name: "David",
    location: "Phoenix, AZ",
    text: "The cybersecurity assessment and implementation helped bring our practice up to regulatory standards. We now feel confident that our client data is properly protected."
  },
  {
    name: "Jessica",
    location: "Miami, FL",
    text: "The content marketing service has positioned me as a thought leader in my niche. The professionally written articles and guides have been instrumental in growing my client base."
  },
  {
    name: "Thomas",
    location: "Denver, CO",
    text: "Working with FinancialAXIS has been a game-changer for our practice. Their strategic approach to marketing has helped us connect with exactly the type of clients we want to serve."
  },
  {
    name: "Amanda",
    location: "Portland, OR",
    text: "The ROI on our Google Ads campaign has been exceptional. For every dollar we spend, we're seeing approximately $4 in new client revenue. Couldn't be happier with the results."
  }
];

export default function MarketingPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', containScroll: 'trimSnaps' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [serviceTab, setServiceTab] = useState("google-ads");
  const [pricingTab, setPricingTab] = useState("essential");
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-20"></div>
          <div className="relative container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary/70 bg-clip-text text-transparent animate-soft-bounce inline-block">
                  Marketing Solutions
                </span>{" "}
                <span className="animate-soft-bounce inline-block" style={{ animationDelay: "0.1s" }}>
                  for Financial Advisors
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive marketing services designed specifically for financial advisors looking to grow their practice and attract quality clients.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <a href="https://tidycal.com/consultationmeet/15-minute-meeting" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="font-medium px-6 py-4 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 rounded-full">
                    <Zap className="mr-2 h-5 w-5" />
                    Schedule Consultation
                  </Button>
                </a>
                <a href="#services">
                  <Button size="lg" variant="outline" className="font-medium px-6 py-4 text-base border border-primary/30 hover:border-primary/60 text-foreground hover:bg-primary/5 transition-all duration-300 rounded-full">
                    <PenTool className="mr-2 h-5 w-5" />
                    View Service Details
                  </Button>
                </a>
              </div>
              
              {/* Animated Scroll Down Arrow */}
              <div className="relative mx-auto animate-bounce mt-8 mb-0">
                <a href="#services" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-sm mb-1">Scroll Down</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Overview */}
        <section id="services" className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Our Marketing Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tailored solutions to help you attract, engage, and convert high-value clients.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              {/* Mobile Service Selector */}
              <div className="mb-6 md:hidden">
                <Select value={serviceTab} onValueChange={setServiceTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-ads">
                      <div className="flex items-center">
                        <Search className="h-4 w-4 mr-2" />
                        <span>Google Ads</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="web-design">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Web Design</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="social-media">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        <span>Social Media</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="content">
                      <div className="flex items-center">
                        <PenTool className="h-4 w-4 mr-2" />
                        <span>Content</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cybersecurity">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Security</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Desktop Tabs */}
              <Tabs value={serviceTab} onValueChange={setServiceTab} className="hidden md:block">
                <div className="relative overflow-hidden rounded-lg border border-border bg-background mb-6">
                  <TabsList className="w-full flex flex-row justify-center bg-transparent p-0">
                    <TabsTrigger 
                      value="google-ads" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Google Ads
                    </TabsTrigger>
                    <TabsTrigger 
                      value="web-design" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Web Design
                    </TabsTrigger>
                    <TabsTrigger 
                      value="social-media" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Social Media
                    </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger 
                      value="cybersecurity" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
              
              {/* Service Content Based on Selection */}
              <div className={`rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50 ${serviceTab === "google-ads" ? "block" : "hidden"}`}>
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Search className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl font-semibold">Google Ads for Financial Advisors</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Our Google Ads services are specifically designed for financial advisors looking to attract qualified prospects through targeted search campaigns. We create custom campaigns that target high-intent keywords related to financial planning, wealth management, and retirement services.
                    </p>
                    
                    <h4 className="text-xl font-semibold mb-4">Our Google Ads Process</h4>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">In-Depth Research & Analysis</h5>
                          <p className="text-muted-foreground">We research your market, competitors, and target audience to identify the most effective keywords and create compelling ad copy.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Layout className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Custom Landing Page Design</h5>
                          <p className="text-muted-foreground">We create high-converting landing pages specifically designed to turn Ad clicks into qualified leads.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Compliance-First Approach</h5>
                          <p className="text-muted-foreground">All campaigns are designed with financial industry compliance requirements in mind to keep your practice protected.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Keyword Research</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Competitor Analysis</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Ad Copywriting</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Campaign Setup</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Landing Page Design</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Conversion Tracking</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Monthly Performance Reports</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Ongoing Optimization</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="rounded-full px-8"
                      onClick={() => window.location.href="/checkout?plan=google-ads-proposal&price=1499.99"}
                    >
                      Request Google Ads Proposal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-2/5">
                    <div className="bg-muted rounded-lg p-6 shadow-inner">
                      <h4 className="text-xl font-semibold mb-4">Google Ads Benefits</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Attract prospects actively searching for financial services</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Target by location to focus on clients in your service area</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Pay only when interested prospects click your ad</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Detailed tracking of campaign performance and ROI</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Scale campaigns up or down based on your capacity</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                          Compliance Note
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Our team is familiar with FINRA and SEC advertising guidelines. All campaigns are designed to meet regulatory requirements while still being effective.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-background to-muted rounded-lg p-6 border border-border">
                        <h5 className="font-semibold mb-3">Typical Results</h5>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Lead Generation</span>
                              <span>15-25 qualified leads/month</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Appointment Conversion</span>
                              <span>30-40%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Return on Ad Spend</span>
                              <span>300-500%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Web Design Content */}
              <TabsContent value="web-design" className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Globe className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl font-semibold">Website Design for Financial Advisors</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Your website is often the first impression potential clients have of your practice. Our web design services create professional, modern, and client-focused websites specifically designed for financial advisors to build trust and generate leads.
                    </p>
                    
                    <h4 className="text-xl font-semibold mb-4">Our Web Design Process</h4>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Strategy & Discovery</h5>
                          <p className="text-muted-foreground">We define your business goals, target audience, and key differentiators to create a website that attracts your ideal clients.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Layout className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Design & Development</h5>
                          <p className="text-muted-foreground">Our designers create a custom look and feel that aligns with your brand while our developers bring it to life with modern, responsive code.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Content & Launch</h5>
                          <p className="text-muted-foreground">We develop compliance-approved content that speaks to your audience, optimize for search engines, and launch your new site.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-4">Website Features</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Mobile-Responsive Design</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Custom Client Portal</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>SEO Optimization</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Lead Generation Forms</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Team/Bio Pages</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Client Testimonials</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Service Descriptions</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Content Management System</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="rounded-full px-8"
                      onClick={() => window.open("/portfolio", "_blank")}
                    >
                      View Our Website Portfolio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-2/5">
                    <div className="bg-muted rounded-lg p-6 shadow-inner">
                      <h4 className="text-xl font-semibold mb-4">Website Benefits</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Build credibility and trust with potential clients</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Showcase your expertise and services clearly</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Generate leads 24/7 through optimized contact forms</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Improve local search visibility to attract nearby clients</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Differentiate from competitors with premium design</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                          Compliance Note
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          All websites are built with compliance in mind, including proper disclosures, accessibility standards, and broker-dealer approval processes as needed.
                        </p>
                      </div>
                      
                      <div className="rounded-lg overflow-hidden mb-6 border border-border">
                        <div className="bg-background p-2 border-b border-border flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="text-xs bg-muted px-2 py-1 rounded flex-1 text-center text-muted-foreground">advisorwebsite.com</div>
                        </div>
                        <div className="p-4 bg-gradient-to-b from-background to-muted">
                          <div className="h-4 w-2/3 bg-muted-foreground/20 rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-muted-foreground/20 rounded mb-4"></div>
                          
                          <div className="flex gap-2 mb-4">
                            <div className="h-8 w-20 bg-primary/40 rounded"></div>
                            <div className="h-8 w-20 bg-muted-foreground/20 rounded"></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="h-24 rounded bg-muted-foreground/10 p-2">
                              <div className="h-3 w-2/3 bg-muted-foreground/20 rounded mb-1"></div>
                              <div className="h-2 w-full bg-muted-foreground/20 rounded mb-1"></div>
                              <div className="h-2 w-full bg-muted-foreground/20 rounded mb-1"></div>
                            </div>
                            <div className="h-24 rounded bg-muted-foreground/10 p-2">
                              <div className="h-3 w-2/3 bg-muted-foreground/20 rounded mb-1"></div>
                              <div className="h-2 w-full bg-muted-foreground/20 rounded mb-1"></div>
                              <div className="h-2 w-full bg-muted-foreground/20 rounded mb-1"></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <div className="h-6 w-32 bg-primary/40 rounded"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-medium mb-2">Starting at</p>
                        <p className="text-3xl font-bold mb-2">$2,495</p>
                        <p className="text-sm text-muted-foreground">Includes design, development, and content</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Social Media Content */}
              <TabsContent value="social-media" className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Smartphone className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl font-semibold">Social Media Management</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Build credibility and engage with prospects through strategic social media management tailored specifically for financial advisors. Our compliance-focused social media services help you maintain a professional online presence while showcasing your expertise.
                    </p>
                    
                    <h4 className="text-xl font-semibold mb-4">Our Social Media Approach</h4>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Strategic Planning</h5>
                          <p className="text-muted-foreground">We develop a comprehensive social media strategy aligned with your business goals and target audience preferences.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <PenTool className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Content Creation & Curation</h5>
                          <p className="text-muted-foreground">Our team creates and curates engaging, compliant content that positions you as a trusted advisor in your niche.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Compliance Review</h5>
                          <p className="text-muted-foreground">All content is reviewed for industry compliance before posting, ensuring your social presence maintains regulatory standards.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Social Media Audit</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Platform Selection & Setup</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Content Calendar</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Original Graphics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Post Scheduling</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Engagement Monitoring</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Performance Analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Strategy Refinement</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="rounded-full px-8"
                      onClick={() => window.location.href="/checkout?plan=social-media-strategy&price=999.99"}
                    >
                      Get Social Media Strategy
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-2/5">
                    <div className="bg-muted rounded-lg p-6 shadow-inner">
                      <h4 className="text-xl font-semibold mb-4">Social Media Benefits</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Build trust and credibility with your audience</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Showcase your expertise and thought leadership</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Connect with prospects where they already spend time</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Maintain a consistent, professional online presence</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Generate leads through targeted content</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                          Compliance Note
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Our team understands FINRA and SEC social media guidelines. We help implement proper archiving solutions to meet recordkeeping requirements while maintaining an engaging presence.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-background to-muted rounded-lg p-6 border border-border">
                        <h5 className="font-semibold mb-3">Platforms We Manage</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary font-semibold">Li</span>
                            </div>
                            <span>LinkedIn</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary font-semibold">Fb</span>
                            </div>
                            <span>Facebook</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary font-semibold">Tw</span>
                            </div>
                            <span>Twitter</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary font-semibold">Ig</span>
                            </div>
                            <span>Instagram</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Content Creation Tab */}
              <TabsContent value="content" className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Coffee className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl font-semibold">Content Creation for Financial Advisors</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      High-quality, financial industry-specific content that establishes your authority and drives engagement. Our content creation services help financial advisors showcase their expertise through blogs, newsletters, whitepapers, and more.
                    </p>
                    
                    <h4 className="text-xl font-semibold mb-4">Our Content Creation Process</h4>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Topic Research & Strategy</h5>
                          <p className="text-muted-foreground">We identify high-value topics that address your target audience's pain points and questions about financial planning.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <PenTool className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Expert-Driven Creation</h5>
                          <p className="text-muted-foreground">Our financial writers craft authoritative, accessible content that simplifies complex topics while showcasing your expertise.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Compliance & Distribution</h5>
                          <p className="text-muted-foreground">All content undergoes compliance review before publication and is strategically distributed through your channels.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-4">Content Types We Create</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Blog Posts</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Email Newsletters</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Whitepapers</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Ebooks</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Case Studies</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Video Scripts</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Infographics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Social Media Posts</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="rounded-full px-8"
                      onClick={() => window.location.href="/checkout?plan=content-strategy&price=799.99"}
                    >
                      Discuss Content Strategy
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-2/5">
                    <div className="bg-muted rounded-lg p-6 shadow-inner">
                      <h4 className="text-xl font-semibold mb-4">Content Marketing Benefits</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Establish your authority in financial services</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Improve your website's SEO visibility</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Educate prospects on complex financial topics</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Generate qualified leads through valuable resources</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Support client retention through ongoing education</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                          Compliance Note
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Our content team includes experienced financial writers who understand SEC and FINRA regulations. All content includes appropriate disclosures and avoids problematic claims or language.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-background to-muted rounded-lg p-6 border border-border">
                        <h5 className="font-semibold mb-3">Popular Content Packages</h5>
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-medium">Essential Package</h6>
                            <p className="text-sm text-muted-foreground">4 blog posts per month + social media content</p>
                          </div>
                          <div>
                            <h6 className="font-medium">Growth Package</h6>
                            <p className="text-sm text-muted-foreground">8 blog posts, 1 whitepaper per quarter, email newsletter</p>
                          </div>
                          <div>
                            <h6 className="font-medium">Authority Package</h6>
                            <p className="text-sm text-muted-foreground">Complete content strategy with blogs, whitepapers, video scripts, and lead magnets</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Cybersecurity Content */}
              <TabsContent value="cybersecurity" className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Shield className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl font-semibold">Cybersecurity for Financial Advisors</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Financial advisors handle sensitive client information and are increasingly targeted by cybercriminals. Our cybersecurity services help protect your practice, client data, and reputation with comprehensive security solutions tailored for financial professionals.
                    </p>
                    
                    <h4 className="text-xl font-semibold mb-4">Our Cybersecurity Approach</h4>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Security Assessment</h5>
                          <p className="text-muted-foreground">We identify vulnerabilities in your systems, processes, and team practices that could put client data at risk.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Implementation</h5>
                          <p className="text-muted-foreground">We deploy security measures including encryption, secure client portals, multi-factor authentication, and more.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                          <Code className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-lg font-medium text-foreground">Training & Monitoring</h5>
                          <p className="text-muted-foreground">We provide staff security training, ongoing monitoring, and incident response planning to maintain protection.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-4">Security Services</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Security Risk Assessment</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Email Security & Phishing Protection</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Secure Client Portal Setup</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Data Encryption Implementation</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Staff Security Training</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Mobile Device Security</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Compliance Documentation</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>Incident Response Planning</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="rounded-full px-8"
                      onClick={() => window.location.href="/checkout?plan=security-assessment&price=1999.99"}
                    >
                      Schedule Security Assessment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-2/5">
                    <div className="bg-muted rounded-lg p-6 shadow-inner">
                      <h4 className="text-xl font-semibold mb-4">Cybersecurity Benefits</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Protect sensitive client financial data</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Meet regulatory requirements (SEC, FINRA)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Maintain client trust and confidence</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Prevent costly data breaches</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                          <span>Secure remote work environments</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                          Regulatory Note
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          The SEC's Regulation S-P and Regulation S-ID require financial advisors to implement safeguards to protect client information and prevent identity theft. Our solutions help you meet these requirements.
                        </p>
                      </div>
                      
                      <div className="bg-background rounded-lg p-6 border border-border mb-6">
                        <h5 className="font-semibold mb-3">Cybersecurity Statistics</h5>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm mb-1">Financial services firms are <span className="font-bold">300%</span> more likely to be targeted by cybercriminals than other industries</p>
                            <div className="h-2 bg-muted-foreground/20 rounded-full">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm mb-1"><span className="font-bold">60%</span> of small financial firms go out of business within 6 months of a major data breach</p>
                            <div className="h-2 bg-muted-foreground/20 rounded-full">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm mb-1">The average cost of a data breach in financial services is <span className="font-bold">$5.85 million</span></p>
                            <div className="h-2 bg-muted-foreground/20 rounded-full">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-medium mb-2">Security Packages From</p>
                        <p className="text-3xl font-bold mb-2">$1,995</p>
                        <p className="text-sm text-muted-foreground">Annual protection for your practice</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Client Success Stories */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Advisor Success Stories
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how our marketing services have helped financial advisors grow their practices.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Success Story 1 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-card/50 bg-card/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <MousePointer className="h-4 w-4" />
                    </div>
                  </div>
                  <CardTitle>200% Increase in Qualified Leads</CardTitle>
                  <CardDescription>Google Ads Campaign for Retirement Planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "After implementing the Google Ads campaign focused on retirement planning, we saw our qualified leads increase by 200% in just 3 months. The ROI has been exceptional."
                  </p>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-semibold text-primary">JM</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">James Miller</p>
                      <p className="text-sm text-muted-foreground">Miller Wealth Advisors, Atlanta</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/case-studies/google-ads">
                    <Button variant="link" className="px-0 py-0 h-auto font-medium text-primary hover:text-primary/90">
                      Read Full Case Study
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Success Story 2 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-card/50 bg-card/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                  </div>
                  <CardTitle>15 New HNW Clients in 6 Months</CardTitle>
                  <CardDescription>Website Redesign & SEO Optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "Our new website completely transformed how prospects perceive our firm. Within 6 months, we added 15 new high-net-worth clients directly attributed to the website."
                  </p>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-semibold text-primary">ST</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Sarah Thompson</p>
                      <p className="text-sm text-muted-foreground">Clarity Financial Partners, Boston</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/case-studies/content">
                    <Button variant="link" className="px-0 py-0 h-auto font-medium text-primary hover:text-primary/90">
                      Read Full Case Study
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ready to Grow Your Advisory Practice?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Schedule a free consultation to discuss how our marketing services can help you attract more of your ideal clients.
              </p>
              <Button 
                size="lg" 
                className="rounded-full px-8 py-6 font-medium"
                onClick={() => window.location.href="/contact?consultation=true"}
              >
                Schedule Your Free Consultation
                <MoveRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-lg border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Free Consultation</h3>
                  <p className="text-muted-foreground">No obligation discussion about your marketing needs</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <Layout className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Custom Strategy</h3>
                  <p className="text-muted-foreground">Tailored marketing plan based on your goals</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Measurable Results</h3>
                  <p className="text-muted-foreground">Clear reporting on ROI and performance</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reviews Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                What Our Clients Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hear from financial advisors who have transformed their practices with our marketing services.
              </p>
            </div>
            
            <div className="relative max-w-6xl mx-auto px-4">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {reviews.map((review, index) => (
                    <div className="flex-grow-0 flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-4" key={index}>
                      <div className="bg-card rounded-xl shadow-md p-6 h-full flex flex-col border border-border/50">
                        <div className="flex items-center mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                        <blockquote className="flex-1">
                          <p className="text-muted-foreground mb-4">{review.text}</p>
                        </blockquote>
                        <footer className="mt-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                              <span className="font-semibold text-primary">{review.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <p className="text-sm text-muted-foreground">{review.location}</p>
                            </div>
                          </div>
                        </footer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-8 gap-4">
                <button
                  onClick={scrollPrev}
                  disabled={!prevBtnEnabled}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!nextBtnEnabled}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center mt-10">
                <Link href="/reviews">
                  <Button variant="outline" className="rounded-full">
                    View All Reviews
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Marketing Solutions Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the right package for your practice's growth objectives
              </p>
            </div>
            
            <Tabs defaultValue="essential" className="max-w-5xl mx-auto">
              <div className="w-full grid grid-cols-1 gap-2 md:flex justify-center mb-10">
                <div className="md:inline-flex rounded-lg md:shadow-sm bg-background md:border border-border md:overflow-hidden">
                  <TabsList className="bg-transparent p-0 flex flex-col md:flex-row">
                    <TabsTrigger 
                      value="essential" 
                      className="w-full text-base px-6 py-3 md:rounded-none rounded-md flex items-center justify-center m-0 gap-2 font-medium md:border-r border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Essential Package
                    </TabsTrigger>
                    <TabsTrigger 
                      value="premium" 
                      className="w-full text-base px-6 py-3 md:rounded-none rounded-md flex items-center justify-center m-0 gap-2 font-medium md:border-r border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Premium Package
                    </TabsTrigger>
                    <TabsTrigger 
                      value="elite" 
                      className="w-full text-base px-6 py-3 md:rounded-none rounded-md flex items-center justify-center m-0 gap-2 font-medium border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Elite Package
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              {/* Essential Package */}
              <TabsContent value="essential" className="rounded-lg bg-card p-8 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-1/2">
                    <div className="flex items-center gap-2 mb-6">
                      <h3 className="text-2xl font-semibold">Essential Marketing Package</h3>
                    </div>
                    
                    <div className="flex items-baseline mb-8">
                      <span className="text-4xl font-bold">$2,499</span>
                      <span className="text-muted-foreground ml-2">one-time setup + monthly maintenance</span>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      The perfect starting point for advisors looking to establish a professional online presence and begin attracting qualified leads through targeted marketing efforts.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Professional Website Design</h5>
                          <p className="text-sm text-muted-foreground">5-page responsive website with SEO optimization and compliance review</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Basic Google Ads Setup</h5>
                          <p className="text-sm text-muted-foreground">Campaign setup targeting local keywords with monthly budget management</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Social Media Profile Setup</h5>
                          <p className="text-sm text-muted-foreground">Optimization of LinkedIn and one other platform of your choice</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Monthly Performance Report</h5>
                          <p className="text-sm text-muted-foreground">Detailed analytics on website traffic and campaign performance</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full sm:w-auto rounded-full px-8 py-6"
                      onClick={() => window.location.href = "/checkout?plan=marketing-basic"}
                    >
                      Get Started with Essential
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="bg-muted rounded-lg p-6 h-full">
                      <h4 className="text-xl font-semibold mb-4">What's Included</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>5-page responsive website design</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Basic SEO setup</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Google Ads campaign setup</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Social media profile optimization</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Lead capture form setup</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Compliance review of all materials</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Monthly analytics reporting</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Email support</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Ideal For</h5>
                        <p className="text-sm text-muted-foreground">
                          Advisors just starting to build their digital presence or looking to refresh an outdated marketing approach with a solid foundation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Premium Package */}
              <TabsContent value="premium" className="rounded-lg bg-card p-8 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-1/2">
                    <div className="flex items-center gap-2 mb-6">
                      <h3 className="text-2xl font-semibold">Premium Marketing Package</h3>
                    </div>
                    
                    <div className="flex items-baseline mb-8">
                      <span className="text-4xl font-bold">$4,799</span>
                      <span className="text-muted-foreground ml-2">one-time setup + monthly maintenance</span>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      A comprehensive solution for established advisors looking to significantly expand their digital footprint and systematically attract high-value clients.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Advanced Website with Content Strategy</h5>
                          <p className="text-sm text-muted-foreground">10-page customized website with blog setup and content calendar</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Comprehensive Google Ads Management</h5>
                          <p className="text-sm text-muted-foreground">Multiple campaigns with ongoing optimization and A/B testing</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Social Media Content Creation</h5>
                          <p className="text-sm text-muted-foreground">Weekly posts across LinkedIn and two additional platforms</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Email Marketing Setup & Automation</h5>
                          <p className="text-sm text-muted-foreground">Nurture sequences for prospects and client communication</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full sm:w-auto rounded-full px-8 py-6"
                      onClick={() => window.location.href = "/checkout?plan=marketing-premium"}
                    >
                      Get Started with Premium
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="bg-muted rounded-lg p-6 h-full">
                      <h4 className="text-xl font-semibold mb-4">What's Included</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Everything in Essential package, plus:</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>10-page custom website with blog</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Monthly content creation (2 articles)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Advanced Google Ads management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Custom landing pages for campaigns</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Weekly social media content</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Email marketing automation</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Basic cybersecurity assessment</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Bi-weekly strategy calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Phone and email support</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Ideal For</h5>
                        <p className="text-sm text-muted-foreground">
                          Established advisors seeking to systematically grow their practice through multiple marketing channels and attract higher-value clients.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Elite Package */}
              <TabsContent value="elite" className="rounded-lg bg-card p-8 shadow-lg border border-border/50">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-1/2">
                    <div className="flex items-center gap-2 mb-6">
                      <h3 className="text-2xl font-semibold">Elite Marketing Package</h3>
                    </div>
                    
                    <div className="flex items-baseline mb-8">
                      <span className="text-4xl font-bold">$7,499</span>
                      <span className="text-muted-foreground ml-2">one-time setup + monthly maintenance</span>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      A comprehensive, white-glove marketing solution for advisors serious about becoming the dominant player in their market and attracting ultra-high-net-worth clients.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Premium Custom Website & Brand Identity</h5>
                          <p className="text-sm text-muted-foreground">Complete brand identity development with 15+ page custom website</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Full-Service Digital Marketing</h5>
                          <p className="text-sm text-muted-foreground">Integrated Google Ads, social media, and content marketing strategy</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Thought Leadership Positioning</h5>
                          <p className="text-sm text-muted-foreground">Guest article placement, podcast appearances, and PR opportunities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-foreground">Complete Cybersecurity Implementation</h5>
                          <p className="text-sm text-muted-foreground">Comprehensive security protocols and compliance documentation</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full sm:w-auto rounded-full px-8 py-6"
                      onClick={() => window.location.href = "/checkout?plan=marketing-elite"}
                    >
                      Get Started with Elite
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="bg-muted rounded-lg p-6 h-full">
                      <h4 className="text-xl font-semibold mb-4">What's Included</h4>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Everything in Premium package, plus:</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Complete brand identity development</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>15+ page premium website</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Weekly content creation (blog/video)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Media outreach & PR opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Video content production</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Webinar setup and promotion</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Comprehensive cybersecurity solution</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Dedicated marketing strategist</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Weekly strategy calls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Priority 24/7 support</span>
                        </li>
                      </ul>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Ideal For</h5>
                        <p className="text-sm text-muted-foreground">
                          High-performing advisors and RIAs seeking market dominance, UHNW client acquisition, and a complete marketing solution managed by experts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Not sure which package is right for you?</p>
              <Button variant="outline" className="rounded-full">
                Schedule a Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Common questions about our marketing services for financial advisors.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-2">How much do your marketing services cost?</h3>
                <p className="text-muted-foreground">
                  Our marketing services are customized based on your specific needs and goals. Google Ads management typically starts at $1,500/month plus ad spend. Website design projects start at $2,495, and cybersecurity packages begin at $1,995 annually. We provide detailed proposals after understanding your specific requirements during the initial consultation.
                </p>
              </div>
              
              {/* FAQ Item 2 */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-2">Are your services compliant with financial industry regulations?</h3>
                <p className="text-muted-foreground">
                  Yes, all our marketing services are designed with financial industry compliance in mind. We're familiar with SEC, FINRA, and other regulatory requirements for financial advisors. We work closely with your compliance department to ensure all marketing materials meet the necessary standards and include required disclosures.
                </p>
              </div>
              
              {/* FAQ Item 3 */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-2">How long does it take to see results from marketing efforts?</h3>
                <p className="text-muted-foreground">
                  Results vary based on the marketing service and your specific market. Google Ads campaigns typically generate leads within the first month. Website SEO improvements generally take 3-6 months to significantly impact organic traffic. Cybersecurity implementations provide immediate protection but may take 4-6 weeks for full deployment across your organization.
                </p>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-2">Do you work with advisors affiliated with broker-dealers?</h3>
                <p className="text-muted-foreground">
                  Yes, we work with independent advisors, RIAs, and advisors affiliated with broker-dealers. We're experienced in navigating the additional compliance requirements and approval processes associated with broker-dealer relationships. We can coordinate directly with your compliance department to streamline the approval process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}