import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Plus,
  Star,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import PracticeDetailDialog, { Practice, Advisor } from "@/components/marketplace/practice-detail-dialog";
import { ListPracticeDialog } from "@/components/marketplace/list-practice-dialog";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function MarketplacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [listPracticeDialogOpen, setListPracticeDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Filter state
  const [practiceTypeFilter, setPracticeTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [aumFilter, setAumFilter] = useState("all");

  // Fetch practices with React Query
  const { data: practices = [], isLoading: practicesLoading } = useQuery({
    queryKey: ['/api/practices'],
    queryFn: async () => {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 1,
          title: "Established RIA - Atlanta Metropolitan Area",
          location: "Atlanta, GA",
          aum: "$120M",
          revenue: "$1.1M",
          clients: 112,
          type: "Full Practice Sale",
          status: "Active",
          description: "Established fee-based RIA with 25+ year track record. Primarily serves high-net-worth clients with minimum $500k accounts. Strong recurring revenue with 90% fee-based model.",
          tags: ["Fee-Based", "HNW Clients", "Established"],
          highlighted: true
        },
        {
          id: 2,
          title: "Independent Broker-Dealer Practice",
          location: "Dallas, TX",
          aum: "$85M",
          revenue: "$750K",
          clients: 175,
          type: "Succession Planning",
          status: "Active",
          description: "Independent practice looking for succession partner over 3-5 year horizon. Mix of advisory and commission business. Owner willing to stay on for smooth transition.",
          tags: ["Hybrid Revenue", "Flexible Terms"]
        },
        {
          id: 3,
          title: "Fee-Only Financial Planning Practice",
          location: "Seattle, WA",
          aum: "$45M",
          revenue: "$500K",
          clients: 94,
          type: "Full Practice Sale",
          status: "Active",
          description: "Fee-only planning practice with focus on tech professionals. Established 12 years with strong client retention and growth. Owner retiring but available for transition.",
          tags: ["Fee-Only", "Tech Niche", "High Retention"]
        },
        {
          id: 4,
          title: "Partial Book Sale - High Net Worth Focus",
          location: "Boston, MA",
          aum: "$90M",
          revenue: "$820K",
          clients: 42,
          type: "Partial Book Sale",
          status: "Active",
          description: "Advisor looking to sell portion of book representing $90M AUM. Focus on high-net-worth clients with average account $2.1M. Fee-based with minimal transactional business.",
          tags: ["HNW Focus", "Fee-Based", "Large Accounts"],
          highlighted: true
        },
        {
          id: 5,
          title: "Insurance-Focused Practice",
          location: "Chicago, IL",
          aum: "$35M",
          revenue: "$580K",
          clients: 215,
          type: "Full Practice Sale",
          status: "Active",
          description: "Insurance-focused practice with growing advisory business. Strong recurring revenue from life and LTC policies. Owner retiring after 30+ years in business.",
          tags: ["Insurance", "LTC Specialty", "Recurring Revenue"]
        },
        {
          id: 6,
          title: "Merger Opportunity - $200M AUM",
          location: "Phoenix, AZ",
          aum: "$200M",
          revenue: "$1.8M",
          clients: 160,
          type: "Merger Opportunity",
          status: "Active",
          description: "Established wealth management firm seeking merger partner. Strong operational infrastructure and compliance framework. Looking for complementary firm with similar culture.",
          tags: ["Merger Ready", "Strong Infrastructure"]
        },
        {
          id: 7,
          title: "Retirement Planning Specialist",
          location: "Denver, CO",
          aum: "$110M",
          revenue: "$980K",
          clients: 125,
          type: "Succession Planning",
          status: "Active",
          description: "Retirement planning focused practice with strong client base of pre-retirees and retirees. Seeking succession partner for 5+ year transition. Well-established systems and processes.",
          tags: ["Retirement Focus", "Documented Processes"]
        },
        {
          id: 8,
          title: "Fast-Growing RIA - 20% Annual Growth",
          location: "Austin, TX",
          aum: "$75M",
          revenue: "$710K",
          clients: 88,
          type: "Full Practice Sale",
          status: "Active",
          description: "Fast-growing RIA with 20%+ annual growth over past 3 years. Young client base with high income earners. Technology-forward with fully digital client experience.",
          tags: ["High Growth", "Young Clients", "Digital Focus"],
          highlighted: true
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Check if user is viewing on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  // If there's an ID in the URL, open that practice's detail
  useEffect(() => {
    if (id) {
      const practiceId = parseInt(id, 10);
      const practice = practices.find(p => p.id === practiceId);
      
      if (practice) {
        setSelectedPractice(practice);
        setDetailDialogOpen(true);
      }
    }
  }, [id, practices]);
  
  // Memoize event handlers to prevent unnecessary re-renders
  const handleOpenPracticeDetails = useCallback((practice: Practice) => {
    setSelectedPractice(practice);
    setSelectedAdvisor(null);
    setDetailDialogOpen(true);
  }, []);
  
  const handleCloseDetails = useCallback(() => {
    setDetailDialogOpen(false);
  }, []);
  
  const handleOpenListPracticeDialog = useCallback(() => {
    setListPracticeDialogOpen(true);
  }, []);
  
  const handleCloseListPracticeDialog = useCallback(() => {
    setListPracticeDialogOpen(false);
  }, []);
  
  // Get current date to make dates dynamic
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Function to generate random date between Jan 2019 and last month
  const getRandomSaleDate = () => {
    const start = new Date(2019, 0, 1);
    const end = lastMonth;
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${monthNames[randomDate.getMonth()]} ${randomDate.getFullYear()}`;
  };
  
  // Filter practices based on selected filters - memoized to avoid recalculation on every render
  const filteredPractices = useMemo(() => practices.filter((practice) => {
    // Practice type filter
    if (practiceTypeFilter !== "all") {
      // Map filter values to actual types in the data
      const typeMap: Record<string, string> = {
        "full": "Full Practice Sale",
        "partial": "Partial Book Sale",
        "succession": "Succession Planning",
        "merger": "Merger Opportunity"
      };
      
      if (practiceTypeFilter in typeMap && practice.type !== typeMap[practiceTypeFilter]) {
        return false;
      }
    }
    
    // Location filter
    if (locationFilter !== "all") {
      // Extract state code (like GA, FL, etc.) and match with region
      const statePart = practice.location.split(', ')[1];
      
      // Map state codes to regions
      const regionMap: Record<string, string[]> = {
        "northeast": ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
        "southeast": ["DE", "MD", "VA", "WV", "KY", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "AR", "LA"],
        "midwest": ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
        "southwest": ["TX", "OK", "NM", "AZ"],
        "west": ["CO", "WY", "MT", "ID", "WA", "OR", "UT", "NV", "CA", "AK", "HI"]
      };
      
      if (locationFilter in regionMap && !regionMap[locationFilter].includes(statePart)) {
        return false;
      }
    }
    
    // AUM filter
    if (aumFilter !== "all") {
      // Extract numeric value from AUM string (e.g., "$150M" → 150)
      const aumValue = parseInt(practice.aum.replace(/\$|M/g, ''));
      
      switch (aumFilter) {
        case "under50":
          if (aumValue >= 50) return false;
          break;
        case "50to100":
          if (aumValue < 50 || aumValue > 100) return false;
          break;
        case "100to250":
          if (aumValue < 100 || aumValue > 250) return false;
          break;
        case "250to500":
          if (aumValue < 250 || aumValue > 500) return false;
          break;
        case "over500":
          if (aumValue <= 500) return false;
          break;
      }
    }
    
    return true;
  }), [practices, practiceTypeFilter, locationFilter, aumFilter]); // Only recalculate when these dependencies change
  
  // Sample sold listings data with randomized dates
  const soldPractices = [
    {
      id: 101,
      title: "Mid-Size RIA - Minneapolis Metro",
      location: "Minneapolis, MN",
      aum: "$150M",
      revenue: "$1.4M",
      clients: 165,
      type: "Full Practice Sale",
      saleDate: getRandomSaleDate(),
      description: "Mid-size RIA serving mass affluent and HNW clients. Practice sold to regional acquirer expanding Midwest footprint."
    },
    {
      id: 102,
      title: "Fee-Only Planning Practice",
      location: "Portland, ME",
      aum: "$65M",
      revenue: "$600K",
      clients: 92,
      type: "Full Practice Sale",
      saleDate: getRandomSaleDate(),
      description: "Fee-only planning practice with strong client retention and diverse revenue sources. Sold to larger independent firm seeking east coast expansion."
    },
    {
      id: 103,
      title: "Experienced Advisor Book of Business",
      location: "Phoenix, AZ",
      aum: "$42M",
      revenue: "$380K",
      clients: 72,
      type: "Partial Sale",
      saleDate: getRandomSaleDate(),
      description: "Long-time advisor partially retired by selling portion of book to junior advisor within existing firm. Structured as gradual transition with revenue sharing."
    },
    {
      id: 104,
      title: "Boutique Investment Management Firm",
      location: "San Francisco, CA",
      aum: "$210M",
      revenue: "$1.9M",
      clients: 135,
      type: "Full Acquisition",
      saleDate: getRandomSaleDate(),
      description: "Boutique investment management firm with proprietary strategies acquired by national RIA aggregator. Principals retained with earn-out structure."
    },
    {
      id: 105,
      title: "Insurance-Focused Advisory Practice",
      location: "Houston, TX",
      aum: "$38M",
      revenue: "$650K",
      clients: 190,
      type: "Full Sale",
      saleDate: getRandomSaleDate(),
      description: "Insurance-focused advisory practice with significant recurring revenue from life and LTC policies. Sold to local competitor seeking product expertise and client base."
    },
    {
      id: 106,
      title: "Multi-Office Regional Practice",
      location: "Denver, CO",
      aum: "$295M",
      revenue: "$2.3M",
      clients: 240,
      type: "Merger",
      saleDate: getRandomSaleDate(),
      description: "Multi-office regional practice merged with national firm. Structured as equity swap with leadership retention and rebranding of offices under national brand."
    },
    {
      id: 107,
      title: "Independent BD Representative",
      location: "Atlanta, GA",
      aum: "$88M",
      revenue: "$790K",
      clients: 105,
      type: "Succession Sale",
      saleDate: getRandomSaleDate(),
      description: "Independent BD representative with 25+ years experience completed succession sale to existing team member. Structured as 5-year buyout with client transition plan."
    },
    {
      id: 108,
      title: "Small RIA with Niche Focus",
      location: "Nashville, TN",
      aum: "$54M",
      revenue: "$490K",
      clients: 48,
      type: "Full Sale",
      saleDate: getRandomSaleDate(),
      description: "Small RIA with niche focus in medical professionals sold to larger firm seeking specialty expertise. Premium multiple achieved due to client demographics and growth potential."
    }
  ];
  
  // Sample advisor data
  const advisors = [
    {
      id: 1,
      name: "Michael Reynolds, CFP®",
      location: "Chicago, IL",
      experience: "15 years",
      certifications: ["CFP®", "CFA", "CIMA®"],
      aum: "$180M Current",
      targetAum: "$50M-$200M",
      type: "Looking to Acquire",
      status: "Active",
      description: "Experienced advisor with established Chicago practice seeking acquisition opportunities in Illinois or Wisconsin. Strong team and infrastructure in place to support larger client base.",
      tags: ["Acquisition Ready", "Strong Infrastructure", "Regional Focus"]
    },
    {
      id: 2,
      name: "Sarah Johnson, CPA, CFP®",
      location: "Boston, MA",
      experience: "8 years",
      certifications: ["CFP®", "CPA"],
      aum: "$45M Current",
      targetAum: "$20M-$60M",
      type: "Seeking Succession",
      status: "Active",
      description: "Tax-focused CFP® with established Boston practice seeking succession opportunity with retiring advisor. Strong tax planning expertise and existing relationships with CPAs and attorneys.",
      tags: ["Tax Expertise", "Succession Ready", "COI Relationships"]
    },
    {
      id: 3,
      name: "David Chen, CIMA®",
      location: "San Francisco, CA",
      experience: "12 years",
      certifications: ["CIMA®", "CFP®"],
      aum: "$120M Current",
      targetAum: "$30M-$150M",
      type: "Looking to Acquire",
      status: "Active",
      description: "Investment-focused advisor with established Bay Area practice seeking acquisition opportunities throughout California. Specialization in equity compensation planning and tech professionals.",
      tags: ["Investment Focus", "Tech Specialization", "California Based"]
    },
    {
      id: 4,
      name: "Regional Wealth Management Firm",
      location: "Multiple Northeast Locations",
      experience: "25+ years (firm)",
      certifications: ["Multiple on Staff"],
      aum: "$1.2B Current",
      targetAum: "$50M-$500M",
      type: "Active Acquirer",
      status: "Active",
      description: "Regional wealth management firm actively acquiring practices throughout the Northeast. Established transition program with proven success across multiple acquisitions. Competitive valuation multiples with flexible structures.",
      tags: ["Multiple Offices", "Established Buyer", "Competitive Multiples"]
    },
    {
      id: 5,
      name: "Independent Advisor Seeking Tuck-In",
      location: "Phoenix, AZ",
      aum: "$15M Current",
      targetAum: "$15M-$30M",
      experience: "10 years",
      type: "Tuck-In Opportunity",
      status: "Active",
      description: "Independent advisor with growing practice seeking smaller tuck-in acquisition to accelerate growth. Ideal match would be practice with similar investment philosophy focusing on passive strategies and financial planning.",
      tags: ["Passive Investing", "Planning Focus", "Smaller Practice"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      <main>
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary/70 bg-clip-text text-transparent animate-soft-bounce inline-block">
                Practice
              </span>{" "}
              <span className="animate-soft-bounce inline-block" style={{ animationDelay: "0.1s" }}>
                Listings
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
            >
              Browse available advisory practices for sale, from succession plans to full practice acquisitions.
              Filter listings based on geographic location, AUM, revenue, and practice type.
            </motion.p>
            
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6"
              >
                <Button 
                  onClick={handleOpenListPracticeDialog}
                  className="bg-primary hover:bg-primary/90 flex items-center shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit a Practice for Sale
                </Button>
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-8">
            {practicesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading practices...</p>
                </div>
              </div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold">Available Practices</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Showing {filteredPractices.length} of {practices.length} available practices</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap items-center gap-2 w-full md:w-auto"
                  >
                    <div className="w-full sm:w-auto">
                      <Select value={practiceTypeFilter} onValueChange={setPracticeTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
                          <SelectValue placeholder="Practice Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full">Full Practice Sale</SelectItem>
                          <SelectItem value="partial">Partial Book Sale</SelectItem>
                          <SelectItem value="succession">Succession Planning</SelectItem>
                          <SelectItem value="merger">Merger Opportunity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="northeast">Northeast</SelectItem>
                          <SelectItem value="southeast">Southeast</SelectItem>
                          <SelectItem value="midwest">Midwest</SelectItem>
                          <SelectItem value="southwest">Southwest</SelectItem>
                          <SelectItem value="west">West Coast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <Select value={aumFilter} onValueChange={setAumFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
                          <SelectValue placeholder="AUM Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any AUM</SelectItem>
                          <SelectItem value="under50">Under $50M</SelectItem>
                          <SelectItem value="50to100">$50M - $100M</SelectItem>
                          <SelectItem value="100to250">$100M - $250M</SelectItem>
                          <SelectItem value="250to500">$250M - $500M</SelectItem>
                          <SelectItem value="over500">Over $500M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="flex flex-wrap justify-between items-center gap-3"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <h2 className="text-lg sm:text-xl font-semibold">Featured Opportunities</h2>
                    </motion.div>
                    {user && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          onClick={handleOpenListPracticeDialog} 
                          className="bg-primary hover:bg-primary/90 text-xs sm:text-sm whitespace-nowrap">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Submit a Practice for Sale
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
              
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredPractices.slice(0, isMobile ? 10 : filteredPractices.length).map((practice, index) => (
                      <div
                        key={practice.id}
                        className="animate-fadeIn"
                      >
                        <Card 
                          className={`${practice.highlighted ? "border-2 border-primary shadow-lg bg-primary/5 scale-[1.02]" : ""} cursor-pointer transition-all hover:shadow-md`}
                          onClick={() => handleOpenPracticeDetails(practice)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <div className="pr-2">
                                <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2">{practice.title}</CardTitle>
                                <CardDescription className="flex items-center mt-1 text-xs sm:text-sm">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{practice.location}</span>
                                </CardDescription>
                              </div>
                              {practice.highlighted && (
                                <Badge variant="default" className="bg-primary text-white text-xs px-2 py-0.5 h-fit whitespace-nowrap">
                                  <Star className="h-2.5 w-2.5 mr-1 fill-white flex-shrink-0" /> Featured
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                              <div>
                                <div className="text-xs sm:text-sm text-muted-foreground">AUM</div>
                                <div className="font-medium flex items-center text-sm sm:text-base">
                                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary flex-shrink-0" />
                                  <span className="truncate">{practice.aum}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Revenue</div>
                                <div className="font-medium flex items-center text-sm sm:text-base">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary flex-shrink-0" />
                                  <span className="truncate">{practice.revenue}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Clients</div>
                                <div className="font-medium flex items-center text-sm sm:text-base">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary flex-shrink-0" />
                                  <span className="truncate">{practice.clients}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Type</div>
                                <div className="font-medium flex items-center text-sm sm:text-base">
                                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary flex-shrink-0" />
                                  <span className="truncate">{practice.type}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{practice.description}</p>
                            
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-4">
                              {practice.tags && practice.tags.length > 0 ? practice.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs px-1.5 py-0 h-5 sm:h-auto">{tag}</Badge>
                              )) : null}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end pt-0 sm:pt-2">
                            <Button onClick={() => handleOpenPracticeDetails(practice)} 
                              className="text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4">
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center pt-4 pb-8">
                    <Button variant="outline" className="text-xs sm:text-sm h-8 sm:h-10">
                      Load More Listings
                    </Button>
                  </div>
                </div>
                
                {/* Sold Practices Section */}
                <div className="pt-8 border-t">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-6"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold">Recently Sold Practices</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Successfully completed transactions in the advisory marketplace</p>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {soldPractices.slice(0, isMobile ? 7 : soldPractices.length).map((practice, index) => (
                      <div
                        key={practice.id}
                        className="animate-fadeIn"
                      >
                        <Card className="cursor-default h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div>
                              <CardTitle className="text-base sm:text-lg line-clamp-2">{practice.title}</CardTitle>
                              <div className="flex justify-between items-center flex-wrap gap-1">
                                <CardDescription className="flex items-center mt-1 text-xs sm:text-sm truncate max-w-[50%]">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{practice.location}</span>
                                </CardDescription>
                                <Badge variant="outline" className="text-xs px-1.5">
                                  {practice.saleDate}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">AUM</div>
                                <div className="font-medium text-xs sm:text-sm truncate">{practice.aum}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Revenue</div>
                                <div className="font-medium text-xs sm:text-sm truncate">{practice.revenue}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Clients</div>
                                <div className="font-medium text-xs sm:text-sm truncate">{practice.clients}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Type</div>
                                <div className="font-medium text-xs sm:text-sm truncate">{practice.type}</div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{practice.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Detail dialog for practices and advisors */}
          <PracticeDetailDialog
            practice={selectedPractice}
            advisor={selectedAdvisor}
            isOpen={detailDialogOpen}
            onClose={handleCloseDetails}
          />
          
          {/* List your practice dialog */}
          <ListPracticeDialog 
            isOpen={listPracticeDialogOpen}
            onClose={handleCloseListPracticeDialog}
          />
        </div>
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}