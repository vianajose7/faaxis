import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { SimpleNavbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FirmNews } from "@/components/firm-profiles/firm-news";
import { getNewsForFirm } from "@/data/firm-news-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  ArrowLeft,
  TrendingUp, 
  Shield, 
  Calendar, 
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  Star,
  Briefcase,
  BarChart3,
  Award,
  Laptop,
  Handshake,
  FileText,
  ExternalLink,
  Play,
  Globe
} from "lucide-react";
import { LazyImage } from "@/components/ui/lazy-image";

// Sample firm data - in a real app, this would come from an API
const firmData = [
  {
    id: "1",
    firm: "Morgan Stanley",
    type: "Wirehouse",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_logo.svg",
    headquarters: "New York, NY",
    founded: "1935",
    ceo: "James P. Gorman",
    aum: "$1.3 trillion",
    advisors: "15,000+",
    dealStructure: ["High Upfront", "Deferred Comp"],
    bio: "Morgan Stanley is a leading global financial services firm providing investment banking, securities, wealth management and investment management services. With offices in more than 41 countries, the Firm's employees serve clients worldwide including corporations, governments, institutions and individuals.",
    stockTicker: "MS",
    stockPrice: "$97.23",
    lastCloseChange: "+0.67 (0.69%)",
    headcount: 75000,
    website: "https://www.morganstanley.com",
    socialLinks: {
      linkedin: "https://www.linkedin.com/company/morgan-stanley",
      twitter: "https://twitter.com/MorganStanley"
    },
    overallRating: 4.2,
    ratings: {
      "Transition Support": 4.5,
      "Technology": 4.3,
      "Advisor Freedom": 3.8,
      "Compensation": 4.6,
      "Culture": 4.0
    },
    dealDetails: {
      upfrontRange: "250% - 350%",
      backendRange: "25% - 75%",
      backendPeriod: "5-9 years",
      deferredComp: "Yes - 15% of upfront",
      notes: "Top tier producers can negotiate higher upfront percentages. Backend bonuses depend on growth metrics and asset retention."
    },
    platformFeatures: [
      "Proprietary research",
      "Dedicated transition team",
      "Advanced financial planning tools",
      "Customizable client portal",
      "Comprehensive investment platform",
      "Banking and lending solutions",
      "Institutionalized alternatives access"
    ],
    pros: [
      "Premier global brand recognition",
      "Strong upfront recruitment deals",
      "Sophisticated technology platform",
      "Access to investment banking resources",
      "Institutional research"
    ],
    cons: [
      "Less autonomy than independent models",
      "Stringent compliance oversight",
      "Product limitations compared to independent",
      "Higher grid thresholds",
      "Mandatory deferred compensation"
    ],
    transitionProcess: {
      description: "Morgan Stanley provides a comprehensive transition process with dedicated teams to help advisors move their business.",
      steps: [
        {
          title: "Initial Assessment",
          description: "Complete business profile analysis and receive preliminary offer"
        },
        {
          title: "Due Diligence & Contracting",
          description: "Review platform, technology, and finalize offer terms"
        },
        {
          title: "Pre-Transition Planning",
          description: "Work with dedicated transition team to map client data and prepare communications"
        },
        {
          title: "Resignation & Announcement",
          description: "Execute coordinated resignation and client outreach strategy"
        },
        {
          title: "Client Transition",
          description: "Onboard clients with dedicated operations support"
        },
        {
          title: "Business Integration",
          description: "Training, practice optimization, and platform integration"
        }
      ]
    },
    videoPromo: "https://www.youtube.com/embed/KuCsX6oeAMg",
    faq: [
      {
        question: "What is Morgan Stanley's typical transition timeline?",
        answer: "The typical transition timeline from signing to joining Morgan Stanley is 4-6 weeks. Client asset transfers typically reach 70-80% within the first 30 days and 85-90% within 90 days."
      },
      {
        question: "How are transition packages structured?",
        answer: "Morgan Stanley's transition packages include an upfront forgivable loan based on trailing 12-month production (typically 250-350% depending on production and assets), backend bonuses tied to asset transfer and growth goals (25-75% additional), and may include deferred compensation components."
      },
      {
        question: "What support does Morgan Stanley provide during transition?",
        answer: "Morgan Stanley provides a dedicated transition team including a senior transition officer, operations specialists, technology setup experts, and marketing support to help with client communications, data mapping, account transfers, and business integration."
      },
      {
        question: "Can advisors keep their team structure?",
        answer: "Yes, Morgan Stanley supports various team configurations and will work to incorporate your existing team structure including advisors, administrative staff, and specialists."
      },
      {
        question: "What are the grid payout rates at Morgan Stanley?",
        answer: "Morgan Stanley's grid payout rates range from 28% to 47% based on production levels, with top tier advisors ($5M+) reaching the highest payout tiers."
      }
    ]
  },
  {
    id: "2",
    firm: "UBS",
    type: "Wirehouse",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f3/UBS_Logo.svg",
    headquarters: "Zurich, Switzerland",
    founded: "1862",
    ceo: "Sergio P. Ermotti",
    aum: "$1.4 trillion",
    advisors: "10,000+",
    dealStructure: ["High Upfront", "Deferred Comp"],
    bio: "UBS is a Swiss multinational investment bank and financial services company founded and based in Switzerland. With global reach and a comprehensive wealth management platform, UBS provides a full suite of financial services to both individual and institutional clients.",
    stockTicker: "UBS",
    stockPrice: "$29.84",
    lastCloseChange: "+0.23 (0.78%)",
    headcount: 72000,
    website: "https://www.ubs.com",
    socialLinks: {
      linkedin: "https://www.linkedin.com/company/ubs",
      twitter: "https://twitter.com/UBS"
    },
    overallRating: 4.3,
    ratings: {
      "Transition Support": 4.4,
      "Technology": 4.2,
      "Advisor Freedom": 3.9,
      "Compensation": 4.7,
      "Culture": 4.1
    },
    dealDetails: {
      upfrontRange: "280% - 360%",
      backendRange: "25% - 60%",
      backendPeriod: "5-8 years",
      deferredComp: "Yes - 20% of upfront",
      notes: "UBS offers aggressive recruiting packages for high-quality teams, particularly for those with high net worth and ultra-high net worth clients."
    },
    platformFeatures: [
      "Global investment platform",
      "Best-in-class research",
      "Advanced financial planning tools",
      "International banking capabilities",
      "Alternative investment access",
      "Dedicated retirement services"
    ],
    pros: [
      "Global brand recognition",
      "Competitive recruitment packages",
      "International capabilities",
      "High net worth client focus",
      "Comprehensive planning tools"
    ],
    cons: [
      "Higher degree of supervision",
      "Lower payouts than independent channels",
      "Required product use in some cases",
      "Limited flexibility in marketing",
      "Mandatory deferred compensation structure"
    ],
    transitionProcess: {
      description: "UBS provides a comprehensive transition process with dedicated teams to ensure a smooth transition for advisors and their clients.",
      steps: [
        {
          title: "Initial Consultation",
          description: "Analyze practice and formulate transition offer"
        },
        {
          title: "Due Diligence & Contracting",
          description: "Review platform offerings and finalize contract terms"
        },
        {
          title: "Transition Planning",
          description: "Develop detailed transition timeline and client transfer strategy"
        },
        {
          title: "Resignation & Announcement",
          description: "Execute coordinated resignation and begin client outreach"
        },
        {
          title: "Client Onboarding",
          description: "Transfer accounts with dedicated transition deal team"
        },
        {
          title: "Business Development",
          description: "Implement new business development strategies with UBS resources"
        }
      ]
    },
    videoPromo: "https://www.youtube.com/embed/_M_Xbi_ZXcg",
    faq: [
      {
        question: "What is UBS's typical transition timeline?",
        answer: "The typical transition timeline from signing to joining UBS is 4-8 weeks. Client asset transfers typically reach 75-85% within the first 30 days and 90% within 90 days."
      },
      {
        question: "How are transition packages structured?",
        answer: "UBS transition packages include an upfront forgivable loan based on trailing 12-month production (typically 280-360% depending on production level and client composition), backend bonuses tied to asset transfer goals (25-60% additional), and include deferred compensation components."
      },
      {
        question: "What support does UBS provide during transition?",
        answer: "UBS provides a dedicated transition team including a transition manager, operations specialists, technology setup experts, and marketing support for client communications, data mapping, and account transfers."
      },
      {
        question: "What technology does UBS offer advisors?",
        answer: "UBS offers a comprehensive technology suite including portfolio management tools, financial planning software, risk analysis tools, and a client portal with mobile capabilities."
      },
      {
        question: "What are the grid payout rates at UBS?",
        answer: "UBS grid payout rates range from 30% to 48% based on production levels, with top tier advisors ($5M+) reaching the highest payout tiers."
      }
    ]
  }
];

