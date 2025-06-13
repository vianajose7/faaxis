import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowRight, Check, Globe, Layout, MoveRight, BarChart2, Search, Shield, Smartphone, MousePointer, Coffee, Layers, Zap, PenTool, Code, Lightbulb, StarIcon, ChevronLeft, ChevronRight, FileText, Lock } from "lucide-react";
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
                    <SelectValue>
                      {serviceTab === "google-ads" && (
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2" />
                          <span>Google Ads</span>
                        </div>
                      )}
                      {serviceTab === "web-design" && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>Web Design</span>
                        </div>
                      )}
                      {serviceTab === "social-media" && (
                        <div className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          <span>Social Media</span>
                        </div>
                      )}
                      {serviceTab === "content" && (
                        <div className="flex items-center">
                          <PenTool className="h-4 w-4 mr-2" />
                          <span>Content</span>
                        </div>
                      )}
                      {serviceTab === "cybersecurity" && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Security</span>
                        </div>
                      )}
                    </SelectValue>
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
              <div className="hidden md:block">
                <Tabs value={serviceTab} onValueChange={setServiceTab}>
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
              </div>
              
              {/* Service Content Based on Selection */}
              {serviceTab === "google-ads" && (
                <div className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
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
                      
                      <Button className="rounded-full px-8">
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
                </div>
              )}
              
              {/* Web Design Content */}
              {serviceTab === "web-design" && (
                <div className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-3/5">
                      <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-semibold">Website Design for Advisors</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        Our web design services specifically for financial advisors create professional, conversion-focused websites that build trust and generate leads. Each site is custom designed to reflect your unique value proposition and brand.
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-4">Our Web Design Process</h4>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Strategy & Discovery</h5>
                            <p className="text-muted-foreground">We analyze your target clients, business goals, and competitive landscape to create a strategic website plan.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Layout className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Custom Design & Development</h5>
                            <p className="text-muted-foreground">Our designers create a unique, professional look while our developers build a fast, responsive site with modern functionality.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">SEO Optimization & Launch</h5>
                            <p className="text-muted-foreground">We optimize your site for search engines and ensure everything works perfectly before launch.</p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Custom Design</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Mobile Responsive</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Lead Generation Forms</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>SEO Optimization</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Compliance Review</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Analytics Setup</span>
                        </li>
                      </ul>
                      
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold">Pricing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Standard Website</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$4,999</p>
                            <p className="text-sm text-muted-foreground">One-time fee with monthly maintenance available</p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Premium Website</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$8,999</p>
                            <p className="text-sm text-muted-foreground">Advanced features, custom integrations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-2/5">
                      <div className="bg-muted/30 rounded-lg p-6 border border-border h-full">
                        <h4 className="text-lg font-semibold mb-4">Website Benefits</h4>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Establish professional credibility online</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Generate qualified leads 24/7</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Showcase your services and expertise</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Differentiate from competitors</span>
                          </li>
                        </ul>
                        
                        <Separator className="my-6" />
                        
                        <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Average Lead Conversion</span>
                              <span>3-5%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '70%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Site Speed Improvement</span>
                              <span>40-60%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Mobile Usability</span>
                              <span>90-100%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Social Media Content */}
              {serviceTab === "social-media" && (
                <div className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-3/5">
                      <div className="flex items-center gap-2 mb-6">
                        <Smartphone className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-semibold">Social Media Management</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        Our social media management services help financial advisors establish credibility, engage with prospects, and nurture client relationships through strategic content that supports your business goals while maintaining compliance.
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-4">Our Social Media Process</h4>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Strategy Development</h5>
                            <p className="text-muted-foreground">We develop a custom social media strategy focused on your specific goals, target audience, and unique value proposition.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <PenTool className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Content Creation & Scheduling</h5>
                            <p className="text-muted-foreground">Our team creates compliance-approved content tailored to each platform and schedules regular posts to maintain consistent presence.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <BarChart2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Monitoring & Optimization</h5>
                            <p className="text-muted-foreground">We track engagement metrics and continuously refine your strategy to improve results over time.</p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Profile Optimization</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Content Calendar</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Custom Graphics</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>3-5 Posts per Week</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Compliance Review</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Engagement Monitoring</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Monthly Performance Reports</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Strategy Adjustments</span>
                        </li>
                      </ul>
                      
                      <Button className="rounded-full px-8">
                        Request Social Media Proposal
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="md:w-2/5">
                      <div className="bg-muted rounded-lg p-6 shadow-inner">
                        <h4 className="text-xl font-semibold mb-4">Social Media Benefits</h4>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Establish thought leadership in your financial niche</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Showcase your expertise and services to potential clients</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Build trust through consistent, valuable content</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Stay top-of-mind with your existing client base</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Generate leads through targeted engagement strategies</span>
                          </li>
                        </ul>
                        
                        <div className="bg-primary/10 rounded-lg p-4 mb-6">
                          <h5 className="font-semibold mb-2 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                            Compliance Note
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            All social media content is created with FINRA and SEC guidelines in mind. We work with your compliance department to ensure all content meets regulatory requirements.
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-background to-muted rounded-lg p-6 border border-border">
                          <h5 className="font-semibold mb-3">Platforms We Manage</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#0077B5] flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              </div>
                              <span>LinkedIn</span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#1DA1F2] flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                              </div>
                              <span>Twitter</span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#4267B2] flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              </div>
                              <span>Facebook</span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#405DE6] via-[#E1306C] to-[#FFDC80] flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                              </div>
                              <span>Instagram</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Content Marketing */}
              {serviceTab === "content" && (
                <div className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-3/5">
                      <div className="flex items-center gap-2 mb-6">
                        <PenTool className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-semibold">Content Marketing</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        Our content marketing services help financial advisors establish thought leadership, improve SEO rankings, and nurture prospects through the client journey with professionally written, compliance-approved content.
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-4">Our Content Marketing Process</h4>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Content Strategy</h5>
                            <p className="text-muted-foreground">We develop a comprehensive content plan aligned with your client acquisition goals and expertise areas.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Professional Writing</h5>
                            <p className="text-muted-foreground">Our financial writers create engaging, educational content that positions you as an expert while maintaining compliance.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <BarChart2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Distribution & Promotion</h5>
                            <p className="text-muted-foreground">We distribute your content across multiple channels to maximize visibility and engagement.</p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Blog Writing</span>
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
                          <span>SEO Optimization</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Compliance Review</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Content Calendar</span>
                        </li>
                      </ul>
                      
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold">Pricing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Basic Content</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$1,499</p>
                            <p className="text-sm text-muted-foreground">Per month, 2 blog posts + newsletter</p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Premium Content</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$2,999</p>
                            <p className="text-sm text-muted-foreground">Per month, 4 blog posts + premium content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-2/5">
                      <div className="bg-muted/30 rounded-lg p-6 border border-border h-full">
                        <h4 className="text-lg font-semibold mb-4">Content Marketing Benefits</h4>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Build credibility and thought leadership</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Improve SEO rankings and website traffic</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Nurture prospects through educational content</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Provide ongoing value to existing clients</span>
                          </li>
                        </ul>
                        
                        <Separator className="my-6" />
                        
                        <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Lead Generation</span>
                              <span>20-40% Increase</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Search Traffic</span>
                              <span>30-50% Increase</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Email Engagement</span>
                              <span>25-35%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Services */}
              {serviceTab === "cybersecurity" && (
                <div className="rounded-lg bg-card p-6 md:p-10 shadow-lg border border-border/50">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-3/5">
                      <div className="flex items-center gap-2 mb-6">
                        <Shield className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-semibold">Cybersecurity for Advisors</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        Our comprehensive cybersecurity services protect financial advisors from data breaches, ransomware, and compliance violations through advanced security protocols and staff training specifically designed for wealth management firms.
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-4">Our Security Process</h4>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Security Assessment</h5>
                            <p className="text-muted-foreground">We conduct a thorough evaluation of your current security posture, identifying vulnerabilities and compliance gaps.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Lock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Custom Security Plan</h5>
                            <p className="text-muted-foreground">We develop and implement a tailored security strategy based on your specific needs and regulatory requirements.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 bg-primary/10 rounded-full p-1 mr-4">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-lg font-medium text-foreground">Ongoing Protection</h5>
                            <p className="text-muted-foreground">We provide continuous monitoring, regular security updates, and staff training to maintain your security posture.</p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-semibold mb-4">Package Includes</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Security Assessment</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Data Protection</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Email Security</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Staff Training</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Compliance Documentation</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>Incident Response Plan</span>
                        </li>
                      </ul>
                      
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold">Pricing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Essential Security</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$1,999</p>
                            <p className="text-sm text-muted-foreground">Per month, for firms up to 5 employees</p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h5 className="font-medium mb-1">Advanced Security</h5>
                            <p className="text-2xl font-bold text-primary mb-2">$3,499</p>
                            <p className="text-sm text-muted-foreground">Per month, for firms with 6-20 employees</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-2/5">
                      <div className="bg-muted/30 rounded-lg p-6 border border-border h-full">
                        <h4 className="text-lg font-semibold mb-4">Security Benefits</h4>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Protect sensitive client financial data</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Meet SEC and FINRA compliance requirements</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Prevent costly data breaches and downtime</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                            <span>Demonstrate security commitment to clients</span>
                          </li>
                        </ul>
                        
                        <Separator className="my-6" />
                        
                        <h4 className="text-lg font-semibold mb-4">Security Statistics</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Financial Firms Targeted</span>
                              <span>300% Increase</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Average Breach Cost</span>
                              <span>$5.7M</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Security Incidents Prevented</span>
                              <span>95%</span>
                            </div>
                            <div className="h-2 bg-muted-foreground/20 rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
               
              {/* Pricing Section */}
              <div className="mt-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Marketing Packages
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                  Choose the marketing package that aligns with your practice goals and budget.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <Card className="border-primary/50 bg-card shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl font-bold">Basic Package</CardTitle>
                      <CardDescription className="text-lg">Essential Marketing Support</CardDescription>
                      <div className="mt-4 mb-2">
                        <span className="text-3xl font-bold">$1,999</span>
                        <span className="text-muted-foreground"> /month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="my-4" />
                      <ul className="space-y-3 text-left">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Website maintenance & SEO</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Google Ads management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>2 social media platforms</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>1 blog article per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Basic analytics reporting</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <Button className="w-full rounded-full">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        3-month minimum commitment
                      </p>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-primary bg-card shadow-lg relative">
                    <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase py-1 px-3 rounded-full">Most Popular</div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl font-bold">Growth Package</CardTitle>
                      <CardDescription className="text-lg">Comprehensive Marketing</CardDescription>
                      <div className="mt-4 mb-2">
                        <span className="text-3xl font-bold">$4,999</span>
                        <span className="text-muted-foreground"> /month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="my-4" />
                      <ul className="space-y-3 text-left">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Premium website with monthly updates</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Advanced Google Ads management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Full social media management (4 platforms)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>3 blog articles per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Email marketing campaigns</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Dedicated account manager</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        Includes strategic planning sessions
                      </p>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-primary/50 bg-card shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl font-bold">Premium Package</CardTitle>
                      <CardDescription className="text-lg">Full-Service Marketing</CardDescription>
                      <div className="mt-4 mb-2">
                        <span className="text-3xl font-bold">$7,499</span>
                        <span className="text-muted-foreground"> /month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="my-4" />
                      <ul className="space-y-3 text-left">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>All Growth Package features</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Custom website redesign (included)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>5 blog articles per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>PR & media outreach</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Lead generation system</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span>Monthly executive strategy meetings</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <Button className="w-full rounded-full">
                        Request Consultation
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        Complete marketing solution for growing firms
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Client Testimonials Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                What Our Clients Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hear from financial advisors who have transformed their practices through our marketing services.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto overflow-hidden">
              <div className="flex mb-4 justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={scrollPrev} 
                  disabled={!prevBtnEnabled}
                  className="rounded-full h-10 w-10 p-0 bg-background border border-border"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={scrollNext} 
                  disabled={!nextBtnEnabled}
                  className="rounded-full h-10 w-10 p-0 bg-background border border-border"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {reviews.map((review, index) => (
                    <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4" key={index}>
                      <Card className="h-full bg-card border-border/50 shadow-md">
                        <CardContent className="pt-6">
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-muted-foreground mb-6">"{review.text}"</p>
                          <div className="flex items-center mt-auto">
                            <div className="bg-primary/10 text-primary font-medium h-10 w-10 rounded-full flex items-center justify-center mr-3">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <p className="text-sm text-muted-foreground">{review.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to transform your practice?
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl">
                  Schedule a free consultation to discover how our marketing services can help you attract more ideal clients and grow your financial advisory practice.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="https://tidycal.com/consultationmeet/15-minute-meeting" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-base font-medium">
                      Schedule Consultation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-white/30 hover:bg-white/10">
                    View Case Studies
                    <MoveRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 bg-white/10 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Marketing Strategy Call</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-1" />
                    <span>Free 30-minute consultation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-1" />
                    <span>Practice growth assessment</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-1" />
                    <span>Customized strategy recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-1" />
                    <span>Marketing budget planning</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-1" />
                    <span>No obligation or pressure</span>
                  </li>
                </ul>
                <div className="flex items-center text-sm opacity-80">
                  <Coffee className="h-4 w-4 mr-2" />
                  <span>15+ consultations scheduled this week</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}