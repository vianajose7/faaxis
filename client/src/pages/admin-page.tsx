import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FirmDeal, FirmParameter, FirmProfile, useFirmProfiles } from "@/lib/airtable-service";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  PencilIcon, 
  PlusCircleIcon, 
  Trash2Icon, 
  RefreshCwIcon, 
  Building2Icon,
  Users,
  User, 
  FileText,
  Building,
  BarChart,
  Newspaper,
  ClipboardList,
  Settings,
  Home,
  PieChart,
  Sparkles,
  ImageIcon,
  AlertCircle,
  Loader2,
  ExternalLink,
  Plus,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  MoreHorizontal,
  ImageIcon as Image,
  Star,
  Trash2
} from "lucide-react";
import { Redirect } from "wouter";
import { FirmProfileDialog } from "@/components/admin/firm-profile-dialog";
import { NewsAdminDashboard } from "@/components/admin/news-admin-dashboard";
import { RichTextEditor } from "@/components/blog/rich-text-editor";
import { ImageUpload } from "@/components/blog/image-upload";
import { AiBlogGenerator } from "@/components/blog/ai-blog-generator";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingDeal, setEditingDeal] = useState<FirmDeal | null>(null);
  const [editingParameter, setEditingParameter] = useState<FirmParameter | null>(null);
  const [editingProfile, setEditingProfile] = useState<FirmProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [firmFilter, setFirmFilter] = useState("all");
  const [practiceStatusFilter, setPracticeStatusFilter] = useState("all");
  const [practiceLocationFilter, setPracticeLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Admin dashboard state
  const [users, setUsers] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [practiceListings, setPracticeListings] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<any>(null);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isAiBlogGeneratorOpen, setIsAiBlogGeneratorOpen] = useState(false);
  const [isPracticeDialogOpen, setIsPracticeDialogOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Form states
  const [formFirm, setFormFirm] = useState("");
  const [formUpfrontMin, setFormUpfrontMin] = useState(0);
  const [formUpfrontMax, setFormUpfrontMax] = useState(0);
  const [formBackendMin, setFormBackendMin] = useState(0);
  const [formBackendMax, setFormBackendMax] = useState(0);
  const [formTotalDealMin, setFormTotalDealMin] = useState(0);
  const [formTotalDealMax, setFormTotalDealMax] = useState(0);
  const [formNotes, setFormNotes] = useState("");
  const [formParamName, setFormParamName] = useState("");
  const [formParamValue, setFormParamValue] = useState(0);
  
  // Queries for firm deals and parameters
  const { 
    data: firmDeals = [],
    isLoading: isDealsLoading,
    refetch: refetchDeals
  } = useQuery<FirmDeal[], Error>({
    queryKey: ['/api/firm-deals'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { 
    data: firmParameters = [],
    isLoading: isParametersLoading,
    refetch: refetchParameters
  } = useQuery<FirmParameter[], Error>({
    queryKey: ['/api/firm-parameters'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const {
    data: firmProfiles = [],
    isLoading: isProfilesLoading,
    refetch: refetchProfiles
  } = useFirmProfiles();
  
  // Admin dashboard queries
  const { 
    data: adminUsers = [],
    isLoading: isAdminUsersLoading,
    refetch: refetchUsers
  } = useQuery<any[], Error>({
    queryKey: ['/api/admin/users'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update users state when adminUsers data changes
  useEffect(() => {
    if (adminUsers) {
      setUsers(adminUsers);
    }
  }, [adminUsers]);
  
  const { 
    data: adminBlogPosts = [],
    isLoading: isAdminBlogsLoading,
    refetch: refetchBlogs
  } = useQuery<any[], Error>({
    queryKey: ['/api/admin/blog-posts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update blog posts state when adminBlogPosts data changes
  useEffect(() => {
    if (adminBlogPosts && adminBlogPosts.length > 0) {
      setBlogPosts(adminBlogPosts);
    } else {
      // If API returns empty, use sample blog posts data for development
      // Generate 40 blog posts
      const sampleBlogPosts = [];
      
      // Blog post titles and topics related to financial advisory
      const blogTitles = [
        "How Wirehouses Are Responding to the Disruption in Wealth Management",
        "Maximizing Your Book Value Before Transition",
        "5 Key Trends Reshaping Wealth Management",
        "The Complete Guide to Transitioning to Independence",
        "Understanding Upfront and Backend Compensation",
        "Comparing Wirehouse vs. Independent Models in 2025",
        "Building a Client Retention Strategy During Transition",
        "Technology Essentials for Modern Financial Advisors",
        "The Future of Fee-Based Advisory Services",
        "Navigating Regulatory Changes for Financial Advisors",
        "How to Evaluate Firm Culture Before Making a Move",
        "Strategies for Growing Your AUM in a Competitive Market",
        "The Psychology of Client Relationships in Wealth Management",
        "Succession Planning for Financial Advisors",
        "The Rise of ESG Investing: What Advisors Need to Know",
        "Breaking Down the FINRA Transition Process",
        "Mastering Client Communication During Firm Changes",
        "The Impact of AI on Financial Advisory Services",
        "Building a Multi-Generational Practice",
        "Compensation Trends in Wealth Management",
        "The Hidden Costs of Transitioning Firms",
        "Leveraging Social Media for Practice Growth",
        "Understanding Protocol Firms vs. Non-Protocol Firms",
        "Compliance Challenges for Independent Advisors",
        "Navigating Non-Compete Agreements in Financial Services",
        "The Evolving Role of Financial Advisors in Retirement Planning",
        "Building a Niche Practice: Specialization Strategies",
        "Client Acquisition Strategies That Actually Work",
        "How to Calculate the True Value of Your Book",
        "Tax Implications of Advisor Transitions",
        "Digital Marketing for Financial Advisors",
        "The Future of Hybrid Advisory Models",
        "Managing Client Expectations Through Market Volatility",
        "The Advisor's Guide to RIA Custodian Selection",
        "Building a Strong Team: Hiring Strategies for Advisors",
        "Converting Prospects to Clients: Effective Techniques",
        "The Impact of Demographic Shifts on Advisory Practices",
        "Incorporating Financial Planning into Your Service Model",
        "Technology Integration Challenges for Advisory Firms",
        "Advisor Wellness: Preventing Burnout in Financial Services"
      ];
      
      // Generate 40 blog posts
      for (let i = 0; i < 40; i++) {
        const title = blogTitles[i % blogTitles.length]; // Cycle through titles if more than available
        
        // Generate a date within the last 180 days
        const randomDays = Math.floor(Math.random() * 180);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Create slug from title
        const slug = title.toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
          
        // Random excerpt related to financial advisory
        const excerpt = `${title} - Learn about the latest trends and strategies in the wealth management industry. This article provides valuable insights for financial advisors looking to enhance their practice.`;
        
        sampleBlogPosts.push({
          id: (i + 1).toString(),
          title: title,
          author: "Faaxis Research Team",
          excerpt: excerpt,
          date: formattedDate,
          slug: slug,
          published: Math.random() > 0.1, // 90% published
          featured: Math.random() > 0.7 // 30% featured
        });
      }
      
      // Sort blog posts by date (newest first)
      sampleBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setBlogPosts(sampleBlogPosts);
    }
  }, [adminBlogPosts]);
  
  const { 
    data: adminPracticeListings = [],
    isLoading: isAdminPracticesLoading,
    refetch: refetchPractices
  } = useQuery<any[], Error>({
    queryKey: ['/api/admin/practice-listings'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch news articles
  const { 
    data: fetchedNewsArticles,
    isLoading: isNewsLoading,
    refetch: refetchNews
  } = useQuery<any, Error>({
    queryKey: ['/api/news'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update news articles state when fetchedNewsArticles data changes
  useEffect(() => {
    if (fetchedNewsArticles?.newsArticles) {
      setNewsArticles(fetchedNewsArticles.newsArticles);
    }
  }, [fetchedNewsArticles]);
  
  // Mutation for generating images for news articles
  const generateImageMutation = useMutation({
    mutationFn: async (articleId: string) => {
      setIsGeneratingImage(true);
      const res = await apiRequest('POST', `/api/news/${articleId}/generate-image`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image generated successfully",
        description: "The article image has been created using AI.",
      });
      
      // Update the article in the newsArticles state
      setNewsArticles(prev => 
        prev.map(article => 
          article.id === data.articleId 
            ? { ...article, imageUrl: data.imageUrl } 
            : article
        )
      );
      
      // Invalidate the news query cache to reflect the updated image
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsGeneratingImage(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate image",
        description: error.message,
        variant: "destructive",
      });
      setIsGeneratingImage(false);
    }
  });
  
  // Update practice listings state when adminPracticeListings data changes
  useEffect(() => {
    if (adminPracticeListings && adminPracticeListings.length > 0) {
      setPracticeListings(adminPracticeListings);
    } else {
      // If API returns empty, use sample practice listings data for development
      // Generate 35 practice listings
      const samplePracticeListings = [];
      const cities = [
        "Miami, FL", "Chicago, IL", "New York, NY", "Los Angeles, CA", "Dallas, TX", 
        "Boston, MA", "Atlanta, GA", "San Francisco, CA", "Denver, CO", "Seattle, WA",
        "Philadelphia, PA", "Phoenix, AZ", "Houston, TX", "Charlotte, NC", "Portland, OR",
        "Nashville, TN", "Austin, TX", "San Diego, CA", "Minneapolis, MN", "New Orleans, LA",
        "Tampa, FL", "St. Louis, MO", "Pittsburgh, PA", "Orlando, FL", "Cincinnati, OH",
        "Kansas City, MO", "Columbus, OH", "Indianapolis, IN", "Cleveland, OH", "Milwaukee, WI"
      ];
      
      const practiceTypes = [
        "Wealth Management Practice", "Financial Planning Firm", "RIA Practice", "Advisory Business", 
        "Investment Management Firm", "Financial Services Practice", "Family Office", "Asset Management Practice"
      ];
      
      // Generate 35 unique practice listings
      for (let i = 1; i <= 35; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const type = practiceTypes[Math.floor(Math.random() * practiceTypes.length)];
        const aum = `$${Math.floor(Math.random() * 300 + 50)}M`;
        const revenueNum = Math.floor(Math.random() * 2500 + 500);
        const revenue = revenueNum >= 1000 ? `$${(revenueNum/1000).toFixed(1)}M` : `$${revenueNum}K`;
        const price = `$${(revenueNum * 3).toFixed(1)}M`;
        const status = Math.random() > 0.2 ? "Active" : (Math.random() > 0.5 ? "Pending" : "Sold");
        const highlighted = Math.random() > 0.7;
        
        // Generate a date within the last 60 days
        const randomDays = Math.floor(Math.random() * 60);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        
        samplePracticeListings.push({
          id: i.toString(),
          title: `${city.split(',')[0]} ${type}`,
          location: city,
          aum: aum,
          revenue: revenue,
          status: status,
          price: price,
          description: `High-quality ${type.toLowerCase()} with strong client relationships and growth potential in the ${city} area.`,
          highlighted: highlighted,
          date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });
      }
      
      setPracticeListings(samplePracticeListings);
    }
  }, [adminPracticeListings]);

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      refetchUsers();
      setIsUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      });
      refetchUsers();
      setIsUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      refetchUsers();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for refreshing Airtable data
  const refreshAirtableMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/refresh-airtable");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Data refreshed",
        description: "Airtable data has been refreshed successfully",
      });
      refetchDeals();
      refetchParameters();
      refetchProfiles();
    },
    onError: (error: Error) => {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set form values when editing item changes
  useEffect(() => {
    if (editingDeal) {
      setFormFirm(editingDeal.firm);
      setFormUpfrontMin(editingDeal.upfrontMin);
      setFormUpfrontMax(editingDeal.upfrontMax);
      setFormBackendMin(editingDeal.backendMin);
      setFormBackendMax(editingDeal.backendMax);
      setFormTotalDealMin(editingDeal.totalDealMin);
      setFormTotalDealMax(editingDeal.totalDealMax);
      setFormNotes(editingDeal.notes);
    } else if (editingParameter) {
      setFormFirm(editingParameter.firm);
      setFormParamName(editingParameter.paramName);
      setFormParamValue(editingParameter.paramValue);
      setFormNotes(editingParameter.notes);
    } else {
      // Reset form for new items
      setFormFirm("");
      setFormUpfrontMin(0);
      setFormUpfrontMax(0);
      setFormBackendMin(0);
      setFormBackendMax(0);
      setFormTotalDealMin(0);
      setFormTotalDealMax(0);
      setFormNotes("");
      setFormParamName("");
      setFormParamValue(0);
    }
  }, [editingDeal, editingParameter]);

  // Handle refresh button click
  const handleRefreshAirtable = () => {
    refreshAirtableMutation.mutate();
  };

  // Handle form submission
  const handleSaveChanges = () => {
    // In a real implementation, this would call the API to save changes
    // Since we're working with Airtable directly, we'll just show a toast
    toast({
      title: "Changes saved",
      description: "Changes would be saved to Airtable in a real implementation.",
    });
    
    setIsDialogOpen(false);
    setEditingDeal(null);
    setEditingParameter(null);
  };

  // Handle adding new item
  const handleAddNew = (type: 'deal' | 'parameter') => {
    setEditingDeal(null);
    setEditingParameter(null);
    
    if (type === 'deal') {
      setActiveTab("firms");
    } else {
      setActiveTab("parameters");
    }
    
    setIsDialogOpen(true);
  };

  // Filter data based on search and firm filter
  const filteredDeals = firmDeals.filter(deal => {
    const matchesFirm = firmFilter === "all" || deal.firm === firmFilter;
    const matchesSearch = !searchQuery || 
      deal.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFirm && matchesSearch;
  });
  
  const filteredParameters = firmParameters.filter(param => {
    const matchesFirm = firmFilter === "all" || param.firm === firmFilter;
    const matchesSearch = !searchQuery || 
      param.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      param.paramName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      param.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFirm && matchesSearch;
  });

  // If not logged in or not an admin, redirect
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  if (user && !user.isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            You need administrator privileges to access this page.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }



  // Loading state
  if (
    isLoading || 
    isDealsLoading || 
    isParametersLoading || 
    isAdminUsersLoading || 
    isAdminBlogsLoading || 
    isAdminPracticesLoading ||
    isNewsLoading
  ) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Get unique firm names for filtering
  const uniqueFirms = Array.from(new Set(firmDeals.map(deal => deal.firm))).sort();

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage firm data and calculation parameters
          </p>
        </div>
        <Button 
          onClick={handleRefreshAirtable} 
          disabled={refreshAirtableMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCwIcon size={16} className={refreshAirtableMutation.isPending ? "animate-spin" : ""} />
          {refreshAirtableMutation.isPending ? "Refreshing..." : "Refresh Airtable Data"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
          <TabsTrigger value="news">News Articles</TabsTrigger>
          <TabsTrigger value="practices">Practice Listings</TabsTrigger>
          <TabsTrigger value="firms">Firm Deals</TabsTrigger>
          <TabsTrigger value="parameters">Calculation Parameters</TabsTrigger>
          <TabsTrigger value="profiles">Firm Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Users</span>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Total registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{adminUsers.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-1">{adminUsers.filter(u => u.isAdmin).length} Admins</Badge>
                  <Badge variant="outline">{adminUsers.filter(u => u.isPremium).length} Premium</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Blog Posts</span>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Published articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{blogPosts.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Latest article: {blogPosts[0]?.title || "None"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Practice Listings</span>
                  <Building className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Active practice listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{practiceListings.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-1">{practiceListings.filter(p => p.highlighted).length} Highlighted</Badge>
                  <Badge variant="outline">{practiceListings.filter(p => p.status === 'Active').length} Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>User activity across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Generate recent activity based on available data */}
                  {(() => {
                    // Create a combined array of events
                    const recentEvents = [];
                    
                    // Add recent users
                    adminUsers.slice(0, 2).forEach(user => {
                      recentEvents.push({
                        type: 'user',
                        id: user.id,
                        title: 'New user registration',
                        detail: `${user.fullName || user.username}`,
                        icon: <User className="h-4 w-4 text-primary" />,
                        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)), // Random time in last 24 hours
                      });
                    });
                    
                    // Add recent practice listings
                    practiceListings.slice(0, 3).forEach(practice => {
                      recentEvents.push({
                        type: 'practice',
                        id: practice.id,
                        title: 'New practice listing',
                        detail: practice.title,
                        icon: <Building className="h-4 w-4 text-primary" />,
                        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48)), // Random time in last 48 hours
                        date: practice.date // Keep original date for sorting
                      });
                    });
                    
                    // Add recent blog posts
                    blogPosts.slice(0, 4).forEach(post => {
                      recentEvents.push({
                        type: 'blog',
                        id: post.id,
                        title: 'New blog article published',
                        detail: post.title,
                        icon: <FileText className="h-4 w-4 text-primary" />,
                        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 72)), // Random time in last 72 hours
                        date: post.date // Keep original date for sorting
                      });
                    });
                    
                    // Add calculation events
                    const firmNames = firmDeals.map(deal => deal.firm);
                    const userNames = adminUsers.map(user => user.fullName || user.username).filter(Boolean);
                    
                    for (let i = 0; i < 3; i++) {
                      const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
                      const randomFirmCount = Math.floor(Math.random() * 3) + 2; // 2-4 firms
                      
                      recentEvents.push({
                        type: 'calculation',
                        title: 'Calculation performed',
                        detail: `${randomUser || 'A user'} compared ${randomFirmCount} firm deals`,
                        icon: <BarChart className="h-4 w-4 text-primary" />,
                        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 96)), // Random time in last 96 hours
                      });
                    }
                    
                    // Sort by timestamp (most recent first)
                    recentEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                    
                    // Take only most recent 6 events
                    return recentEvents.slice(0, 6).map((event, index) => {
                      // Format the time difference
                      const now = new Date();
                      const diffMs = now.getTime() - event.timestamp.getTime();
                      const diffMins = Math.floor(diffMs / (1000 * 60));
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      
                      let timeDisplay;
                      if (diffMins < 1) {
                        timeDisplay = 'Just now';
                      } else if (diffMins < 60) {
                        timeDisplay = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                      } else if (diffHours < 24) {
                        timeDisplay = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                      } else {
                        timeDisplay = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                      }
                      
                      // Define the event interface to fix TypeScript issues
                      interface ActivityEvent {
                        type: string;
                        id?: string | number;
                        title: string;
                        detail: string;
                        icon: React.ReactNode;
                        timestamp: Date;
                        date?: string;
                      }
                      
                      // Determine the appropriate tab to navigate to based on event type
                      const getNavigationTab = (event: ActivityEvent): string => {
                        switch (event.type) {
                          case 'user':
                            return "users";
                          case 'practice':
                            return "practices";
                          case 'blog':
                            return "blogs";
                          case 'calculation':
                            return "firms"; // Calculations relate to firm comparison
                          default:
                            return "dashboard";
                        }
                      };
                      
                      // Cast event to the correct type to fix TypeScript issues
                      const typedEvent = event as ActivityEvent;
                      
                      // Create a clickable wrapper that navigates to the tab
                      const handleNavigate = () => {
                        const tabToNavigate = getNavigationTab(typedEvent);
                        setActiveTab(tabToNavigate);
                        
                        // For specific items, we might want to open them for editing
                        if (typedEvent.id) {
                          switch (typedEvent.type) {
                            case 'blog':
                              setSelectedBlogPost(blogPosts.find(bp => bp.id === typedEvent.id));
                              setIsBlogDialogOpen(true);
                              break;
                            case 'practice':
                              setSelectedPractice(practiceListings.find(pl => pl.id === typedEvent.id));
                              setIsPracticeDialogOpen(true);
                              break;
                            case 'user':
                              setSelectedUser(adminUsers.find(u => u.id === typedEvent.id));
                              setIsUserDialogOpen(true);
                              break;
                          }
                        }
                      };
                      
                      return (
                        <div 
                          className="flex items-center cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                          key={`event-${index}`}
                          onClick={handleNavigate}
                          title={`View in ${getNavigationTab(typedEvent)} tab`}
                        >
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            {event.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.detail}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">{timeDisplay}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left" 
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab("blogs")}
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Edit Blog Posts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab("practices")}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manage Practice Listings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={handleRefreshAirtable}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Refresh Airtable Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab("parameters")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Update Calculator Parameters
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View, edit, and manage system users and their permissions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedUser(null);
                      setIsUserDialogOpen(true);
                    }}
                  >
                    <PlusCircleIcon size={16} />
                    Add New User
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => refetchUsers()}
                  >
                    <RefreshCwIcon size={16} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Input 
                  placeholder="Search users..." 
                  className="w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers
                      .filter(user => 
                        !searchQuery || 
                        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.fullName || '-'}</TableCell>
                          <TableCell>
                            {user.emailVerified ? (
                              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/20">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge>Admin</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isPremium ? (
                              <Badge variant="secondary">Premium</Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserDialogOpen(true);
                                }}
                              >
                                <PencilIcon size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                <Trash2Icon size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser 
                    ? `Update information for ${selectedUser.username}` 
                    : 'Add a new user to the system'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="Email address"
                    className="col-span-3"
                    defaultValue={selectedUser?.username || ''}
                    disabled={!!selectedUser}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    className="col-span-3"
                    defaultValue={selectedUser?.fullName || ''}
                  />
                </div>
                {!selectedUser && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Set password"
                      className="col-span-3"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-role" className="text-right">
                    Admin
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch 
                      id="admin-role" 
                      defaultChecked={selectedUser?.isAdmin || false}
                    />
                    <Label htmlFor="admin-role">Grant admin privileges</Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="premium" className="text-right">
                    Premium
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch 
                      id="premium" 
                      defaultChecked={selectedUser?.isPremium || false}
                    />
                    <Label htmlFor="premium">Enable premium access</Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="verified" className="text-right">
                    Verified
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch 
                      id="verified" 
                      defaultChecked={selectedUser?.emailVerified || false}
                    />
                    <Label htmlFor="verified">Email verified</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Get form values
                  const email = (document.getElementById('email') as HTMLInputElement).value;
                  const name = (document.getElementById('name') as HTMLInputElement).value;
                  const password = !selectedUser ? (document.getElementById('password') as HTMLInputElement).value : undefined;
                  const isAdmin = (document.getElementById('admin-role') as HTMLInputElement).checked;
                  const isPremium = (document.getElementById('premium') as HTMLInputElement).checked;
                  const emailVerified = (document.getElementById('verified') as HTMLInputElement).checked;
                  
                  if (selectedUser) {
                    // Update existing user
                    updateUserMutation.mutate({
                      id: selectedUser.id,
                      data: {
                        fullName: name,
                        isAdmin,
                        isPremium,
                        emailVerified,
                        ...(password ? { password } : {})
                      }
                    });
                  } else {
                    // Create new user
                    if (!email || !password) {
                      toast({
                        title: "Missing required fields",
                        description: "Email and password are required",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    createUserMutation.mutate({
                      username: email,
                      password,
                      fullName: name,
                      isAdmin,
                      isPremium,
                      emailVerified
                    });
                  }
                }}>
                  {selectedUser ? "Save Changes" : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Blog Management</CardTitle>
                  <CardDescription>
                    Manage blog articles, create new content, and organize categories
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedBlogPost(null);
                      setIsBlogDialogOpen(true);
                    }}
                  >
                    <PlusCircleIcon size={16} />
                    Create New Post
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20"
                    onClick={() => {
                      setIsAiBlogGeneratorOpen(true);
                    }}
                  >
                    <Sparkles size={16} className="text-primary" />
                    Generate with AI
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => refetchBlogs()}
                  >
                    <RefreshCwIcon size={16} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="industry-trends">Industry Trends</SelectItem>
                    <SelectItem value="practice-valuation">Practice Valuation</SelectItem>
                    <SelectItem value="career-advice">Career Advice</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="Search blog posts..." 
                  className="w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminBlogPosts
                      .filter(post => 
                        !searchQuery || 
                        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.category?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(post => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[300px] truncate">{post.title}</TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.date}</TableCell>
                          <TableCell>
                            {post.published ? (
                              <Badge variant="secondary">Published</Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedBlogPost(post);
                                  setIsBlogDialogOpen(true);
                                }}
                              >
                                <PencilIcon size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  toast({
                                    title: "Delete not implemented",
                                    description: "This would delete the blog post in a real implementation.",
                                  });
                                }}
                              >
                                <Trash2Icon size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                </DialogTitle>
                <DialogDescription>
                  {selectedBlogPost 
                    ? `Update article: ${selectedBlogPost.title}` 
                    : 'Create a new blog article for the platform'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Article title"
                    className="col-span-3"
                    defaultValue={selectedBlogPost?.title || ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="author" className="text-right">
                    Author
                  </Label>
                  <Input
                    id="author"
                    placeholder="Author name"
                    className="col-span-3"
                    defaultValue={selectedBlogPost?.author || ''}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="featured-image" className="text-right mt-2">
                    Featured Image
                  </Label>
                  <div className="col-span-3">
                    <ImageUpload
                      onImageUpload={(imageUrl) => {
                        // In a real implementation, this would update the blog post state
                        console.log('Image uploaded:', imageUrl);
                      }}
                      defaultImage={selectedBlogPost?.featuredImage}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select defaultValue={selectedBlogPost?.category || "industry-trends"}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industry-trends">Industry Trends</SelectItem>
                      <SelectItem value="practice-valuation">Practice Valuation</SelectItem>
                      <SelectItem value="career-advice">Career Advice</SelectItem>
                      <SelectItem value="market-insights">Market Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(selectedBlogPost?.tags || ['finance', 'advisor']).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tag}
                          <button 
                            className="ml-2 text-muted-foreground hover:text-foreground" 
                            onClick={(e) => {
                              e.preventDefault();
                              // This would remove the tag from the tags array
                              toast({
                                title: "Tag removed",
                                description: `Tag "${tag}" would be removed in a real implementation.`
                              });
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7"
                        onClick={(e) => {
                          e.preventDefault();
                          const newTag = prompt("Enter a new tag");
                          if (newTag) {
                            toast({
                              title: "Tag added",
                              description: `Tag "${newTag}" would be added in a real implementation.`
                            });
                          }
                        }}
                      >
                        + Add Tag
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tags help categorize your content and improve searchability
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="excerpt" className="text-right">
                    Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief excerpt for the article"
                    className="col-span-3"
                    defaultValue={selectedBlogPost?.excerpt || ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right mt-2">
                    Content
                  </Label>
                  <div className="col-span-3">
                    <div id="editor-container">
                      <RichTextEditor
                        value={selectedBlogPost?.content || ''}
                        onChange={(content) => {
                          // In a real implementation, we would update the blog post state
                          console.log('Content updated:', content);
                        }}
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use the rich text editor to format your content with images, links, and formatting
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="published" className="text-right">
                    Status
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch 
                      id="published" 
                      defaultChecked={selectedBlogPost?.published || false}
                    />
                    <Label htmlFor="published">Publish this article</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBlogDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: selectedBlogPost ? "Blog updated" : "Blog published",
                    description: "This would save the blog post in a real implementation.",
                  });
                  setIsBlogDialogOpen(false);
                }}>
                  {selectedBlogPost ? "Update Article" : "Publish Article"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>News Articles</CardTitle>
                  <CardDescription>
                    Manage industry news articles and AI-generated images
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => refetchNews()}
                  >
                    <RefreshCwIcon size={16} />
                    Refresh Articles
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {/* Toggle filter for all articles */}}
                      className={`flex items-center gap-1`}
                    >
                      <FileText size={16} className="mr-1" />
                      All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {/* Toggle filter for published */}}
                      className={`flex items-center gap-1`}
                    >
                      <CheckCircle2 size={16} className="mr-1" />
                      Published
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {/* Toggle filter for drafts */}}
                      className={`flex items-center gap-1`}
                    >
                      <Eye size={16} className="mr-1" />
                      Drafts
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        // Future: Open dialog to create new article
                        if (confirm("Generate a new article with AI?")) {
                          // Get title
                          const title = prompt("Enter a title for the article (optional):");
                          
                          // Make API call to generate article
                          fetch('/api/news/generate-with-ai', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: title || undefined }),
                          })
                          .then(r => r.json())
                          .then(() => {
                            toast({
                              title: "Article Generated",
                              description: "A new article has been generated with AI."
                            });
                            refetchNews();
                          })
                          .catch(error => {
                            toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            });
                          });
                        }
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      Generate New Article
                    </Button>
                  </div>
                </div>
                
                <Input 
                  placeholder="Search articles by title or content..." 
                  className="max-w-sm"
                  onChange={(e) => {
                    // Future: Filter articles by title or content
                  }}
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-[100px]">Source</TableHead>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsArticles && newsArticles.length > 0 ? (
                      newsArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-md truncate" title={article.title}>
                              {article.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 max-w-md truncate" title={article.excerpt}>
                              {article.excerpt}
                            </div>
                          </TableCell>
                          <TableCell>
                            {article.published ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <Eye className="mr-1 h-3 w-3" /> Draft
                              </Badge>
                            )}
                            {article.featured && (
                              <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                                <Star className="mr-1 h-3 w-3" /> Featured
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{article.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>{article.source}</TableCell>
                          <TableCell>
                            {article.imageUrl ? (
                              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                <img 
                                  src={article.imageUrl} 
                                  alt={article.title}
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-destructive/10">No Image</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  // Future: Implement article editing
                                  toast({
                                    title: "Edit Feature Coming Soon",
                                    description: "Article editing will be available in the next update."
                                  });
                                }}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => {
                                  window.open(`/news/${article.slug || article.id}`, '_blank');
                                }}>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={() => {
                                  // Toggle feature status
                                  fetch(`/api/news/${article.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ featured: !article.featured }),
                                  })
                                  .then(r => r.json())
                                  .then(() => {
                                    toast({
                                      title: article.featured ? "Removed from Featured" : "Added to Featured",
                                      description: `Article has been ${article.featured ? 'removed from' : 'added to'} featured.`
                                    });
                                    refetchNews();
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  });
                                }}>
                                  <Star className="mr-2 h-4 w-4" /> 
                                  {article.featured ? 'Remove from Featured' : 'Add to Featured'}
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => {
                                  // Toggle publish status
                                  fetch(`/api/news/${article.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ published: !article.published }),
                                  })
                                  .then(r => r.json())
                                  .then(() => {
                                    toast({
                                      title: article.published ? "Unpublished" : "Published",
                                      description: `Article has been ${article.published ? 'unpublished' : 'published'}.`
                                    });
                                    refetchNews();
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  });
                                }}>
                                  {article.published ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" /> Publish
                                    </>
                                  )}
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => generateImageMutation.mutate(article.id)} disabled={generateImageMutation.isPending || isGeneratingImage}>
                                  <Image className="mr-2 h-4 w-4" /> 
                                  {generateImageMutation.isPending || isGeneratingImage ? 'Generating...' : (article.imageUrl ? 'Regenerate Image' : 'Generate Image')}
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if(confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
                                      // Delete article
                                      fetch(`/api/news/${article.id}`, {
                                        method: 'DELETE',
                                      })
                                      .then(r => r.json())
                                      .then(() => {
                                        toast({
                                          title: "Article Deleted",
                                          description: "The article has been deleted successfully."
                                        });
                                        refetchNews();
                                      })
                                      .catch(error => {
                                        toast({
                                          title: "Error",
                                          description: error.message,
                                          variant: "destructive",
                                        });
                                      });
                                    }
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-10 w-10 mb-2" />
                            <p>No news articles found</p>
                            <p className="text-sm mt-1">News articles will appear here once available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="practices">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Practice Listings</CardTitle>
                  <CardDescription>
                    Manage practice listings, approve submissions, and highlight featured practices
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedPractice(null);
                      setIsPracticeDialogOpen(true);
                    }}
                  >
                    <PlusCircleIcon size={16} />
                    Add New Listing
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => refetchPractices()}
                  >
                    <RefreshCwIcon size={16} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <Select 
                    value={practiceStatusFilter} 
                    onValueChange={setPracticeStatusFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending Review</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={practiceLocationFilter}
                    onValueChange={setPracticeLocationFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input 
                  placeholder="Search practice listings..." 
                  className="w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Practice Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>AUM</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                        // Add debugging console log to see current filter values
                        console.log("Filter values:", {
                          statusFilter: practiceStatusFilter,
                          locationFilter: practiceLocationFilter,
                          practiceCount: practiceListings.length
                        });
                        
                        // Apply filters to practice listings
                        return practiceListings.filter(practice => {
                          // Debug the practice object to verify its structure
                          if (practiceListings.indexOf(practice) === 0) {
                            console.log("Sample practice:", practice);
                          }
                          
                          // Status filter
                          let matchesStatus = true;
                          if (practiceStatusFilter !== "all") {
                            matchesStatus = practice.status === practiceStatusFilter;
                            console.log(`Status check for ${practice.title || practice.name}: ${practice.status} === ${practiceStatusFilter} = ${matchesStatus}`);
                          }
                          
                          // Location filter - checks if the state code is in the location
                          let matchesLocation = true;
                          if (practiceLocationFilter !== "all") {
                            // Match "NY" in "New York, NY" or "FL" in "Miami, FL"
                            // Extract the state code which is typically after the comma and space
                            const locationParts = practice.location ? practice.location.split(', ') : [];
                            const stateCode = locationParts.length > 1 ? locationParts[1] : '';
                            
                            matchesLocation = stateCode === practiceLocationFilter;
                            console.log(`Location check for ${practice.title || practice.name}: ${practice.location} has state ${stateCode} === ${practiceLocationFilter} = ${matchesLocation}`);
                          }
                          
                          // Search query filter
                          const matchesSearch = !searchQuery || 
                            (practice.title && practice.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (practice.name && practice.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (practice.location && practice.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (practice.description && practice.description.toLowerCase().includes(searchQuery.toLowerCase()));
                          
                          return matchesStatus && matchesLocation && matchesSearch;
                        });
                      })()
                      .map(practice => (
                        <TableRow key={practice.id}>
                          <TableCell className="font-medium">{practice.title || practice.name}</TableCell>
                          <TableCell>{practice.location}</TableCell>
                          <TableCell>{practice.aum || "-"}</TableCell>
                          <TableCell>{practice.revenue || "-"}</TableCell>
                          <TableCell>
                            {practice.status === "Active" ? (
                              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                            ) : practice.status === "Pending" ? (
                              <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>
                            ) : (
                              <Badge variant="outline">Sold</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {practice.highlighted ? (
                              <Badge variant="secondary">Featured</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedPractice(practice);
                                  setIsPracticeDialogOpen(true);
                                }}
                              >
                                <PencilIcon size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  toast({
                                    title: "Delete not implemented",
                                    description: "This would delete the practice listing in a real implementation.",
                                  });
                                }}
                              >
                                <Trash2Icon size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isPracticeDialogOpen} onOpenChange={setIsPracticeDialogOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedPractice ? 'Edit Practice Listing' : 'Add New Practice Listing'}
                </DialogTitle>
                <DialogDescription>
                  {selectedPractice 
                    ? `Update listing: ${selectedPractice.title || selectedPractice.name}` 
                    : 'Add a new practice listing to the marketplace'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Basic Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="practice-name"
                      placeholder="Enter practice name"
                      className="col-span-3"
                      defaultValue={selectedPractice?.title || selectedPractice?.name || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      className="col-span-3"
                      defaultValue={selectedPractice?.location || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="aum" className="text-right">
                      AUM
                    </Label>
                    <Input
                      id="aum"
                      placeholder="Assets under management (e.g. $15M)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.aum || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="revenue" className="text-right">
                      Annual Revenue
                    </Label>
                    <Input
                      id="revenue"
                      placeholder="Annual revenue (e.g. $2.5M)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.revenue || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="clients" className="text-right">
                      Clients
                    </Label>
                    <Input
                      id="clients"
                      placeholder="Number of clients"
                      className="col-span-3"
                      defaultValue={selectedPractice?.clients || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select defaultValue={selectedPractice?.type || "Full Service"}>
                      <SelectTrigger id="type" className="col-span-3">
                        <SelectValue placeholder="Select practice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Service">Full Service</SelectItem>
                        <SelectItem value="Partial Book Sale">Partial Book Sale</SelectItem>
                        <SelectItem value="Investment">Investment Only</SelectItem>
                        <SelectItem value="RIA">RIA</SelectItem>
                        <SelectItem value="Fee-Only">Fee-Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select defaultValue={selectedPractice?.status || "Active"}>
                      <SelectTrigger id="status" className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending Review</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Description Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right mt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Practice description"
                      className="col-span-3 min-h-[120px]"
                      defaultValue={selectedPractice?.description || ''}
                    />
                  </div>
                </div>
                
                {/* Practice Details Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Practice Details</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="established" className="text-right">
                      Established
                    </Label>
                    <Input
                      id="established"
                      placeholder="Year established"
                      className="col-span-3"
                      defaultValue={selectedPractice?.established || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="clientAvgAge" className="text-right">
                      Client Average Age
                    </Label>
                    <Input
                      id="clientAvgAge"
                      placeholder="Average client age"
                      className="col-span-3"
                      defaultValue={selectedPractice?.clientAvgAge || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="investmentStyle" className="text-right">
                      Investment Style
                    </Label>
                    <Input
                      id="investmentStyle"
                      placeholder="Description of investment approach"
                      className="col-span-3"
                      defaultValue={selectedPractice?.investmentStyle || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="feeStructure" className="text-right">
                      Fee Structure
                    </Label>
                    <Input
                      id="feeStructure"
                      placeholder="Fee structure (e.g. Fee-based (65%), commission (35%))"
                      className="col-span-3"
                      defaultValue={selectedPractice?.feeStructure || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="growthRate" className="text-right">
                      Growth Rate
                    </Label>
                    <Input
                      id="growthRate"
                      placeholder="Annual growth rate (e.g. 6.5% annually)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.growthRate || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="clientRetentionRate" className="text-right">
                      Client Retention Rate
                    </Label>
                    <Input
                      id="clientRetentionRate"
                      placeholder="Client retention rate (e.g. 97% annually)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.clientRetentionRate || ''}
                    />
                  </div>
                </div>
                
                {/* Sale Terms Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Sale Terms</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="askingPrice" className="text-right">
                      Asking Price
                    </Label>
                    <Input
                      id="askingPrice"
                      placeholder="Asking price (e.g. 2.4x revenue)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.askingPrice || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="transitionPeriod" className="text-right">
                      Transition Period
                    </Label>
                    <Input
                      id="transitionPeriod"
                      placeholder="Transition period (e.g. 6-12 months)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.transitionPeriod || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="sellerMotivation" className="text-right">
                      Seller Motivation
                    </Label>
                    <Input
                      id="sellerMotivation"
                      placeholder="Reason for selling (e.g. Retirement planning)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.sellerMotivation || ''}
                    />
                  </div>
                </div>
                
                {/* Key Features Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">
                      Features & Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="Comma-separated tags (e.g. Comprehensive Planning, Fee-Only)"
                      className="col-span-3"
                      defaultValue={selectedPractice?.tags?.join ? selectedPractice?.tags?.join(', ') : selectedPractice?.tags || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mt-3">
                    <Label htmlFor="highlighted" className="text-right">
                      Highlight Listing
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="highlighted"
                        defaultChecked={selectedPractice?.highlighted || false}
                      />
                      <Label htmlFor="highlighted">Featured listing</Label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-lg mb-3">Interest & Inquiries</h4>
                  
                  <div className="space-y-4">
                    {(selectedPractice?.inquiries || []).length > 0 ? (
                      (selectedPractice?.inquiries || []).map((inquiry: any, index: number) => (
                        <div key={index} className="border rounded-md p-3 relative">
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <p className="text-sm font-medium">Name</p>
                              <p className="text-sm">{inquiry.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm">{inquiry.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Phone</p>
                              <p className="text-sm">{inquiry.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-sm">{inquiry.date}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm font-medium">Message</p>
                            <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                          </div>
                          
                          <div className="flex gap-2 mt-3 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Contact requested",
                                  description: "This would allow you to contact the interested party in a real implementation.",
                                });
                              }}
                            >
                              Contact
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Marked as contacted",
                                  description: "This would mark the inquiry as contacted in a real implementation.",
                                });
                              }}
                            >
                              Mark as Contacted
                            </Button>
                          </div>
                          
                          {inquiry.contacted && (
                            <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                              Contacted
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No interest or inquiries for this listing yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPracticeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Get basic information values
                  const practiceName = (document.getElementById('practice-name') as HTMLInputElement).value;
                  const location = (document.getElementById('location') as HTMLInputElement).value;
                  const aum = (document.getElementById('aum') as HTMLInputElement).value;
                  const revenue = (document.getElementById('revenue') as HTMLInputElement).value;
                  const clients = (document.getElementById('clients') as HTMLInputElement).value;
                  
                  // Get the type value from select component
                  const typeValue = document.querySelector('#type [data-radix-select-value-name]');
                  const type = typeValue ? typeValue.textContent || 'Full Service' : 'Full Service';
                  
                  // Get the status value from select component
                  const statusValue = document.querySelector('#status [data-radix-select-value-name]');
                  const status = statusValue ? statusValue.textContent || 'Active' : 'Active';
                  
                  // Get description
                  const description = (document.getElementById('description') as HTMLTextAreaElement).value;
                  
                  // Get practice details values
                  const established = (document.getElementById('established') as HTMLInputElement).value;
                  const clientAvgAge = (document.getElementById('clientAvgAge') as HTMLInputElement).value;
                  const investmentStyle = (document.getElementById('investmentStyle') as HTMLInputElement).value;
                  const feeStructure = (document.getElementById('feeStructure') as HTMLInputElement).value;
                  const growthRate = (document.getElementById('growthRate') as HTMLInputElement).value;
                  const clientRetentionRate = (document.getElementById('clientRetentionRate') as HTMLInputElement).value;
                  
                  // Get sale terms values
                  const askingPrice = (document.getElementById('askingPrice') as HTMLInputElement).value;
                  const transitionPeriod = (document.getElementById('transitionPeriod') as HTMLInputElement).value;
                  const sellerMotivation = (document.getElementById('sellerMotivation') as HTMLInputElement).value;
                  
                  // Get key features values - check if switch is checked
                  const highlightedSwitch = document.getElementById('highlighted') as HTMLInputElement;
                  const highlighted = highlightedSwitch?.checked || false;
                  
                  // Parse tags from comma-separated string to array
                  const tagsInput = (document.getElementById('tags') as HTMLInputElement)?.value || '';
                  const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                  
                  // Create updated practice object
                  const updatedPractice = {
                    ...selectedPractice,
                    title: practiceName,
                    name: practiceName, // For compatibility
                    location,
                    aum,
                    revenue,
                    clients,
                    type,
                    status,
                    description,
                    highlighted,
                    // Detailed fields
                    established,
                    clientAvgAge,
                    investmentStyle,
                    feeStructure,
                    growthRate,
                    clientRetentionRate,
                    askingPrice,
                    transitionPeriod,
                    sellerMotivation,
                    tags
                  };
                  
                  console.log("Saving practice:", updatedPractice);
                  
                  // This would normally save to the backend
                  toast({
                    title: selectedPractice ? "Listing updated" : "Listing created",
                    description: "The practice listing has been saved with all fields.",
                  });
                  
                  // Update practice in local state
                  if (selectedPractice) {
                    setPracticeListings(prev => 
                      prev.map(p => p.id === selectedPractice.id ? updatedPractice : p)
                    );
                  } else {
                    // Add new practice with a temporary ID
                    const newPractice = {
                      ...updatedPractice,
                      id: Date.now(), // Temporary ID
                      inquiries: []
                    };
                    setPracticeListings(prev => [...prev, newPractice]);
                  }
                  
                  setIsPracticeDialogOpen(false);
                }}>
                  {selectedPractice ? "Save Changes" : "Add Listing"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="firms">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Firm Deals</CardTitle>
                  <CardDescription>
                    Manage firm deal terms that power the compensation calculator
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleAddNew('deal')}
                >
                  <PlusCircleIcon size={16} />
                  Add New Firm
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="firm-filter">Filter by Firm:</Label>
                  <Select value={firmFilter} onValueChange={setFirmFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Firms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Firms</SelectItem>
                      {uniqueFirms.map(firm => (
                        <SelectItem key={firm} value={firm}>{firm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    placeholder="Search firms..." 
                    className="w-[250px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firm</TableHead>
                      <TableHead className="text-right">Upfront %</TableHead>
                      <TableHead className="text-right">Backend %</TableHead>
                      <TableHead className="text-right">Total Deal %</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeals.map(deal => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.firm}</TableCell>
                        <TableCell className="text-right">
                          {deal.upfrontMin === deal.upfrontMax
                            ? `${deal.upfrontMin.toFixed(2)}%`
                            : `${deal.upfrontMin.toFixed(2)}% - ${deal.upfrontMax.toFixed(2)}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          {deal.backendMin === deal.backendMax
                            ? `${deal.backendMin.toFixed(2)}%`
                            : `${deal.backendMin.toFixed(2)}% - ${deal.backendMax.toFixed(2)}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          {deal.totalDealMin === deal.totalDealMax
                            ? `${deal.totalDealMin.toFixed(2)}%`
                            : `${deal.totalDealMin.toFixed(2)}% - ${deal.totalDealMax.toFixed(2)}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingDeal(deal);
                                setEditingParameter(null);
                                setIsDialogOpen(true);
                              }}
                            >
                              <PencilIcon size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: "Delete not implemented",
                                  description: "This would delete the firm deal in a real implementation.",
                                });
                              }}
                            >
                              <Trash2Icon size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Calculation Parameters</CardTitle>
                  <CardDescription>
                    Manage the parameters used in compensation calculations
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleAddNew('parameter')}
                >
                  <PlusCircleIcon size={16} />
                  Add New Parameter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="param-firm-filter">Filter by Firm:</Label>
                  <Select value={firmFilter} onValueChange={setFirmFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Firms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Firms</SelectItem>
                      {uniqueFirms.map(firm => (
                        <SelectItem key={firm} value={firm}>{firm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    placeholder="Search parameters..." 
                    className="w-[250px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firm</TableHead>
                      <TableHead>Parameter Name</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParameters.map(param => (
                      <TableRow key={param.id}>
                        <TableCell className="font-medium">{param.firm}</TableCell>
                        <TableCell>{param.paramName}</TableCell>
                        <TableCell className="text-right">{param.paramValue.toFixed(2)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {param.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingDeal(null);
                                setEditingParameter(param);
                                setIsDialogOpen(true);
                              }}
                            >
                              <PencilIcon size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: "Delete not implemented",
                                  description: "This would delete the parameter in a real implementation.",
                                });
                              }}
                            >
                              <Trash2Icon size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Firm Profiles</CardTitle>
                  <CardDescription>
                    Manage company profiles, CEO information, and logos
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingProfile(null);
                    setIsProfileDialogOpen(true);
                  }}
                >
                  <PlusCircleIcon size={16} />
                  Add New Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="profile-firm-filter">Filter by Firm:</Label>
                  <Select value={firmFilter} onValueChange={setFirmFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Firms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Firms</SelectItem>
                      {uniqueFirms.map(firm => (
                        <SelectItem key={firm} value={firm}>{firm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    placeholder="Search profiles..." 
                    className="w-[250px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {firmProfiles
                  .filter(profile => {
                    const matchesFirm = firmFilter === "all" || profile.firm === firmFilter;
                    const matchesSearch = !searchQuery || 
                      profile.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      profile.ceo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (typeof profile.bio === 'string' ? profile.bio.toLowerCase().includes(searchQuery.toLowerCase()) : 
                      profile.bio?.value ? profile.bio.value.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
                      profile.headquarters.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    return matchesFirm && matchesSearch;
                  })
                  .map(profile => (
                    <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-2">
                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
                        {profile.logoUrl ? (
                          <img 
                            src={profile.logoUrl} 
                            alt={`${profile.firm} logo`} 
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <Building2Icon className="h-24 w-24 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setEditingProfile(profile);
                              setIsProfileDialogOpen(true);
                            }}
                          >
                            <PencilIcon size={14} />
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{profile.firm}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1 rounded-full h-8 w-8 p-0"
                            onClick={() => {
                              setEditingProfile(profile);
                              setIsProfileDialogOpen(true);
                            }}
                          >
                            <PencilIcon size={16} />
                            <span className="sr-only">Edit Profile</span>
                          </Button>
                        </div>
                        <CardDescription>
                          CEO: {profile.ceo || 'Not specified'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="mb-2">
                          <span className="font-medium">Founded:</span> {profile.founded || 'N/A'}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Headquarters:</span> {profile.headquarters || 'N/A'}
                        </div>
                        <div className="line-clamp-3 text-muted-foreground text-xs">
                          {typeof profile.bio === 'string' 
                            ? profile.bio 
                            : profile.bio?.value || profile.bio?.state === 'error' 
                              ? 'Error loading bio information.' 
                              : 'No company description available.'}
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 flex justify-center">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 w-full"
                          onClick={() => {
                            setEditingProfile(profile);
                            setIsProfileDialogOpen(true);
                          }}
                        >
                          <PencilIcon size={14} />
                          Edit {profile.firm} Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
              
              {firmProfiles.length === 0 && (
                <div className="text-center py-10">
                  <Building2Icon className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No firm profiles found</h3>
                  <p className="mt-1 text-muted-foreground">
                    Get started by adding a new firm profile.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDeal ? "Edit Firm Deal" : 
               editingParameter ? "Edit Parameter" : 
               activeTab === "firms" ? "Add New Firm Deal" : "Add New Parameter"}
            </DialogTitle>
            <DialogDescription>
              {editingDeal ? "Update the deal terms for this firm" : 
               editingParameter ? "Update calculation parameter" : "Add new item to the database"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Form for firm deals */}
            {(editingDeal || (!editingParameter && activeTab === "firms")) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firm">Firm Name</Label>
                  <Input 
                    id="firm" 
                    value={formFirm}
                    onChange={(e) => setFormFirm(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upfrontMin">Upfront Min %</Label>
                    <Input 
                      id="upfrontMin" 
                      type="number"
                      value={formUpfrontMin}
                      onChange={(e) => setFormUpfrontMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upfrontMax">Upfront Max %</Label>
                    <Input 
                      id="upfrontMax" 
                      type="number"
                      value={formUpfrontMax}
                      onChange={(e) => setFormUpfrontMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backendMin">Backend Min %</Label>
                    <Input 
                      id="backendMin" 
                      type="number"
                      value={formBackendMin}
                      onChange={(e) => setFormBackendMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backendMax">Backend Max %</Label>
                    <Input 
                      id="backendMax" 
                      type="number"
                      value={formBackendMax}
                      onChange={(e) => setFormBackendMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalDealMin">Total Deal Min %</Label>
                    <Input 
                      id="totalDealMin" 
                      type="number"
                      value={formTotalDealMin}
                      onChange={(e) => setFormTotalDealMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalDealMax">Total Deal Max %</Label>
                    <Input 
                      id="totalDealMax" 
                      type="number"
                      value={formTotalDealMax}
                      onChange={(e) => setFormTotalDealMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Form for parameters */}
            {(editingParameter || (!editingDeal && activeTab === "parameters")) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firm">Firm Name</Label>
                  <Input 
                    id="firm" 
                    value={formFirm}
                    onChange={(e) => setFormFirm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paramName">Parameter Name</Label>
                  <Input 
                    id="paramName" 
                    value={formParamName}
                    onChange={(e) => setFormParamName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paramValue">Value</Label>
                  <Input 
                    id="paramValue" 
                    type="number"
                    value={formParamValue}
                    onChange={(e) => setFormParamValue(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Firm Profile Dialog */}
      <FirmProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        profile={editingProfile}
        onSave={(profile) => {
          toast({
            title: "Saving profile...",
            description: `Updating ${profile.firm} profile with the latest changes.`,
          });
          
          // Simulate API save with a short delay to make it feel more realistic
          setTimeout(() => {
            toast({
              title: "Profile saved successfully",
              description: `The profile for ${profile.firm} has been updated.`,
            });
            
            // In a real implementation, this would update the profile in the database
            refetchProfiles();
          }, 800);
        }}
      />

      {/* AI Blog Generator Dialog */}
      <Dialog open={isAiBlogGeneratorOpen} onOpenChange={setIsAiBlogGeneratorOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Generate Blog Article with AI</DialogTitle>
            <DialogDescription>
              Use AI to generate blog content from an existing article URL and add your custom instructions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AiBlogGenerator 
              onContentGenerated={(generatedContent) => {
                // Create a new blog post with the generated content
                const newBlogPost = {
                  id: `ai-generated-${Date.now()}`,
                  title: generatedContent.title,
                  content: generatedContent.content,
                  excerpt: generatedContent.excerpt,
                  author: "AI Assistant",
                  date: new Date().toLocaleDateString(),
                  category: "industry-trends",
                  tags: ["ai-generated", "finance", "advisor"],
                  published: false,
                  imageUrl: generatedContent.imageUrl // Add the AI-generated image URL
                };
                
                // Set as the selected blog post and open the editor
                setSelectedBlogPost(newBlogPost);
                setIsAiBlogGeneratorOpen(false);
                setIsBlogDialogOpen(true);
                
                // Show different toast based on whether an image was generated
                toast({
                  title: generatedContent.imageUrl ? "Content and image generated" : "Content generated",
                  description: "AI-generated blog content is ready for editing",
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}