export default function FirmProfileDetailPage() {
  const [match, params] = useRoute('/firm-profiles/:id');
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  if (!match) {
    setLocation('/firm-profiles');
    return null;
  }

  const firm = firmData.find(f => f.id === params?.id);
  
  if (!firm) {
    setLocation('/firm-profiles');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title={`${firm.firm} | Firm Profile | FaAxis`}
        description={`Detailed profile of ${firm.firm} including recruitment deals, platform features, and advisor reviews. Compare transition packages and firm culture.`}
        keywords={`${firm.firm}, wealth management, financial advisor transition, recruitment package, advisor deal, transition bonus`}
      />
      <SimpleNavbar />
      
      {/* Firm Profile Header */}
      <section className="pt-8 pb-4 md:pt-12 md:pb-8 border-b">
        <div className="container mx-auto px-4">
          <Link href="/firm-profiles" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Firm Profiles
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-muted/30 p-6 rounded-lg flex items-center justify-center w-full md:w-1/3 lg:w-1/4">
              <img
                src={firm.logoUrl}
                alt={`${firm.firm} logo`}
                className="max-h-24 max-w-full"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{firm.firm}</h1>
                    <span className="text-sm px-2 py-1 bg-muted rounded-md">{firm.type}</span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{firm.bio}</p>
                </div>
                
                <div className="flex flex-col items-end justify-start">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-lg">{firm.overallRating}</span>
                    <span className="text-muted-foreground text-sm">/5</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Advisor Rating
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{firm.headquarters}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Founded: {firm.founded}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{firm.advisors} advisors</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">AUM: {firm.aum}</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Button>
                  Compare Deal
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <a href={firm.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ticker Symbol Section - Desktop only */}
      <section className="py-4 border-b hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Ticker: {firm.stockTicker}</span>
              <span className="text-lg font-bold">{firm.stockPrice}</span>
              <span className={`text-sm ml-2 ${firm.lastCloseChange.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                {firm.lastCloseChange}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {firm.socialLinks.linkedin && (
                <a 
                  href={firm.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
              )}
              {firm.socialLinks.twitter && (
                <a 
                  href={firm.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
              )}
              <a 
                href={firm.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deal-details">Deal Details</TabsTrigger>
              <TabsTrigger value="platform">Platform</TabsTrigger>
              <TabsTrigger value="transition">Transition Process</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Ratings Section */}
                  <Card className="mb-8 overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Star className="h-5 w-5 text-primary mr-2" />
                        Advisor Ratings
                      </h2>
                      
                      <div className="space-y-4">
                        {Object.entries(firm.ratings).map(([category, rating]) => (
                          <div key={category} className="flex flex-col">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-sm text-muted-foreground">{rating}/5</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress className="flex-1" value={rating * 20} />
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                  
                  {/* Video Promo */}
                  <Card className="mb-8 overflow-hidden">
                    <div className="aspect-video relative">
                      <iframe 
                        src={firm.videoPromo} 
                        title={`${firm.firm} promotional video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      ></iframe>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Watch: Inside {firm.firm}</h3>
                      <p className="text-muted-foreground">
                        Get an inside look at {firm.firm}'s advisor experience, platform capabilities, and culture.
                      </p>
                    </div>
                  </Card>
                  
                  {/* Pros and Cons */}
                  <Card className="mb-8">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Pros & Cons</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-green-600 flex items-center">
                            <span className="mr-2 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">+</span>
                            Pros
                          </h3>
                          <ul className="space-y-2">
                            {firm.pros.map((pro, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-red-600 flex items-center">
                            <span className="mr-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">-</span>
                            Cons
                          </h3>
                          <ul className="space-y-2">
                            {firm.cons.map((con, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">✗</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Quick Facts Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CEO</span>
                          <span className="font-medium">{firm.ceo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Headquarters</span>
                          <span className="font-medium">{firm.headquarters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded</span>
                          <span className="font-medium">{firm.founded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employees</span>
                          <span className="font-medium">{firm.headcount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AUM</span>
                          <span className="font-medium">{firm.aum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Advisors</span>
                          <span className="font-medium">{firm.advisors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock Ticker</span>
                          <a 
                            href={`https://finance.yahoo.com/quote/${firm.stockTicker}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-primary"
                          >
                            {firm.stockTicker}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Deal Structure Highlight */}
                  <Card className="bg-primary/5 border-primary/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Briefcase className="text-primary mr-2 h-5 w-5" />
                        Deal Structure Highlights
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Upfront Range</span>
                          <span className="font-medium">{firm.dealDetails.upfrontRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Backend Range</span>
                          <span className="font-medium">{firm.dealDetails.backendRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Backend Period</span>
                          <span className="font-medium">{firm.dealDetails.backendPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deferred Comp</span>
                          <span className="font-medium">{firm.dealDetails.deferredComp}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-sm text-muted-foreground">
                        <i>{firm.dealDetails.notes}</i>
                      </div>
                      
                      <div className="mt-6">
                        <Button variant="default" className="w-full">
                          Compare This Deal
                          <BarChart3 className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  {/* CTA Card */}
                  <Card className="bg-muted/50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Ready to Make Your Move?</h3>
                      <p className="text-muted-foreground mb-4">
                        Use our AI calculator to see your personalized transition projections.
                      </p>
                      <Link href="/calculator">
                        <Button className="w-full">
                          Calculate My Deal
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Deal Details Tab */}
            <TabsContent value="deal-details" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="mb-8">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Transition Package Structure</h2>
                      
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <DollarSign className="text-primary mr-2 h-5 w-5" />
                            Upfront Component
                          </h3>
                          <div className="pl-7 space-y-2">
                            <p className="mb-4">
                              {firm.firm} offers upfront recruiting packages ranging from <strong>{firm.dealDetails.upfrontRange}</strong> of 
                              trailing 12-month production, structured as forgivable loans over 7-10 years.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-md">
                              <h4 className="font-medium mb-2">Calculation Example:</h4>
                              <p className="text-sm">
                                An advisor with $1M in annual production could receive between $2.5M - $3.5M in upfront money, 
                                distributed at closing with 9-year forgiveness (1/9th per year).
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Award className="text-primary mr-2 h-5 w-5" />
                            Backend Bonuses
                          </h3>
                          <div className="pl-7 space-y-2">
                            <p className="mb-4">
                              Backend bonuses range from <strong>{firm.dealDetails.backendRange}</strong> of trailing 12-month production, 
                              paid out over <strong>{firm.dealDetails.backendPeriod}</strong> based on asset transfer and growth targets.
                            </p>
                            <div className="border border-border rounded-md overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Achievement Level</th>
                                    <th className="px-4 py-2 text-left">Asset Transfer Rate</th>
                                    <th className="px-4 py-2 text-left">Backend Percentage</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-t border-border">
                                    <td className="px-4 py-2">Threshold</td>
                                    <td className="px-4 py-2">60-70%</td>
                                    <td className="px-4 py-2">25%</td>
                                  </tr>
                                  <tr className="border-t border-border">
                                    <td className="px-4 py-2">Target</td>
                                    <td className="px-4 py-2">70-80%</td>
                                    <td className="px-4 py-2">40%</td>
                                  </tr>
                                  <tr className="border-t border-border">
                                    <td className="px-4 py-2">Stretch</td>
                                    <td className="px-4 py-2">80-90%</td>
                                    <td className="px-4 py-2">60%</td>
                                  </tr>
                                  <tr className="border-t border-border">
                                    <td className="px-4 py-2">Maximum</td>
                                    <td className="px-4 py-2">90%+</td>
                                    <td className="px-4 py-2">75%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Calendar className="text-primary mr-2 h-5 w-5" />
                            Deferred Compensation
                          </h3>
                          <div className="pl-7">
                            <p className="mb-4">
                              {firm.dealDetails.deferredComp}. Deferred compensation generally comprises 
                              approximately 15-20% of the total upfront package value.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-md">
                              <p className="text-sm italic">
                                Note: Deferred compensation structures are subject to vesting schedules and are 
                                typically tied to continued employment. These components may be forfeited upon 
                                early departure from the firm.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Compensation Structure</h2>
                      
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Grid Payout</h3>
                          <div className="border border-border rounded-md overflow-hidden mb-4">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Production Tier</th>
                                  <th className="px-4 py-2 text-left">Payout Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$0 - $250K</td>
                                  <td className="px-4 py-2">30%</td>
                                </tr>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$250K - $500K</td>
                                  <td className="px-4 py-2">35%</td>
                                </tr>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$500K - $1M</td>
                                  <td className="px-4 py-2">40%</td>
                                </tr>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$1M - $2.5M</td>
                                  <td className="px-4 py-2">42%</td>
                                </tr>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$2.5M - $5M</td>
                                  <td className="px-4 py-2">45%</td>
                                </tr>
                                <tr className="border-t border-border">
                                  <td className="px-4 py-2">$5M+</td>
                                  <td className="px-4 py-2">47%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            Note: Production tiers and payout rates are approximations and may vary based on 
                            individual negotiation, team structure, and client composition.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Additional Compensation</h3>
                          <div className="space-y-4">
                            <div className="p-4 border border-border rounded-md">
                              <h4 className="font-medium mb-1">Length of Service Bonuses</h4>
                              <p className="text-sm text-muted-foreground">
                                Advisors receive additional deferred compensation based on length of service, 
                                ranging from 1-5% of annual production for advisors with 5+ years at the firm.
                              </p>
                            </div>
                            
                            <div className="p-4 border border-border rounded-md">
                              <h4 className="font-medium mb-1">Growth Awards</h4>
                              <p className="text-sm text-muted-foreground">
                                Annual growth awards for advisors who increase production by 10%+ year-over-year, 
                                ranging from 2-8% of the growth portion depending on production tier.
                              </p>
                            </div>
                            
                            <div className="p-4 border border-border rounded-md">
                              <h4 className="font-medium mb-1">Recognition Programs</h4>
                              <p className="text-sm text-muted-foreground">
                                Top advisors qualify for recognition clubs that provide additional benefits 
                                including higher payouts, dedicated support, and exclusive events.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div>
                  {/* Deal Structure Highlight Card - same as in Overview */}
                  <Card className="bg-primary/5 border-primary/20 mb-8">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Briefcase className="text-primary mr-2 h-5 w-5" />
                        Deal Structure Highlights
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Upfront Range</span>
                          <span className="font-medium">{firm.dealDetails.upfrontRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Backend Range</span>
                          <span className="font-medium">{firm.dealDetails.backendRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Backend Period</span>
                          <span className="font-medium">{firm.dealDetails.backendPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deferred Comp</span>
                          <span className="font-medium">{firm.dealDetails.deferredComp}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-sm text-muted-foreground">
                        <i>{firm.dealDetails.notes}</i>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Deal Comparison Card */}
                  <Card className="mb-8">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Compare Your Offers</h3>
                      <p className="text-muted-foreground mb-6">
                        Use our AI-powered calculator to compare this deal with offers from other firms.
                      </p>
                      <Link href="/calculator">
                        <Button className="w-full">
                          Calculate My Transition Value
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  
                  {/* Deal Document Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FileText className="text-primary mr-2 h-5 w-5" />
                        Deal Documentation
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Download our analysis of {firm.firm}'s standard transition agreement to understand key terms and provisions.
                      </p>
                      <Button variant="outline" className="w-full">
                        Download Deal Guide
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Platform Tab */}
            <TabsContent value="platform" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="mb-8">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Platform & Technology</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Laptop className="text-primary mr-2 h-5 w-5" />
                            Technology Overview
                          </h3>
                          <p className="mb-4">
                            {firm.firm} has invested heavily in its technology platform, providing advisors with 
                            a comprehensive suite of tools for financial planning, portfolio management, client 
                            engagement, and practice management.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Financial Planning</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Comprehensive goal-based planning platform</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Monte Carlo simulation capabilities</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Cash flow and tax optimization tools</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Estate planning modules</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Portfolio Management</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Unified managed account platform</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Performance reporting and analytics</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Risk analysis and optimization tools</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Model portfolio management</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Client Engagement</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Client portal with mobile access</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Secure document sharing and storage</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Video conferencing integration</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Digital client onboarding</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Practice Management</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>CRM with workflow automation</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Business analytics dashboard</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Team collaboration tools</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Marketing automation suite</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Briefcase className="text-primary mr-2 h-5 w-5" />
                            Investment Platform
                          </h3>
                          <p className="mb-4">
                            {firm.firm} offers a comprehensive investment platform with access to a wide range of 
                            products and solutions to meet client needs.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Investment Products</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Proprietary and third-party managed accounts</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Extensive mutual fund platform</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>ETF solutions and model portfolios</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Alternative investments platform</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Banking & Lending</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Securities-based lending</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Mortgage solutions</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Business lending services</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>Cash management accounts</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Resources & Support</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Users className="text-primary mr-2 h-5 w-5" />
                            Advisor Support Teams
                          </h3>
                          <p className="mb-4">
                            {firm.firm} provides dedicated support to advisors through specialized teams.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Business Development</h4>
                              <p className="text-sm text-muted-foreground">
                                Dedicated business consultants work with advisors to implement growth strategies,
                                marketing initiatives, and client acquisition programs.
                              </p>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Investment Consulting</h4>
                              <p className="text-sm text-muted-foreground">
                                Investment specialists provide portfolio construction guidance, product expertise,
                                and market insights to support client investment strategies.
                              </p>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Advanced Planning</h4>
                              <p className="text-sm text-muted-foreground">
                                Team of specialists in estate planning, tax strategies, business succession, and
                                philanthropic planning available for client consultations.
                              </p>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Technology & Operations</h4>
                              <p className="text-sm text-muted-foreground">
                                Dedicated technology consultants and operational support teams to assist with
                                platform utilization, workflow optimization, and issue resolution.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Award className="text-primary mr-2 h-5 w-5" />
                            Advisor Development
                          </h3>
                          <p className="mb-4">
                            {firm.firm} invests in advisor development through training, education, and 
                            professional growth opportunities.
                          </p>
                          
                          <div className="space-y-4 mt-6">
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Training Programs</h4>
                              <p className="text-sm text-muted-foreground">
                                Comprehensive training programs for new advisors and continuing education for 
                                experienced professionals, including technical skills, business development, 
                                and client relationship management.
                              </p>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Advisor Coaching</h4>
                              <p className="text-sm text-muted-foreground">
                                One-on-one coaching programs with industry veterans to help advisors optimize 
                                their practice, improve efficiency, and accelerate growth.
                              </p>
                            </div>
                            
                            <div className="border border-border rounded-md p-4">
                              <h4 className="font-medium mb-2">Professional Development</h4>
                              <p className="text-sm text-muted-foreground">
                                Support for professional designations, advanced degrees, and specialized 
                                certifications through educational assistance programs and study resources.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div>
                  {/* Platform Features Card */}
                  <Card className="mb-8">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="text-primary mr-2 h-5 w-5" />
                        Platform Highlights
                      </h3>
                      
                      <div className="space-y-3">
                        {firm.platformFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                  
                  {/* Advisor Review Card */}
                  <Card className="mb-8 bg-primary/5 border-primary/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Star className="text-primary mr-2 h-5 w-5" />
                        Advisor Perspective
                      </h3>
                      
                      <div className="space-y-4">
                        <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                          "The technology platform at {firm.firm} has been a significant upgrade from my previous firm. 
                          The financial planning tools and client portal have helped me deliver a more comprehensive 
                          and personalized experience to my clients."
                        </blockquote>
                        <p className="text-sm font-medium">
                          — Senior Advisor, transitioned in 2023
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Platform Comparison Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Compare Platforms</h3>
                      <p className="text-muted-foreground mb-6">
                        Considering multiple firms? Use our platform comparison tool to see how they stack up.
                      </p>
                      <Button className="w-full">
                        Compare Platforms
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Transition Process Tab */}
            <TabsContent value="transition" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="mb-8">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Transition Process</h2>
                      <p className="mb-8 text-muted-foreground">
                        {firm.transitionProcess.description}
                      </p>
                      
                      <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-border" aria-hidden="true"></div>
                        
                        <div className="space-y-12">
                          {firm.transitionProcess.steps.map((step, index) => (
                            <div key={index} className="relative flex items-start">
                              <div className="absolute left-0 top-0 flex items-center justify-center w-16 h-16">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="pl-20">
                                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Advisor Experiences</h2>
                      
                      <div className="space-y-8">
                        <div className="p-6 border border-border rounded-lg">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center text-white mr-4">
                              JD
                            </div>
                            <div>
                              <h3 className="font-medium">John Davidson</h3>
                              <p className="text-sm text-muted-foreground">
                                $2.5M Producer, Transitioned in 2023
                              </p>
                            </div>
                          </div>
                          <blockquote className="text-muted-foreground mb-4">
                            "My transition to {firm.firm} was remarkably smooth. The transition team was 
                            with me every step of the way, and we were able to move over 85% of client assets 
                            within 60 days. The technology onboarding was comprehensive and gave me everything 
                            I needed to hit the ground running."
                          </blockquote>
                          <div className="pt-4 border-t border-border">
                            <div className="text-sm">
                              <div className="flex justify-between mb-2">
                                <span>Asset Transfer Rate</span>
                                <span className="font-medium">85% in 60 days</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span>Transition Satisfaction</span>
                                <span className="font-medium">4.8/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Post-Move Production</span>
                                <span className="font-medium">110% of pre-transition</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 border border-border rounded-lg">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center text-white mr-4">
                              SL
                            </div>
                            <div>
                              <h3 className="font-medium">Sarah Liu</h3>
                              <p className="text-sm text-muted-foreground">
                                $1.8M Producer, Transitioned in 2022
                              </p>
                            </div>
                          </div>
                          <blockquote className="text-muted-foreground mb-4">
                            "The transition process was well-organized and methodical. The documentation and 
                            client communication templates were extremely helpful, and having dedicated operational 
                            support made a significant difference. I appreciated the comprehensive training on 
                            the new platform during the pre-transition phase."
                          </blockquote>
                          <div className="pt-4 border-t border-border">
                            <div className="text-sm">
                              <div className="flex justify-between mb-2">
                                <span>Asset Transfer Rate</span>
                                <span className="font-medium">90% in 90 days</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span>Transition Satisfaction</span>
                                <span className="font-medium">4.5/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Post-Move Production</span>
                                <span className="font-medium">105% of pre-transition</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div>
                  {/* Transition Success Metrics Card */}
                  <Card className="mb-8">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="text-primary mr-2 h-5 w-5" />
                        Transition Success Metrics
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Average Asset Transfer Rate</span>
                            <span className="text-sm text-muted-foreground">82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Client Retention (2 years)</span>
                            <span className="text-sm text-muted-foreground">93%</span>
                          </div>
                          <Progress value={93} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Production Recovery</span>
                            <span className="text-sm text-muted-foreground">96%</span>
                          </div>
                          <Progress value={96} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Advisor Satisfaction</span>
                            <span className="text-sm text-muted-foreground">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="mt-6 text-xs text-muted-foreground">
                        <i>Based on advisor transitions to {firm.firm} over the last 24 months.</i>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Transition Team Card */}
                  <Card className="mb-8 bg-primary/5 border-primary/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="text-primary mr-2 h-5 w-5" />
                        Transition Support Team
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                            <Briefcase className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Transition Manager</h4>
                            <p className="text-xs text-muted-foreground">
                              Dedicated point person who oversees the entire transition process
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Documentation Specialist</h4>
                            <p className="text-xs text-muted-foreground">
                              Handles all paperwork and ensures regulatory compliance
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                            <Laptop className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Technology Consultant</h4>
                            <p className="text-xs text-muted-foreground">
                              Provides system setup, data migration, and platform training
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                            <Handshake className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Client Transition Specialist</h4>
                            <p className="text-xs text-muted-foreground">
                              Facilitates client account transfers and relationship transitions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Transition Readiness Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Transition Readiness</h3>
                      <p className="text-muted-foreground mb-6">
                        Assess your practice's readiness for a transition and get personalized recommendations.
                      </p>
                      <Button className="w-full">
                        Take Readiness Assessment
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* News Tab */}
            <TabsContent value="news" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <FirmNews 
                    firmName={firm.firm} 
                    recentNews={getNewsForFirm(firm.id)}
                  />
                </div>
                
                <div className="space-y-8">
                  {/* Related Content Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Related Content</h3>
                      <div className="space-y-4">
                        <div className="flex items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                          <Briefcase className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm">{firm.firm} Recruitment Strategy Analysis</span>
                        </div>
                        <div className="flex items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                          <Users className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm">Top {firm.firm} Teams by AUM</span>
                        </div>
                        <div className="flex items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                          <TrendingUp className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm">{firm.firm} Growth Projection Report</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Subscribe Card */}
                  <Card className="bg-primary/5 border-primary/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
                      <p className="text-muted-foreground mb-4">
                        Subscribe to receive alerts about {firm.firm} news, deal updates, and advisor movements.
                      </p>
                      <Button className="w-full">
                        Subscribe to Updates
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {firm.faq.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </Card>
                </div>
                
                <div>
                  {/* Ask a Question Card */}
                  <Card className="mb-8">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Have More Questions?</h3>
                      <p className="text-muted-foreground mb-6">
                        Connect with a transition specialist to get personalized answers about {firm.firm}.
                      </p>
                      <Button className="w-full">
                        Ask a Question
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Download Guide Card */}
                  <Card className="mb-8 bg-primary/5 border-primary/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FileText className="text-primary mr-2 h-5 w-5" />
                        Comprehensive Guide
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Download our detailed transition guide for {firm.firm} with insider information and tips.
                      </p>
                      <Button variant="default" className="w-full">
                        Download Guide
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Related Resources Card */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Related Resources</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                            <Play className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Advisor Webinar</h4>
                            <p className="text-xs text-muted-foreground">
                              Transition Success Stories: {firm.firm} Edition
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">White Paper</h4>
                            <p className="text-xs text-muted-foreground">
                              Analyzing {firm.firm}'s Compensation Structure
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Industry Report</h4>
                            <p className="text-xs text-muted-foreground">
                              {firm.firm} vs. Competitors: Platform Comparison
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* CTA Section */}
      <section className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Ready to Compare {firm.firm} With Other Firms?</h2>
              <p className="text-muted-foreground">
                Use our AI-powered calculator to get a personalized analysis of how {firm.firm}'s deal 
                structure compares to other options based on your unique practice metrics.
              </p>
            </div>
            <div className="lg:w-1/3 flex justify-end">
              <Link href="/calculator">
                <Button size="lg">
                  Compare Transition Packages
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}