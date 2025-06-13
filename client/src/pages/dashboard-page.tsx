import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Building2, CalendarDays, Edit2, LogOut, Settings, 
  User, Users, BarChart3, Home, FileText, ChevronLeft, ChevronRight,
  Calculator, CreditCard, Lock as LockIcon, X
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, SheetClose, SheetContent, SheetDescription, 
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFirmDeals, useFirmProfiles } from "@/lib/airtable-service";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import NotificationPreferences from "@/components/dashboard/notification-preferences";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/format-utils";
import { SavedCalculations } from "@/components/dashboard/saved-calculations";
import { EmbeddedCalculator } from "@/components/dashboard/embedded-calculator";
import { UpgradeSection } from "@/components/dashboard/upgrade-section";

export default function DashboardPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const { data: firmDeals, isLoading: isLoadingDeals } = useFirmDeals();
  const { data: firmProfiles, isLoading: isLoadingProfiles } = useFirmProfiles();
  const { toast } = useToast();
  
  // Ref for profiles scrolling container
  const profilesContainerRef = useRef<HTMLDivElement>(null);
  
  // State for randomized profiles
  const [randomizedProfiles, setRandomizedProfiles] = useState<any[]>([]);
  
  // Function to randomize firm profiles
  const randomizeFirmProfiles = useCallback(() => {
    if (!firmProfiles) return;
    
    // Create a copy of firm profiles and shuffle them
    const shuffled = [...firmProfiles].sort(() => Math.random() - 0.5);
    setRandomizedProfiles(shuffled);
  }, [firmProfiles]);
  
  // Randomize profiles when firm profiles data changes
  useEffect(() => {
    randomizeFirmProfiles();
  }, [firmProfiles, randomizeFirmProfiles]);
  
  // Remove TidyCal script effect as we're using iframes directly
  
  // Function to scroll profiles left/right
  const scrollProfiles = (direction: 'left' | 'right') => {
    if (!profilesContainerRef.current) return;
    
    const container = profilesContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Profile edit state with properly formatted values
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.username || "",
    phone: user?.phone || "",
    city: user?.city || "",
    state: user?.state || "",
    firm: user?.firm || "",
    aum: user?.aum ? formatNumberWithCommas(user.aum) : "",
    revenue: user?.revenue ? formatNumberWithCommas(user.revenue) : "",
    feeBasedPercentage: user?.feeBasedPercentage || "",
  });
  
  // For backward compatibility, calculate a fullName from firstName and lastName
  const getFullName = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile.firstName) {
      return profile.firstName;
    } else if (profile.lastName) {
      return profile.lastName;
    } else {
      // We've migrated away from fullName, but check if it exists for backward compatibility
      // For TypeScript, we need to use a type assertion here
      const userAny = user as any;
      if (userAny && userAny.fullName) {
        return userAny.fullName;
      }
    }
    return "";
  };
  
  // Update profile formatting when user data changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.username || prev.email,
        phone: user.phone || prev.phone,
        city: user.city || prev.city,
        state: user.state || prev.state,
        firm: user.firm || prev.firm,
        aum: user.aum ? formatNumberWithCommas(user.aum) : prev.aum,
        revenue: user.revenue ? formatNumberWithCommas(user.revenue) : prev.revenue,
        feeBasedPercentage: user.feeBasedPercentage || prev.feeBasedPercentage,
      }));
    }
  }, [user]);
  
  // Practice filter state
  const [practiceFilters, setPracticeFilters] = useState({
    state: user?.state ? user.state : "all",
    practiceType: "all",
    aumSize: "all",
    clientType: "all",
    sortBy: "newest",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Apply special formatting for AUM and revenue fields
    if (name === 'aum' || name === 'revenue') {
      // Remove any commas from the input value
      const rawValue = value.replace(/,/g, '');
      
      // Validate that input only contains numbers
      if (!/^\d*$/.test(rawValue.replace(/\./g, ''))) {
        return; // Don't update if it contains non-numeric characters
      }
      
      // If it's empty or not a valid number, just store the value as is
      if (rawValue === '' || isNaN(parseFloat(rawValue))) {
        setProfile(prev => ({ ...prev, [name]: value }));
        return;
      }
      
      // Format the value with commas and store it
      const formatted = formatNumberWithCommas(rawValue);
      setProfile(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'feeBasedPercentage') {
      // Only allow numbers for fee-based percentage
      if (!/^\d*$/.test(value.replace(/\./g, ''))) {
        return; // Don't update if it contains non-numeric characters
      }
      setProfile(prev => ({ ...prev, [name]: value }));
    } else if (name === 'firstName' || name === 'lastName') {
      // Don't allow numbers in name fields
      if (/\d/.test(value)) {
        return; // Don't update if it contains numbers
      }
      setProfile(prev => ({ ...prev, [name]: value }));
    } else if (name === 'phone') {
      // Only allow numbers, dashes, and parentheses in phone field
      if (!/^[0-9\-\(\)\s]*$/.test(value)) {
        return; // Don't update if it contains letters or other characters
      }
      setProfile(prev => ({ ...prev, [name]: value }));
    } else {
      // For other fields, just store the value directly
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSave = async () => {
    try {
      // Create a copy of the profile data to send to the API
      const profileToSubmit = { ...profile };
      
      // Clean and parse AUM and revenue
      if (profileToSubmit.aum) {
        // Remove commas but keep as string for API
        profileToSubmit.aum = profileToSubmit.aum.replace(/,/g, '');
      }
      
      if (profileToSubmit.revenue) {
        // Remove commas but keep as string for API
        profileToSubmit.revenue = profileToSubmit.revenue.replace(/,/g, '');
      }
      
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This is crucial for sending JWT cookies
        body: JSON.stringify(profileToSubmit),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Format AUM and revenue with commas for display
      if (updatedUser.aum) {
        updatedUser.aum = formatNumberWithCommas(updatedUser.aum);
      }
      
      if (updatedUser.revenue) {
        updatedUser.revenue = formatNumberWithCommas(updatedUser.revenue);
      }
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
      
      // Update user context with new data
      queryClient.setQueryData(["/api/user"], updatedUser);
      
      // Update the profile state with formatted values
      setProfile({
        ...profile,
        aum: formatNumberWithCommas(profileToSubmit.aum),
        revenue: formatNumberWithCommas(profileToSubmit.revenue),
      });
      
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock data for practices - this would come from your API in production
  const allPractices = [
    {
      id: 1,
      name: "Wealth Management Group",
      location: "Atlanta, GA",
      aum: "$135M",
      clientCount: 145,
      type: "Full Practice Sale",
      clientType: "Mass Affluent",
      yearlyRevenue: "$1.2M",
      listedDate: "2025-03-15",
    },
    {
      id: 2,
      name: "Financial Futures LLC",
      location: "Tampa, FL",
      aum: "$78M",
      clientCount: 92,
      type: "Partial Book Sale",
      clientType: "Retirees",
      yearlyRevenue: "$780K",
      listedDate: "2025-04-01",
    },
    {
      id: 3,
      name: "Retirement Planners Inc",
      location: "Charlotte, NC",
      aum: "$210M",
      clientCount: 180,
      type: "Succession Planning",
      clientType: "Retirees",
      yearlyRevenue: "$1.8M",
      listedDate: "2025-03-20",
    },
    {
      id: 4,
      name: "Legacy Wealth Partners",
      location: "Dallas, TX",
      aum: "$320M",
      clientCount: 210,
      type: "Full Practice Sale",
      clientType: "High Net Worth",
      yearlyRevenue: "$3.1M",
      listedDate: "2025-02-12",
    },
    {
      id: 5,
      name: "Harbor Financial Group",
      location: "Seattle, WA",
      aum: "$95M",
      clientCount: 110,
      type: "Merger Opportunity",
      clientType: "Tech Professionals",
      yearlyRevenue: "$950K",
      listedDate: "2025-04-10",
    },
    {
      id: 6,
      name: "Mountain View Advisors",
      location: "Denver, CO",
      aum: "$185M",
      clientCount: 155,
      type: "Succession Planning",
      clientType: "Business Owners",
      yearlyRevenue: "$1.7M",
      listedDate: "2025-03-25",
    },
    {
      id: 7,
      name: "Coastal Investment Strategies",
      location: "Miami, FL",
      aum: "$420M",
      clientCount: 280,
      type: "Full Practice Sale",
      clientType: "High Net Worth",
      yearlyRevenue: "$4.5M",
      listedDate: "2025-01-30",
    },
    {
      id: 8,
      name: "Midwest Planning Group",
      location: "Chicago, IL",
      aum: "$165M",
      clientCount: 135,
      type: "Partial Book Sale",
      clientType: "Mass Affluent",
      yearlyRevenue: "$1.4M",
      listedDate: "2025-03-05",
    },
    {
      id: 9,
      name: "Capital Advisors LLC",
      location: "Boston, MA",
      aum: "$275M",
      clientCount: 190,
      type: "Merger Opportunity",
      clientType: "Business Owners",
      yearlyRevenue: "$2.5M",
      listedDate: "2025-02-28",
    },
    {
      id: 10,
      name: "Desert Financial Services",
      location: "Phoenix, AZ",
      aum: "$110M",
      clientCount: 125,
      type: "Succession Planning",
      clientType: "Retirees",
      yearlyRevenue: "$1.1M",
      listedDate: "2025-04-05",
    },
    {
      id: 11,
      name: "Bay Area Wealth Advisors",
      location: "San Francisco, CA",
      aum: "$310M",
      clientCount: 150,
      type: "Full Practice Sale",
      clientType: "Tech Professionals",
      yearlyRevenue: "$3.2M",
      listedDate: "2025-02-15",
    },
    {
      id: 12,
      name: "Sunshine State Financial",
      location: "Orlando, FL",
      aum: "$95M",
      clientCount: 115,
      type: "Succession Planning",
      clientType: "Retirees",
      yearlyRevenue: "$920K",
      listedDate: "2025-03-28",
    },
    {
      id: 13,
      name: "Garden State Advisors",
      location: "Princeton, NJ",
      aum: "$175M",
      clientCount: 140,
      type: "Merger Opportunity",
      clientType: "Mass Affluent",
      yearlyRevenue: "$1.6M",
      listedDate: "2025-02-20",
    },
    {
      id: 14,
      name: "Empire Wealth Management",
      location: "New York, NY",
      aum: "$540M",
      clientCount: 220,
      type: "Full Practice Sale",
      clientType: "High Net Worth",
      yearlyRevenue: "$5.8M",
      listedDate: "2025-01-15",
    },
    {
      id: 15,
      name: "Rocky Mountain Financial",
      location: "Salt Lake City, UT",
      aum: "$125M",
      clientCount: 130,
      type: "Partial Book Sale",
      clientType: "Business Owners",
      yearlyRevenue: "$1.3M",
      listedDate: "2025-04-08",
    },
    {
      id: 16,
      name: "Pacific Northwest Planners",
      location: "Portland, OR",
      aum: "$210M",
      clientCount: 170,
      type: "Succession Planning",
      clientType: "Tech Professionals",
      yearlyRevenue: "$2.1M",
      listedDate: "2025-03-10",
    },
    {
      id: 17,
      name: "Southern Comfort Financial",
      location: "Nashville, TN",
      aum: "$140M",
      clientCount: 125,
      type: "Full Practice Sale",
      clientType: "Business Owners",
      yearlyRevenue: "$1.4M",
      listedDate: "2025-04-12",
    },
    {
      id: 18,
      name: "Great Lakes Advisors",
      location: "Detroit, MI",
      aum: "$180M",
      clientCount: 160,
      type: "Merger Opportunity",
      clientType: "Mass Affluent",
      yearlyRevenue: "$1.7M",
      listedDate: "2025-02-25",
    },
    {
      id: 19,
      name: "Keystone Financial Services",
      location: "Philadelphia, PA",
      aum: "$260M",
      clientCount: 195,
      type: "Succession Planning",
      clientType: "High Net Worth",
      yearlyRevenue: "$2.4M",
      listedDate: "2025-03-15",
    },
    {
      id: 20,
      name: "Golden State Wealth Advisors",
      location: "Los Angeles, CA",
      aum: "$390M",
      clientCount: 210,
      type: "Full Practice Sale",
      clientType: "High Net Worth",
      yearlyRevenue: "$4.1M",
      listedDate: "2025-02-10",
    },
  ];
  
  // Filter practices based on user state if set
  let filteredPractices = allPractices.filter(practice => {
    // State filter
    if (practiceFilters.state !== "all") {
      const practiceState = practice.location.split(', ')[1];
      if (practiceState !== practiceFilters.state) {
        return false;
      }
    }
    
    // Practice type filter
    if (practiceFilters.practiceType !== "all") {
      if (practice.type !== practiceFilters.practiceType) {
        return false;
      }
    }
    
    // Client type filter
    if (practiceFilters.clientType !== "all") {
      if (practice.clientType !== practiceFilters.clientType) {
        return false;
      }
    }
    
    // AUM size filter
    if (practiceFilters.aumSize !== "all") {
      const aumValue = parseInt(practice.aum.replace(/\$|M|K/g, ''));
      
      switch (practiceFilters.aumSize) {
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
  });
  
  // Sort practices
  filteredPractices = [...filteredPractices].sort((a, b) => {
    switch (practiceFilters.sortBy) {
      case "newest":
        return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
      case "oldest":
        return new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime();
      case "aumHigh":
        return parseInt(b.aum.replace(/\$|M|K/g, '')) - parseInt(a.aum.replace(/\$|M|K/g, ''));
      case "aumLow":
        return parseInt(a.aum.replace(/\$|M|K/g, '')) - parseInt(b.aum.replace(/\$|M|K/g, ''));
      case "revenueHigh":
        return parseInt(b.yearlyRevenue.replace(/\$|M|K/g, '')) - parseInt(a.yearlyRevenue.replace(/\$|M|K/g, ''));
      case "revenueLow":
        return parseInt(a.yearlyRevenue.replace(/\$|M|K/g, '')) - parseInt(b.yearlyRevenue.replace(/\$|M|K/g, ''));
      default:
        return 0;
    }
  });
  
  // Helper function to get practices in user's state
  const practicesInUserState = user.state 
    ? allPractices.filter(practice => practice.location.includes(user.state || ""))
    : [];

  // Empty array for meetings - no prebooked meetings
  const upcomingMeetings: Array<{id: number; title: string; with: string; date: string; time: string}> = [];

  return (
    <div className="flex h-screen bg-muted/20 dashboard-container">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card p-4 shadow-md">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User size={20} />
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{getFullName() || user.username}</h3>
            <p className="text-xs text-muted-foreground">{user.isPremium ? "Premium Member" : "Basic Member"}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("overview")}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("calculations")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            My Calculations
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("calculator")}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Quick Calculator
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("practices")}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Practices For Sale
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setActiveTab("meetings")}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
          {!user.isPremium && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-primary" 
              onClick={() => setActiveTab("upgrade")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
        </div>
        
        <div className="mt-auto pt-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background shadow-top z-50">
        <div className="flex justify-around p-2">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("overview")}>
            <Home size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("calculations")}>
            <BarChart3 size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("calculator")}>
            <Calculator size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("profile")}>
            <User size={20} />
          </Button>
          {!user.isPremium && (
            <Button variant="ghost" size="icon" onClick={() => setActiveTab("upgrade")}>
              <CreditCard size={20} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-background p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-2xl font-bold">Axis Dashboard</h1>
          <div className="flex items-center gap-2">
            {user.isPremium ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Premium</span>
            ) : (
              <a href="/checkout">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-primary to-[#4AFF91] hover:from-primary/90 hover:to-[#4AFF91]/90"
                >
                  Upgrade to Premium
                </Button>
              </a>
            )}
          </div>
        </header>
        
        <main className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="practices">Practices</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Removed top Calendar Card - will implement in another section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getFullName() || "Complete your profile"}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getFullName() ? "Your profile is set up" : "Click to complete your details"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => setActiveTab("profile")}
                    >
                      <Edit2 className="mr-2 h-3 w-3" />
                      Edit Profile
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Advisor Info Card - Displaying AUM and Revenue */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Your Advisor Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground text-sm">AUM:</div>
                        <div className="font-semibold">
                          {profile.aum ? (
                            <span className="text-primary">${profile.aum}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Not set</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground text-sm">Annual Revenue:</div>
                        <div className="font-semibold">
                          {profile.revenue ? (
                            <span className="text-primary">${profile.revenue}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Not set</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground text-sm">Fee-Based:</div>
                        <div className="font-semibold">
                          {profile.feeBasedPercentage ? (
                            <span>{profile.feeBasedPercentage}%</span>
                          ) : (
                            <span className="text-muted-foreground italic">Not set</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground text-sm">Current Firm:</div>
                        <div className="font-semibold">
                          {profile.firm ? (
                            <span>{profile.firm}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Not set</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => navigate("/calculator")}
                    >
                      <Calculator className="mr-2 h-3 w-3" />
                      Run New Calculation
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Latest Calculations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.isPremium ? "3 Completed" : "Basic Access"}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.isPremium 
                        ? "You've completed 3 detailed offer calculations" 
                        : "Upgrade to see detailed firm comparisons"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    {user.isPremium ? (
                      <a href="/detailed-calculator">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          <BarChart3 className="mr-2 h-3 w-3" />
                          New Calculation
                        </Button>
                      </a>
                    ) : (
                      <a href="/checkout">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          <BarChart3 className="mr-2 h-3 w-3" />
                          Upgrade to Premium
                        </Button>
                      </a>
                    )}
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nearby Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.state ? (
                      <>
                        <div className="text-2xl font-bold">{practicesInUserState.length} Available</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Practices for sale in {user.state}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{filteredPractices.length} Available</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Update your profile to see practices in your state
                        </p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        // Set initial filter to user's state if available
                        if (user.state) {
                          setPracticeFilters(prev => ({...prev, state: user.state || "all"}));
                        }
                        setActiveTab("practices");
                      }}
                    >
                      <Building2 className="mr-2 h-3 w-3" />
                      View Practices
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Meetings</CardTitle>
                    <CardDescription>Your scheduled consultations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingMeetings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingMeetings.map(meeting => (
                          <div key={meeting.id} className="flex justify-between items-start border-b pb-3">
                            <div>
                              <h4 className="font-medium">{meeting.title}</h4>
                              <p className="text-sm text-muted-foreground">{meeting.with}</p>
                              <p className="text-xs mt-1">{meeting.date} at {meeting.time}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <CalendarDays className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No meetings scheduled</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setActiveTab("meetings")}
                        >
                          Schedule a Meeting
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Firm Profiles</CardTitle>
                    <CardDescription>Browse available wealth management firms</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {isLoadingProfiles ? (
                      <div className="py-6 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading firm profiles...</p>
                      </div>
                    ) : firmProfiles && firmProfiles.length > 0 ? (
                      <>
                        <div className="absolute top-0 bottom-0 left-0 z-10 flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-background/80 shadow-md" 
                            onClick={() => scrollProfiles('left')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>
                        <div 
                          ref={profilesContainerRef}
                          className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {randomizedProfiles.map(profile => (
                            <div 
                              key={profile.id}
                              className="flex-shrink-0 w-[240px] border rounded-md p-3 bg-card hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center mb-2">
                                {profile.logoUrl ? (
                                  <div className="w-10 h-10 bg-muted rounded-md overflow-hidden mr-3 flex-shrink-0">
                                    <img src={profile.logoUrl} alt={profile.firm} className="w-full h-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                                    <Building2 className="h-6 w-6 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium text-sm leading-tight">{profile.firm}</h4>
                                  {profile.founded && (
                                    <p className="text-xs text-muted-foreground">Est. {profile.founded}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-xs line-clamp-2 text-muted-foreground">
                                  {profile.bio ? (typeof profile.bio === 'string' ? 
                                    `${profile.bio.substring(0, 100)}...` : 
                                    (profile.bio.value || 'No company bio available.')) : 'No company bio available.'}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.headquarters && (
                                    <Badge variant="outline" className="text-xs py-0 h-5">
                                      {profile.headquarters}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-0 bottom-0 right-0 z-10 flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-background/80 shadow-md" 
                            onClick={() => scrollProfiles('right')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Unable to load firm profiles</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <a href="/calculator" className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Run New Calculation
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-muted-foreground"
                      onClick={randomizeFirmProfiles}
                    >
                      Shuffle Firm Matches
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Quick Schedule Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Schedule a Meeting</CardTitle>
                    <CardDescription>Book a consultation directly using the calendar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-[600px] overflow-hidden">
                      <iframe 
                        src="https://tidycal.com/consultationmeet/15-minute-meeting/embedded" 
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: "4px"
                        }}
                        frameBorder="0"
                        title="Schedule a Meeting"
                        allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; display-capture"
                      ></iframe>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information and account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        placeholder="Your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        placeholder="Your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="Your email"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Cell Phone</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="Your cell phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firm">Current Firm</Label>
                      <Input 
                        id="firm"
                        name="firm"
                        value={profile.firm}
                        onChange={handleProfileChange}
                        placeholder="Your current firm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city"
                        name="city"
                        value={profile.city}
                        onChange={handleProfileChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state"
                        name="state"
                        value={profile.state}
                        onChange={handleProfileChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aum">Assets Under Management ($)</Label>
                      <Input 
                        id="aum"
                        name="aum"
                        value={profile.aum}
                        onChange={handleProfileChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Annual Revenue ($)</Label>
                      <Input 
                        id="revenue"
                        name="revenue"
                        value={profile.revenue}
                        onChange={handleProfileChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeBasedPercentage">Fee-Based Percentage (%)</Label>
                      <Input 
                        id="feeBasedPercentage"
                        name="feeBasedPercentage"
                        value={profile.feeBasedPercentage}
                        onChange={handleProfileChange}
                        placeholder="75"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleProfileSave}>Save Changes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advisor Preferences</CardTitle>
                  <CardDescription>
                    Tell us what matters most to you in your transition to a new firm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priorityEquityOpportunity">Equity Opportunity</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityEquityOpportunity"
                          name="priorityEquityOpportunity"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="3"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityTechnologyPlatform">Technology Platform</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityTechnologyPlatform"
                          name="priorityTechnologyPlatform"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="3"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityBrandRecognition">Brand Recognition</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityBrandRecognition"
                          name="priorityBrandRecognition"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="3"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityPayoutRate">Payout Rate</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityPayoutRate"
                          name="priorityPayoutRate"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="4"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityTransitionSupport">Transition Support</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityTransitionSupport"
                          name="priorityTransitionSupport"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="4"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityMarketingSupport">Marketing Support</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Low</span>
                        <input
                          type="range"
                          id="priorityMarketingSupport"
                          name="priorityMarketingSupport"
                          min="1"
                          max="5"
                          className="flex-1"
                          defaultValue="3"
                        />
                        <span className="text-muted-foreground ml-2">High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleProfileSave}>Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Membership Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        {user.isPremium ? "Premium Plan" : "Basic Plan"}
                      </p>
                    </div>
                    {!user.isPremium && (
                      <a href="/checkout">
                        <Button 
                          className="bg-gradient-to-r from-primary to-[#4AFF91] hover:from-primary/90 hover:to-[#4AFF91]/90"
                        >
                          Upgrade to Premium
                        </Button>
                      </a>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Notification Preferences Component */}
                  <NotificationPreferences />
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Change Password</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Change Password</SheetTitle>
                          <SheetDescription>
                            Update your account password. We'll send you an email confirmation.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current">Current Password</Label>
                            <Input id="current" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input id="new" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input id="confirm" type="password" />
                          </div>
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </SheetClose>
                          <Button>Update Password</Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calculations" className="space-y-6">
              {/* Using our SavedCalculations component for better history display */}
              <SavedCalculations />
            </TabsContent>
            
            <TabsContent value="calculator" className="space-y-6">
              <h2 className="text-2xl font-bold">Quick Calculator</h2>
              <p className="text-muted-foreground mb-4">
                Run calculations directly from your dashboard without navigating away.
              </p>
              <EmbeddedCalculator />
            </TabsContent>
            
            <TabsContent value="upgrade" className="space-y-6">
              <h2 className="text-2xl font-bold">Upgrade Your Account</h2>
              <p className="text-muted-foreground mb-4">
                Get access to premium features and unlock your full potential.
              </p>
              <UpgradeSection />
            </TabsContent>
            
            <TabsContent value="practices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practices For Sale</CardTitle>
                  <CardDescription>Explore practices available in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="stateFilter">State</Label>
                      <select 
                        id="stateFilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={practiceFilters.state}
                        onChange={(e) => setPracticeFilters(prev => ({...prev, state: e.target.value}))}
                      >
                        <option value="all">All States</option>
                        {user.state && <option value={user.state}>My State ({user.state})</option>}
                        <option value="GA">Georgia (GA)</option>
                        <option value="FL">Florida (FL)</option>
                        <option value="NC">North Carolina (NC)</option>
                        <option value="TX">Texas (TX)</option>
                        <option value="WA">Washington (WA)</option>
                        <option value="CO">Colorado (CO)</option>
                        <option value="IL">Illinois (IL)</option>
                        <option value="MA">Massachusetts (MA)</option>
                        <option value="AZ">Arizona (AZ)</option>
                        <option value="CA">California (CA)</option>
                        <option value="NJ">New Jersey (NJ)</option>
                        <option value="NY">New York (NY)</option>
                        <option value="UT">Utah (UT)</option>
                        <option value="OR">Oregon (OR)</option>
                        <option value="TN">Tennessee (TN)</option>
                        <option value="MI">Michigan (MI)</option>
                        <option value="PA">Pennsylvania (PA)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="typeFilter">Practice Type</Label>
                      <select 
                        id="typeFilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        value={practiceFilters.practiceType}
                        onChange={(e) => setPracticeFilters(prev => ({...prev, practiceType: e.target.value}))}
                      >
                        <option value="all">All Types</option>
                        <option value="Full Practice Sale">Full Practice Sale</option>
                        <option value="Partial Book Sale">Partial Book Sale</option>
                        <option value="Succession Planning">Succession Planning</option>
                        <option value="Merger Opportunity">Merger Opportunity</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientTypeFilter">Client Type</Label>
                      <select 
                        id="clientTypeFilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        value={practiceFilters.clientType}
                        onChange={(e) => setPracticeFilters(prev => ({...prev, clientType: e.target.value}))}
                      >
                        <option value="all">All Client Types</option>
                        <option value="Mass Affluent">Mass Affluent</option>
                        <option value="High Net Worth">High Net Worth</option>
                        <option value="Retirees">Retirees</option>
                        <option value="Business Owners">Business Owners</option>
                        <option value="Tech Professionals">Tech Professionals</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aumFilter">AUM Size</Label>
                      <select 
                        id="aumFilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        value={practiceFilters.aumSize}
                        onChange={(e) => setPracticeFilters(prev => ({...prev, aumSize: e.target.value}))}
                      >
                        <option value="all">All Sizes</option>
                        <option value="under50">Under $50M</option>
                        <option value="50to100">$50M - $100M</option>
                        <option value="100to250">$100M - $250M</option>
                        <option value="250to500">$250M - $500M</option>
                        <option value="over500">Over $500M</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sortByFilter">Sort By</Label>
                      <select 
                        id="sortByFilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        value={practiceFilters.sortBy}
                        onChange={(e) => setPracticeFilters(prev => ({...prev, sortBy: e.target.value}))}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="aumHigh">Highest AUM</option>
                        <option value="aumLow">Lowest AUM</option>
                        <option value="revenueHigh">Highest Revenue</option>
                        <option value="revenueLow">Lowest Revenue</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Results count */}
                  <div className="mb-4 text-sm">
                    Showing {filteredPractices.length} of {allPractices.length} practices
                    {practiceFilters.state !== "all" && (
                      <span> in <strong>{practiceFilters.state}</strong></span>
                    )}
                  </div>
                  
                  {/* Practice listings */}
                  <div className="space-y-6">
                    {filteredPractices.length > 0 ? (
                      filteredPractices.map(practice => (
                        <div key={practice.id} className="border rounded-md p-4 hover:bg-muted/40 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg">{practice.name}</h3>
                                <span className="text-xs text-muted-foreground">
                                  Listed: {new Date(practice.listedDate).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{practice.location}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">AUM</p>
                                  <p className="font-medium">{practice.aum}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Annual Revenue</p>
                                  <p className="font-medium">{practice.yearlyRevenue}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Clients</p>
                                  <p className="font-medium">{practice.clientCount}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {practice.type}
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {practice.clientType}
                                </span>
                                {user.state && practice.location.includes(user.state) && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                    In Your State
                                  </span>
                                )}
                                {new Date(practice.listedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    New Listing
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-4 flex items-start">
                              <Button size="sm" className="w-28">View Details</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 border rounded-md">
                        <p className="text-muted-foreground">No practices found matching your filters</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setPracticeFilters({state: "all", practiceType: "all", aumSize: "all", clientType: "all", sortBy: "newest"})}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setPracticeFilters({state: "all", practiceType: "all", aumSize: "all", clientType: "all", sortBy: "newest"})}
                  >
                    Reset Filters
                  </Button>
                  <a href="/marketplace">
                    <Button>Browse More Practices</Button>
                  </a>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Meeting</CardTitle>
                  <CardDescription>Book a consultation with a recruiter or our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle>Schedule Your Consultation</CardTitle>
                        <CardDescription>
                          Book a meeting directly using the calendar below
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full h-[650px] overflow-hidden">
                          <iframe 
                            src="https://tidycal.com/consultationmeet/15-minute-meeting/embedded" 
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "none",
                              borderRadius: "4px"
                            }}
                            frameBorder="0"
                            title="Schedule a Meeting"
                            allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; display-capture"
                          ></iframe>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Your Upcoming Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingMeetings.length > 0 ? (
                        <div className="divide-y">
                          {upcomingMeetings.map(meeting => (
                            <div key={meeting.id} className="py-3 flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{meeting.title}</h4>
                                <p className="text-sm text-muted-foreground">{meeting.with}</p>
                                <p className="text-xs mt-1">{meeting.date} at {meeting.time}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Reschedule</Button>
                                <Button variant="destructive" size="sm">Cancel</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No meetings scheduled yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// This component is used in the calculations tab
function LockSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}