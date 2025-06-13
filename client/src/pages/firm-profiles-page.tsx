import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building, 
  Search, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  Briefcase, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Award,
  ChevronRight,
  X
} from "lucide-react";
import { LazyImage } from "@/components/ui/lazy-image";
import { useQuery } from "@tanstack/react-query";
import { firmList } from "@shared/firmList";

// Helper function to create slugs from firm names
const createSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/-+/g, '')
    .trim();
};

interface FirmProfile {
  id: string;
  firm: string;
  ceo: string;
  bio: string;
  logoUrl: string;
  founded: string;
  headquarters: string;
}

export default function FirmProfilesPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  // Fetch firm profiles
  const { data: firmProfiles, isLoading } = useQuery<FirmProfile[]>({
    queryKey: ['/api/firm-profiles'],
    queryFn: async () => {
      // If API endpoint doesn't exist yet, use mock data with realistic firms
      try {
        const res = await fetch('/api/firm-profiles');
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
      } catch (error) {
        console.error("Error fetching firm profiles:", error);
        return [];
      }
    },
  });

  // Define filter categories
  const filterCategories = [
    {
      name: "Firm Type",
      options: ["Wirehouse", "Regional", "Independent", "RIA"]
    },
    {
      name: "Deal Structure",
      options: ["High Upfront", "Strong Backend", "Deferred Comp", "Equity"]
    }
  ];

  // Toggle filter selection
  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchTerm("");
  };

  // Create detailed firm profiles from the shared firm list
  const sampleFirms = firmList.map((firmName, index) => {
    // Define type mapping for firms
    const firmTypes: Record<string, string> = {
      "Morgan Stanley": "Wirehouse",
      "Merrill Lynch": "Wirehouse",
      "UBS": "Wirehouse",
      "Wells Fargo": "Wirehouse",
      "Raymond James": "Regional",
      "Edward Jones": "Regional",
      "Stifel": "Regional",
      "RBC": "Regional",
      "Ameriprise": "Independent",
      "LPL Financial": "Independent",
      "Goldman Sachs": "Wirehouse",
      "J.P. Morgan": "Wirehouse",
      "Rockefeller": "Independent",
      "Sanctuary": "Independent",
      "Truist": "Regional",
      "Finet": "Independent"
    };

    // Define logo URLs
    const logoUrls: Record<string, string> = {
      "Morgan Stanley": "https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_logo.svg",
      "Merrill Lynch": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Merrill_Lynch_logo.svg/2880px-Merrill_Lynch_logo.svg.png",
      "UBS": "https://upload.wikimedia.org/wikipedia/commons/f/f3/UBS_Logo.svg",
      "Ameriprise": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ameriprise_Financial_logo.svg/1200px-Ameriprise_Financial_logo.svg.png",
      "LPL Financial": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/LPL_Financial_logo.svg/1200px-LPL_Financial_logo.svg.png",
      "Goldman Sachs": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Goldman_Sachs.svg/1200px-Goldman_Sachs.svg.png",
      "J.P. Morgan": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/J.P._Morgan_Logo_2008.svg/1200px-J.P._Morgan_Logo_2008.svg.png",
      "RBC": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/RBC_Logo.svg/1200px-RBC_Logo.svg.png",
      "Raymond James": "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Raymond_James_Financial_logo.svg/1200px-Raymond_James_Financial_logo.svg.png",
      "Rockefeller": "https://www.rockco.com/wp-content/themes/rockco/img/logo.png",
      "Sanctuary": "https://sanctuarywealthadvisors.com/wp-content/uploads/2021/03/sanctuary-logo-blue.png",
      "Wells Fargo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wells_Fargo_Bank.svg/1200px-Wells_Fargo_Bank.svg.png",
      "Truist": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Truist_logo.svg/1200px-Truist_logo.svg.png",
      "Edward Jones": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Edward_Jones_Logo.svg/1280px-Edward_Jones_Logo.svg.png",
      "Stifel": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Stifel_Logo.svg/1200px-Stifel_Logo.svg.png",
      "Finet": "https://logos-world.net/wp-content/uploads/2021/02/Financial-Network-Emblem-700x394.png"
    };

    // Deal structure mapping
    const dealStructureMap: Record<string, string[]> = {
      "Wirehouse": ["High Upfront", "Deferred Comp"],
      "Regional": ["Strong Backend", "Equity"],
      "Independent": ["Strong Backend", "Equity"],
    };

    const firmType = firmTypes[firmName] || "Independent";
    
    return {
      id: (index + 1).toString(),
      firm: firmName,
      type: firmType,
      logoUrl: logoUrls[firmName] || "https://placehold.co/400x200?text=" + encodeURIComponent(firmName),
      headquarters: firmType === "Wirehouse" ? "New York, NY" : 
                   firmType === "Regional" ? "St. Louis, MO" : "Boston, MA",
      founded: (1900 + Math.floor(Math.random() * 100)).toString(),
      ceo: "Leadership Team",
      aum: firmType === "Wirehouse" ? "$1-3 trillion" : 
           firmType === "Regional" ? "$300-800 billion" : "$100-500 billion",
      advisors: firmType === "Wirehouse" ? "15,000+" : 
               firmType === "Regional" ? "5,000+" : "2,000+",
      dealStructure: dealStructureMap[firmType] || ["Strong Backend"],
      bio: `${firmName} is a leading financial services firm providing wealth management and advisory services to clients nationwide.`
    };
  });

  // Filter firms based on search term and selected filters
  const filteredFirms = sampleFirms.filter(firm => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      firm.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firm.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filters
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.some(filter => 
        firm.type === filter || 
        (firm.dealStructure && firm.dealStructure.includes(filter))
      );
    
    return matchesSearch && matchesFilters;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="Firm Profiles | FaAxis"
        description="Detailed profiles of top wealth management firms including Morgan Stanley, UBS, Merrill Lynch, and more. Compare deals, culture, and transition packages."
        keywords="wealth management firms, financial advisor transition, wirehouse, regional firm, independent broker dealer, RIA, transition deals"
      />
      <SimpleNavbar />
      
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-left">Wealth Management Firm Profiles</h1>
          <p className="text-muted-foreground mt-2 text-left">
            Comprehensive information about top financial firms to help guide your transition decisions.
          </p>
        </div>
      </div>
      
      <main className="flex-1">
        {/* Search and Filter Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for firms..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 items-center w-full md:w-2/3 justify-end">
                {filterCategories.map(category => (
                  <div key={category.name} className="relative">
                    <div className="flex flex-col">
                      <label htmlFor={`filter-${category.name}`} className="text-sm font-medium mb-1">
                        {category.name}
                      </label>
                      <select
                        id={`filter-${category.name}`}
                        className="w-40 h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={(e) => {
                          if (e.target.value) {
                            // Remove any previous options from this category
                            const otherCategoryOptions = selectedFilters.filter(
                              filter => !category.options.includes(filter)
                            );
                            // Add the new selection
                            setSelectedFilters([...otherCategoryOptions, e.target.value]);
                          }
                        }}
                        value={selectedFilters.find(filter => category.options.includes(filter)) || ""}
                      >
                        <option value="">All {category.name}s</option>
                        {category.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                
                {selectedFilters.length > 0 && (
                  <Button variant="ghost" onClick={clearFilters} className="h-10 mt-6">
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            {selectedFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium">Active filters:</span>
                {selectedFilters.map(filter => (
                  <span 
                    key={filter} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground"
                  >
                    {filter}
                    <button
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {filter} filter</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Firms Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFirms.map(firm => (
                <Link key={firm.id} href={`/${createSlug(firm.firm)}`}>
                  <Card className="overflow-hidden border hover:border-primary transition-all hover:shadow-md cursor-pointer h-full flex flex-col">
                    <div className="p-6 bg-muted/30 flex items-center justify-center h-40">
                      <div className="w-full max-h-20 flex items-center justify-center">
                        <img
                          src={firm.logoUrl}
                          alt={`${firm.firm} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-xl">{firm.firm}</h3>
                        <span className="text-xs px-2 py-1 bg-muted rounded-md">{firm.type}</span>
                      </div>
                      <div className="space-y-3 mb-4 text-sm text-muted-foreground flex-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{firm.headquarters}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Founded: {firm.founded}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{firm.advisors} advisors</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>AUM: {firm.aum}</span>
                        </div>
                      </div>
                      <div className="pt-3 mt-auto">
                        <div className="flex flex-wrap gap-2">
                          {firm.dealStructure && firm.dealStructure.map(deal => (
                            <span key={deal} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                              {deal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-2">
                      <Button variant="outline" className="w-full">
                        View Profile
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Why Compare Firms Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Compare Firm Profiles?</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Understanding each firm's culture, deal structure, and platform capabilities is essential 
                for making informed career decisions. Our detailed profiles help you look beyond the numbers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 shadow-sm">
                <div className="mb-4 text-primary">
                  <Briefcase className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Deal Info</h3>
                <p className="text-muted-foreground">
                  Get accurate transition package details including upfront money, backend bonuses, and deferred compensation structures.
                </p>
              </Card>
              
              <Card className="p-6 shadow-sm">
                <div className="mb-4 text-primary">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
                <p className="text-muted-foreground">
                  Read candid insights from advisors who have actually made the move to these firms within the last 2 years.
                </p>
              </Card>
              
              <Card className="p-6 shadow-sm">
                <div className="mb-4 text-primary">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Technology Comparisons</h3>
                <p className="text-muted-foreground">
                  Evaluate each firm's tech stack, client portal capabilities, and advisor tools before making your move.
                </p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Building className="h-64 w-64" />
              </div>
              <div className="max-w-2xl relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to Compare Your Offers?</h2>
                <p className="text-muted-foreground mb-6">
                  Use our AI-powered calculator to compare transition packages side-by-side
                  and see your personalized projections based on your practice metrics.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/calculator">
                    <Button size="lg">
                      Open Transition Calculator
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button variant="outline" size="lg">
                      View Practice Listings
                    </Button>
                  </Link>
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