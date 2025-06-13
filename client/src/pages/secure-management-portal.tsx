import React, { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getMockPracticeListings } from "@/data/mockPracticeListings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Loader2, LogOut, User, Database, LayoutDashboard, Newspaper, ListChecks, 
  ShoppingCart, Globe, Settings, Bookmark, BarChart, Calculator, RefreshCw, 
  AlertCircle, Sparkles, Bot, Wand2, Trash2, FileText, X, Mail, Badge,
  Search, Code, Plus, Copy, CreditCard, Key, Send, Store, Frown,
  Building2, Phone, AtSign, PersonStanding, ShieldCheck, Edit, Eye, Share2,
  Calendar, CalendarIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator"; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Link, useLocation, Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// AI Blog Generator component with OpenAI integration
const AiBlogGenerator = ({ 
  onContentGenerated, 
  defaultInstructions = "Completely rewrite it. Unique. Search Google for more backstory. Format properly for rich-text editor. Make it a tad longer. Open and informative tone.", 
  publishByDefault = false 
}: { 
  onContentGenerated: (content: any) => void;
  defaultInstructions?: string;
  publishByDefault?: boolean;
}) => {
  const [articleUrl, setArticleUrl] = useState("");
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Update instructions when defaultInstructions prop changes
  useEffect(() => {
    setInstructions(defaultInstructions);
  }, [defaultInstructions]);

  const generateContent = async () => {
    if (!articleUrl) {
      setError("Please enter an article URL");
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      
      // Make API call to generate content
      const response = await fetch("/api/posts/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleUrl,
          instructions,
          publishByDefault // Include this option from settings
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }

      const generatedContent = await response.json();
      
      // Pass the generated content to parent component
      onContentGenerated(generatedContent);
      
      toast({
        title: "Content Generated Successfully",
        description: "AI-generated content is now ready for editing",
      });
    } catch (err: any) {
      console.error("Error generating content:", err);
      setError(err.message || "Failed to generate content. Please try again.");
      
      toast({
        title: "Generation Failed",
        description: err.message || "An error occurred while generating content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Article URL</label>
        <input 
          value={articleUrl}
          onChange={(e) => setArticleUrl(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="https://example.com/article"
          disabled={isGenerating}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Custom Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="Add instructions for AI generation (tone, style, length, audience, etc.)"
          disabled={isGenerating}
        />
      </div>
      
      <Button 
        onClick={generateContent}
        className="w-full"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Content...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </>
        )}
      </Button>
    </div>
  );
};

export default function SecureAdminPortal() {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Admin panel UI state
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedBlogPost, setSelectedBlogPost] = useState<any>(null);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isAiBlogGeneratorOpen, setIsAiBlogGeneratorOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [savingAiSettings, setSavingAiSettings] = useState(false);
  
  // Blog filtering and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [postStatus, setPostStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(30); // 30 posts per page as requested
  
  // Practice listing state
  const [selectedPracticeListing, setSelectedPracticeListing] = useState<any>(null);
  const [isPracticeListingModalOpen, setIsPracticeListingModalOpen] = useState(false);
  const [selectedListingInquiries, setSelectedListingInquiries] = useState<any[]>([]);
  const [isInquiriesModalOpen, setIsInquiriesModalOpen] = useState(false);
  
  // Blog editing state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("industry-trends");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date());
  
  // Firm editing state
  const [editingFirm, setEditingFirm] = useState<any>(null);
  const [isEditingFirm, setIsEditingFirm] = useState(false);
  const [firmName, setFirmName] = useState("");
  const [firmDescription, setFirmDescription] = useState("");
  const [firmCeo, setFirmCeo] = useState("");
  const [firmHeadquarters, setFirmHeadquarters] = useState("");
  const [firmFounded, setFirmFounded] = useState("");
  const [firmCategory, setFirmCategory] = useState("");
  
  // Calculator formula editing state
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [formulaFirm, setFormulaFirm] = useState("");
  const [formulaName, setFormulaName] = useState("");
  const [formulaValue, setFormulaValue] = useState("");
  
  // User editing state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userUsername, setUserUsername] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [userActive, setUserActive] = useState(true);
  const [userPhone, setUserPhone] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userState, setUserState] = useState("");
  const [userFirm, setUserFirm] = useState("");
  const [userAum, setUserAum] = useState("");
  const [userRevenue, setUserRevenue] = useState("");
  const [userFeeBasedPercentage, setUserFeeBasedPercentage] = useState("");
  const [userEmailVerified, setUserEmailVerified] = useState(true);
  const [userSubscriptionId, setUserSubscriptionId] = useState("");
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  // Settings state
  const [systemSettings, setSystemSettings] = useState({
    enableUserRegistration: true,
    enablePublicListings: true,
    enableBlogModule: true,
    requireEmailVerification: true,
    autoApproveListings: false,
    autoPublishBlogs: false,
    maintenanceMode: false,
    siteName: "Financial Axis",
    contactEmail: "support@financialaxis.com",
    maxUploadFileSize: 5, // in MB
    logoLightMode: "/images/logo-light.svg", // Logo for light mode
    logoDarkMode: "/images/logo-dark.svg", // Logo for dark mode
    defaultUserRole: "basic"
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    enableEmailNotifications: true,
    defaultFromEmail: "notifications@financialaxis.com",
    emailSignature: "<p>The Financial Axis Team</p>",
    sendWelcomeEmail: true,
    adminNotificationEmails: "admin@financialaxis.com"
  });
  
  // SEO settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Financial Axis - Financial Professional Marketplace",
    metaDescription: "Connect with top financial professionals and practices for sale",
    ogImage: "/images/og-default.jpg",
    enableSocialSharing: true,
    googleAnalyticsId: "",
    sitemapEnabled: true
  });
  
  // AI settings
  const [aiSettings, setAiSettings] = useState({
    defaultBlogInstructions: "Completely rewrite it. Unique. Search Google for more backstory. Format properly for rich-text editor. Make it a tad longer. Open and informative tone.",
    autoGenerateTags: true,
    defaultCategory: "industry-trends",
    publishByDefault: false,
    maxGeneratedLength: 1000
  });
  
  // API settings
  const [apiSettings, setApiSettings] = useState({
    enableApiAccess: false,
    maxApiRequestsPerMinute: 60,
    allowCors: false,
    requireApiKeys: true
  });
  
  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // Authentication check - proper security is enforced
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log("Checking authentication status...");
        
        // Use the dedicated admin status endpoint
        const response = await fetch('/api/admin-auth/status', {
          method: 'GET',
          credentials: 'include' // send the session cookie
        });
        
        const data = await response.json();
        console.log("Admin auth status:", data);
        
        if (response.ok && data.authenticated) {
          console.log("Admin authenticated via status endpoint");
          setUser({
            id: 0,
            username: 'Administrator',
            isAdmin: true
          });
          setLoading(false);
          return;
        } else {
          // If not authenticated, redirect to login
          console.log("Not authenticated as admin - redirecting to login");
          toast({
            title: "Authentication Required",
            description: "Please login with your admin credentials",
          });
          
          setTimeout(() => {
            window.location.href = '/admin-login';
          }, 1000);
          return;
        }
      } catch (err: any) {
        console.error("Admin portal error:", err);
        
        // Show error toast
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin credentials. Redirecting to login.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          window.location.href = '/admin-login';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      setLocation('/admin-login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };
  
  // Save AI Settings 
  const saveAiSettings = async () => {
    try {
      setSavingAiSettings(true);
      
      // First get the CSRF token by making a GET request
      const tokenResponse = await fetch('/api/admin/csrf-token', {
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        throw new Error("Failed to get CSRF token");
      }
      
      const { csrfToken } = await tokenResponse.json();
      
      // Now make the actual settings API call with the token
      const response = await fetch('/api/admin/settings/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(aiSettings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save AI settings: ${response.statusText}`);
      }
      
      // Log activity for this important change
      await fetch('/api/admin/activity-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update',
          entityType: 'setting',
          entityId: 'ai-settings',
          details: 'Updated AI content generation settings'
        }),
      });
      
      toast({
        title: "Settings Saved",
        description: "AI content generation settings have been updated successfully",
      });
      
      // Add to local storage as a backup
      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
      
    } catch (error: any) {
      console.error("Error saving AI settings:", error);
      
      // Even if API fails, save to localStorage as a backup
      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
      
      toast({
        title: "Settings Saved Locally",
        description: "AI settings were saved to your browser. Server sync failed: " + (error.message || "Unknown error"),
        variant: "default",
      });
    } finally {
      setSavingAiSettings(false);
    }
  };

  // Data fetching queries
  
  // Fetch blog posts - Using both admin and public endpoints for maximum data
  const { data: blogPosts, isLoading: isLoadingBlogPosts, refetch: refetchBlogs } = useQuery({
    queryKey: ['/api/admin/blog-posts'],
    queryFn: async () => {
      try {
        // First try the admin endpoint
        const adminResponse = await fetch('/api/admin/blog-posts', {
          credentials: 'include',
        });
        
        // If admin endpoint fails, try the public endpoint
        if (!adminResponse.ok) {
          console.log("Admin blog posts endpoint failed, trying public endpoint");
          const publicResponse = await fetch('/api/blog/posts', {
            credentials: 'include',
          });
          
          if (!publicResponse.ok) {
            console.error("Both blog post endpoints failed");
            return { posts: [], count: 0, published: 0, drafts: 0 };
          }
          
          const posts = await publicResponse.json();
          console.log("Fetched blog posts from public endpoint:", posts);
          return processBlogPosts(posts);
        }
        
        const posts = await adminResponse.json();
        console.log("Fetched blog posts from admin endpoint:", posts);
        return processBlogPosts(posts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        return { posts: [], count: 0, published: 0, drafts: 0 };
      }
    },
  });
  
  // Helper function to process blog posts data consistently
  const processBlogPosts = (posts: any) => {
    // Handle different API response formats
    let processedPosts: any[] = [];
    
    if (Array.isArray(posts)) {
      // Direct array format
      processedPosts = posts;
    } else if (posts && Array.isArray(posts.posts)) {
      // Object with posts array
      processedPosts = posts.posts;
    } else if (posts && typeof posts === 'object') {
      // Another format - try to extract any array properties
      const arrayProps = Object.entries(posts)
        .find(([_, value]) => Array.isArray(value));
      
      if (arrayProps) {
        processedPosts = arrayProps[1] as any[];
      }
    }
    
    if (processedPosts.length === 0 && (import.meta.env.DEV || window.location.hostname.includes('replit'))) {
      console.log("No blog posts found in API response");
    }
    
    // Log what we're returning
    const count = processedPosts.length;
    const published = processedPosts.filter((p: any) => p.published).length;
    const drafts = count - published;
    
    console.log(`Processing ${count} blog posts (${published} published, ${drafts} drafts)`);
    
    return { 
      posts: processedPosts, 
      count: count,
      published: published,
      drafts: drafts
    };
  };
  
  // Compute filtered posts based on search, category, and status filters
  const filteredPosts = useMemo(() => {
    if (!blogPosts?.posts) return [];
    
    return blogPosts.posts.filter((post: any) => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = filterCategory === "all" || post.category === filterCategory;
      
      // Filter by status
      const matchesStatus = 
        postStatus === "all" || 
        (postStatus === "published" && post.published) || 
        (postStatus === "drafts" && !post.published);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogPosts?.posts, searchQuery, filterCategory, postStatus]);
  
  // Compute total pages and current page items
  const totalPages = useMemo(() => Math.ceil(filteredPosts.length / postsPerPage), [filteredPosts.length, postsPerPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, postStatus]);
  
  // Get paginated posts for current page
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, postsPerPage]);
  
  // Handle blog post deletion
  const handleDeleteBlogPost = (post: any) => {
    if (window.confirm(`Are you sure you want to delete the blog post: "${post.title}"?`)) {
      fetch(`/api/admin/blog-posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete blog post');
        // Don't try to parse JSON for 204 No Content response
        refetchBlogs();
        toast({
          title: "Blog post deleted",
          description: "The post has been removed successfully",
        });
      })
      .catch(error => {
        console.error('Error deleting blog post:', error);
        toast({
          title: "Deletion failed",
          description: error.message,
          variant: "destructive"
        });
      });
    }
  };

  // Fetch news articles count
  const { data: newsArticles, isLoading: isLoadingNews, refetch: refetchNews } = useQuery({
    queryKey: ['/api/news-articles'],
    queryFn: async () => {
      const response = await fetch('/api/news-articles', {
        credentials: 'include',
      });
      if (!response.ok) {
        return { articles: [], count: 0 };
      }
      
      const articles = await response.json();
      console.log("Fetched news articles:", articles);
      
      // Process actual articles data
      const processedArticles = Array.isArray(articles) ? articles : [];
      
      return { 
        articles: processedArticles, 
        count: processedArticles.length
      };
    },
  });

  // Fetch practice listings - Using both admin and public endpoints for maximum data
  const { data: practiceListings, isLoading: isLoadingListings, refetch: refetchPracticeListings } = useQuery({
    queryKey: ['/api/admin/practice-listings'],
    queryFn: async () => {
      try {
        // First try the admin endpoint
        const adminResponse = await fetch('/api/admin/practice-listings', {
          credentials: 'include',
        });
        
        // If admin endpoint fails, try the public endpoint
        if (!adminResponse.ok) {
          console.log("Admin practice listings endpoint failed, trying public endpoint");
          const publicResponse = await fetch('/api/practice-listings', {
            credentials: 'include',
          });
          
          if (!publicResponse.ok) {
            console.error("Both practice listing endpoints failed");
            return { listings: [], count: 0, pending: 0 };
          }
          
          const listings = await publicResponse.json();
          console.log("Fetched practice listings from public endpoint:", listings);
          return processListings(listings);
        }
        
        const listings = await adminResponse.json();
        console.log("Fetched practice listings from admin endpoint:", listings);
        
        // Process any response even if empty
        if (!Array.isArray(listings) && 
            (!listings || 
             (listings && !Array.isArray(listings.listings)))) {
          console.log("Invalid listings format from API");
          return { listings: [], count: 0, pending: 0 };
        }
        
        return processListings(listings);
      } catch (error) {
        console.error("Error fetching practice listings:", error);
        return { listings: [], count: 0, pending: 0 };
      }
    },
  });
  
  // Helper function to process listings data consistently
  const processListings = (listings: any) => {
    // Handle different API response formats
    let processedListings: any[] = [];
    
    if (Array.isArray(listings)) {
      // Direct array format
      processedListings = listings;
    } else if (listings && Array.isArray(listings.listings)) {
      // Object with listings array
      processedListings = listings.listings;
    } else if (listings && typeof listings === 'object') {
      // Another format - try to extract any array properties
      const arrayProps = Object.entries(listings)
        .find(([_, value]) => Array.isArray(value));
      
      if (arrayProps) {
        processedListings = arrayProps[1] as any[];
      }
    }
    
    // Ensure we always have the expected properties
    const count = processedListings.length;
    const pending = processedListings.filter((l: any) => 
      l.status === 'pending' || l.status === 'review').length;
    
    // Log what we're returning
    console.log(`Processing ${count} practice listings (${pending} pending)`);
    
    return { 
      listings: processedListings, 
      count: count,  // Make sure this is always a number
      pending: pending
    };
  };

  // Fetch user count
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        return { users: [], count: 0, newThisWeek: 0 };
      }
      
      const usersData = await response.json();
      console.log("Fetched users data:", usersData);
      
      // Process actual users data
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const processedUsers = Array.isArray(usersData) ? usersData : [];
      const count = processedUsers.length;
      const newThisWeek = processedUsers.filter((u: any) => {
        if (!u.createdAt) return false;
        const createdDate = new Date(u.createdAt);
        return createdDate > oneWeekAgo;
      }).length;
      
      return { 
        users: processedUsers, 
        count: count,  // Make sure this is always a number
        newThisWeek: newThisWeek
      };
    },
  });

  // Fetch firm profiles
  const { data: firmProfiles, isLoading: isLoadingFirmProfiles, refetch: refetchFirmProfiles } = useQuery({
    queryKey: ['/api/firm-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/firm-profiles', {
        credentials: 'include',
      });
      if (!response.ok) {
        return { profiles: [], count: 0 };
      }
      
      const profiles = await response.json();
      console.log("Fetched firm profiles:", profiles);
      
      const processedProfiles = Array.isArray(profiles) ? profiles : [];
      
      return { 
        profiles: processedProfiles, 
        count: processedProfiles.length
      };
    },
  });

  // Fetch calculator formulas
  const { data: calculatorFormulas, isLoading: isLoadingFormulas, refetch: refetchCalculatorFormulas } = useQuery({
    queryKey: ['/api/firm-parameters'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/firm-parameters', {
          credentials: 'include',
        });
        if (!response.ok) {
          console.error("Error fetching calculator formulas:", response.statusText);
          return { parameters: [], count: 0 };
        }
        
        const parameters = await response.json();
        console.log("Fetched calculator formulas:", parameters);
        
        // Process actual parameters data - ensure we have an array even if API returns something else
        const processedParameters = Array.isArray(parameters) ? parameters : [];
        
        return { 
          parameters: processedParameters, 
          count: processedParameters.length
        };
      } catch (error) {
        console.error("Failed to fetch calculator formulas:", error);
        // Return safe defaults that won't cause rendering errors
        return { parameters: [], count: 0 };
      }
    },
  });

  // Fetch recent activity logs
  const { data: activityLogs, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/activity-logs'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/activity-logs?limit=5', {
          credentials: 'include',
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
      
      // Return empty array if no logs available
      return [];
    },
  });

  // Utility functions
  const getActivityColorClass = (type: string) => {
    switch (type) {
      case 'blog':
      case 'published':
      case 'approved':
      case 'active': 
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900';
      case 'listing':
      case 'pending':
      case 'awaiting': 
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900';
      case 'user':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900';
      case 'system':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700';
      case 'error':
      case 'rejected':
      case 'deleted':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  const formatTimeSince = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  // Menu items for the admin sidebar
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-2" />, path: "/secure-management-portal", id: "dashboard" },
    { name: "Blog Posts", icon: <Newspaper className="h-5 w-5 mr-2" />, path: "/cms-dashboard", id: "blog" },
    { name: "Practice Listings", icon: <ListChecks className="h-5 w-5 mr-2" />, path: "/practice-listings-admin", id: "listings" },
    { name: "Firm Profiles", icon: <Database className="h-5 w-5 mr-2" />, path: "/firm-profiles-admin", id: "firms" },
    { name: "Calculator Formulas", icon: <Calculator className="h-5 w-5 mr-2" />, path: "/calculator-admin", id: "calculator" },
    { name: "Website Pages", icon: <Globe className="h-5 w-5 mr-2" />, path: "/pages-admin", id: "pages" },
    { name: "Landing Pages", icon: <Bookmark className="h-5 w-5 mr-2" />, path: "/landing-pages-admin", id: "landing" },
    { name: "User Management", icon: <User className="h-5 w-5 mr-2" />, path: "/user-management", id: "users" },
    { name: "Settings", icon: <Settings className="h-5 w-5 mr-2" />, path: "/admin-settings", id: "settings" },
  ];

  // Handle blog post editing
  const handleEditBlogPost = (post: any) => {
    setSelectedBlogPost(post);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt || '');
    setFeaturedImage(post.featuredImage || '');
    setCategory(post.category || 'industry-trends');
    // Parse tags if they are stored as a JSON string
    if (post.tags) {
      try {
        const parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
        setTags(Array.isArray(parsedTags) ? parsedTags : []);
      } catch (e) {
        console.error('Error parsing tags:', e);
        setTags([]);
      }
    } else {
      setTags([]);
    }
    setIsPublished(post.published || false);
    setIsBlogDialogOpen(true);
  };

  const handleNewBlogPost = () => {
    setSelectedBlogPost(null);
    setTitle('');
    setContent('');
    setExcerpt('');
    setFeaturedImage('');
    setCategory('industry-trends');
    setTags([]);
    setIsPublished(false);
    setIsBlogDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin-login" />;
  }

  // Main admin portal layout with WordPress-style sidebar
  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar with WordPress-style navigation */}
      <aside className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="text-xl font-medium">Management Portal</div>
          <p className="text-xs text-muted-foreground mt-1">Content management system</p>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = selectedTab === item.id;
              return (
                <li key={item.id}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setSelectedTab(item.id)}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-64 border-t p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost" 
              size="sm"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {/* Top header bar */}
        <header className="bg-card shadow-sm z-10 border-b">
          <div className="px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
            <div className="flex">
              <div className="text-xl font-medium">
                {menuItems.find(item => item.id === selectedTab)?.name || "Dashboard"}
              </div>
            </div>
            
            {/* Development mode indicator */}
            {(import.meta.env.DEV || window.location.hostname.includes('replit')) && (
              <div className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                Development Mode
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Tab content based on selection */}
        <div className="p-6">
          {selectedTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingUsers ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        // Show the real count from database
                        users?.count || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {!isLoadingUsers && (users?.newThisWeek || 0) > 0 && (
                        <>+{users?.newThisWeek || 0} new this week</>
                      )}
                      {isLoadingUsers && "Counting users..."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingBlogPosts ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        // Show real count from database
                        ((blogPosts?.count !== undefined ? blogPosts.count : 
                          blogPosts?.posts?.length || 0) + 
                         (newsArticles?.count || 0))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {!isLoadingBlogPosts ? (
                        <>{blogPosts?.published || 0} published, {blogPosts?.drafts || 0} drafts</>
                      ) : (
                        "Loading blog posts..."
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Practice Listings</CardTitle>
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingListings ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        // Show real count from database
                        (practiceListings?.count !== undefined ? practiceListings.count :
                         practiceListings?.listings?.length || 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {!isLoadingListings ? (
                        <>{practiceListings?.pending || 0} pending review</>
                      ) : (
                        "Loading listings..."
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Firm Profiles</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingFirmProfiles ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        // Show real count from database
                        (firmProfiles?.count !== undefined ? firmProfiles.count :
                         firmProfiles?.profiles?.length || 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Master firm database
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest system activity and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs?.map((log: any, i: number) => (
                        <div 
                          key={i} 
                          className={`rounded-lg border p-3 text-sm ${getActivityColorClass(log.type)} hover:opacity-90 cursor-pointer transition-opacity`}
                          onClick={() => {
                            // Navigate to the appropriate tab when clicked
                            if (log.type) {
                              // Map types to tabs
                              const typeToTab = {
                                'blog': 'blog',
                                'listing': 'listings',
                                'user': 'users',
                                'firm': 'firms',
                                'calculator': 'calculator'
                              };
                              
                              const targetTab = typeToTab[log.type] || 'dashboard';
                              setSelectedTab(targetTab);
                              
                              // Display toast to confirm navigation
                              toast({
                                title: `Navigated to ${menuItems.find(item => item.id === targetTab)?.name || targetTab}`,
                                description: log.id ? `Viewing details for item ${log.id}` : "Viewing section overview",
                              });
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <p>{log.message}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ml-2 ${
                              log.type === 'blog' ? 'bg-green-100 text-green-800' :
                              log.type === 'listing' ? 'bg-amber-100 text-amber-800' :
                              log.type === 'user' ? 'bg-blue-100 text-blue-800' :
                              log.type === 'firm' ? 'bg-purple-100 text-purple-800' :
                              log.type === 'calculator' ? 'bg-cyan-100 text-cyan-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {log.type === 'blog' ? 'Blog' :
                               log.type === 'listing' ? 'Listing' :
                               log.type === 'user' ? 'User' :
                               log.type === 'firm' ? 'Firm' :
                               log.type === 'calculator' ? 'Calc' :
                               log.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs flex justify-between">
                            <span className="opacity-70">{formatTimeSince(log.timestamp)}</span>
                            <span className="text-xs underline opacity-70">View details</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Development mode notice */}
              {(import.meta.env.DEV || window.location.hostname.includes('replit')) && (
                <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                  <CardHeader>
                    <CardTitle className="text-amber-800 dark:text-amber-400">Development Mode Active</CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-500">
                      Development mode is active, but authentication security is enforced
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-amber-700 dark:text-amber-500">
                    <p className="font-medium">In development mode:</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Authentication checks are properly enforced on server-side endpoints</li>
                      <li>TOTP setup and verification are required for admin access</li>
                      <li>Full security features are active at all times</li>
                      <li>Session persistence is handled through secure server-side sessions</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedTab === "blog" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">Blog Posts Management</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setIsAiBlogGeneratorOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Generate with AI
                  </Button>
                  <Button 
                    onClick={handleNewBlogPost}
                  >
                    New Blog Post
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="grid" onValueChange={(value) => {
                // Remember the view preference
                localStorage.setItem('blogViewType', value);
              }}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search blog posts..."
                      className="w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select 
                      value={filterCategory} 
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="industry-trends">Industry Trends</SelectItem>
                        <SelectItem value="market-updates">Market Updates</SelectItem>
                        <SelectItem value="practice-management">Practice Management</SelectItem>
                        <SelectItem value="moves">Moves</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="wealth-management">Wealth Management</SelectItem>
                        <SelectItem value="advisor-insights">Advisor Insights</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('all');
                        refetchBlogs();
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <Select 
                    value={postStatus} 
                    onValueChange={(value) => {
                      setPostStatus(value);
                      let status = value === 'all' ? 'all' : value;
                      toast({
                        title: `Showing ${status} posts`,
                        description: "Filtered posts by status"
                      });
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Post status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="drafts">Drafts</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="text-sm text-muted-foreground">
                    {!isLoadingBlogPosts && blogPosts?.posts ? (
                      <span>
                        {filteredPosts.length > 0 ? 
                          `Showing ${Math.min(currentPage * postsPerPage, filteredPosts.length)} of ${filteredPosts.length} posts` :
                          "No posts match your filter criteria"}
                      </span>
                    ) : null}
                  </div>
                </div>
                
                <TabsContent value="grid" className="mt-4">
                  {isLoadingBlogPosts ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPosts.length > 0 ? (
                          paginatedPosts.map((post: any) => (
                          <Card key={post.id} className="overflow-hidden">
                            {post.imageUrl && (
                              <div className="aspect-video w-full overflow-hidden">
                                <img 
                                  src={post.imageUrl} 
                                  alt={post.title} 
                                  className="h-full w-full object-cover transition-all hover:scale-105"
                                />
                              </div>
                            )}
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                {post.published ? (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    Published
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <CardDescription>
                                {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                                {post.category ? ` • ${post.category.replace(/-/g, ' ')}` : ''}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="line-clamp-3 text-sm text-muted-foreground">
                                {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '')}
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditBlogPost(post)}
                              >
                                Edit Post
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteBlogPost(post)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                        ) : (
                          <div className="col-span-3 flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                            <Frown className="h-12 w-12 text-muted-foreground mb-4" />
                            <div className="text-lg font-medium mb-2">No posts found</div>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                              {searchQuery || filterCategory !== 'all' || postStatus !== 'all'
                                ? 'Try adjusting your search filters' 
                                : 'Get started by creating your first blog post'}
                            </p>
                            {!searchQuery && filterCategory === 'all' && postStatus === 'all' && (
                              <Button onClick={handleNewBlogPost}>
                                Create your first post
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Pagination for grid view */}
                      {filteredPosts.length > postsPerPage && (
                        <div className="flex justify-center mt-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="text-sm">
                              Page {currentPage} of {totalPages}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="list" className="mt-4">
                  {isLoadingBlogPosts ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
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
                            {filteredPosts.length > 0 ? (
                              paginatedPosts.map((post: any) => (
                                <TableRow key={post.id}>
                                  <TableCell className="font-medium max-w-[250px] truncate">
                                    <div className="flex items-center gap-2">
                                      {post.featured && (
                                        <UIBadge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                                          Featured
                                        </UIBadge>
                                      )}
                                      <span className="truncate">{post.title}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{post.author}</TableCell>
                                  <TableCell>
                                    <UIBadge variant="secondary" className="capitalize">
                                      {post.category?.replace(/-/g, ' ') || 'Uncategorized'}
                                    </UIBadge>
                                  </TableCell>
                                  <TableCell>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    {post.published ? (
                                      <UIBadge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                        Published
                                      </UIBadge>
                                    ) : (
                                      <UIBadge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                        Draft
                                      </UIBadge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEditBlogPost(post)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteBlogPost(post)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                  <div className="flex flex-col items-center">
                                    <Frown className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-lg font-medium">No blog posts found</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {searchQuery || filterCategory !== 'all' || postStatus !== 'all'
                                        ? 'Try adjusting your search filters' 
                                        : 'Get started by creating your first blog post'}
                                    </p>
                                    {!searchQuery && filterCategory === 'all' && postStatus === 'all' && (
                                      <Button onClick={handleNewBlogPost}>Create Blog Post</Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Pagination for list view */}
                      {filteredPosts.length > postsPerPage && (
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm text-muted-foreground">
                            Showing {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    className="w-9 h-9 p-0 mx-1"
                                    onClick={() => setCurrentPage(pageNum)}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Blog Post Editor Dialog */}
              <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                    <DialogDescription>
                      {selectedBlogPost 
                        ? 'Edit the details of your blog post below' 
                        : 'Fill in the details of your new blog post'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Title</label>
                      <input 
                        className="col-span-3 flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter blog post title"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                      <label className="text-right text-sm font-medium pt-2">Content</label>
                      <div className="col-span-3 border rounded-md" style={{ minHeight: '300px' }}>
                        <ReactQuill 
                          theme="snow"
                          value={content}
                          onChange={setContent}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write your blog post content here..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Excerpt</label>
                      <textarea 
                        className="col-span-3 flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief summary of the post"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Featured Image</label>
                      <div className="col-span-3">
                        {featuredImage ? (
                          <div className="relative">
                            <img 
                              src={featuredImage} 
                              alt="Featured" 
                              className="max-h-[150px] rounded-md object-cover border" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full"
                              onClick={() => setFeaturedImage("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Input
                              type="url"
                              placeholder="Enter image URL or upload..."
                              value={featuredImage}
                              onChange={(e) => setFeaturedImage(e.target.value)}
                              className="flex-1"
                            />
                            <div className="relative">
                              <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFeaturedImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button type="button" variant="outline" className="w-[120px]">
                                Upload Image
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Category</label>
                      <div className="col-span-3">
                        <Select 
                          value={category}
                          onValueChange={(value) => setCategory(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="industry-trends">Industry Trends</SelectItem>
                            <SelectItem value="market-updates">Market Updates</SelectItem>
                            <SelectItem value="practice-management">Practice Management</SelectItem>
                            <SelectItem value="moves">Moves</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="wealth-management">Wealth Management</SelectItem>
                            <SelectItem value="advisor-insights">Advisor Insights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Tags</label>
                      <div className="col-span-3">
                        <Input 
                          type="text" 
                          placeholder="Type a tag and press Enter to add"
                          // No need to set a value for this input as it's just for adding new tags
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const newTag = e.currentTarget.value.trim();
                              if (!tags.includes(newTag)) {
                                setTags([...tags, newTag]);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.map((tag, i) => (
                              <div 
                                key={i}
                                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1"
                              >
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 rounded-full p-0"
                                  onClick={() => setTags(tags.filter((_, index) => index !== i))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Publish Date</label>
                      <div className="col-span-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !publishDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={publishDate}
                              onSelect={setPublishDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Status</label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={isPublished} 
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>Published</span>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBlogDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Prepare the blog post data
                      const blogPostData = {
                        title,
                        content,
                        excerpt,
                        featuredImage,
                        category,
                        // Generate a slug from title if creating a new post
                        slug: selectedBlogPost?.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
                        tags: Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]),
                        published: isPublished,
                        publishDate: publishDate ? publishDate.toISOString() : new Date().toISOString()
                      };

                      // Save or update the blog post
                      if (selectedBlogPost) {
                        // Update existing post
                        fetch(`/api/admin/blog-posts/${selectedBlogPost.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(blogPostData)
                        })
                        .then(response => {
                          if (!response.ok) throw new Error('Failed to update blog post');
                          return response.json();
                        })
                        .then(() => {
                          refetchBlogs();
                          toast({
                            title: "Blog updated",
                            description: "Changes have been saved successfully",
                          });
                        })
                        .catch(error => {
                          console.error('Error updating blog post:', error);
                          toast({
                            title: "Update failed",
                            description: error.message,
                            variant: "destructive"
                          });
                        });
                      } else {
                        // Create new post
                        fetch('/api/admin/blog-posts', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(blogPostData)
                        })
                        .then(response => {
                          if (!response.ok) throw new Error('Failed to create blog post');
                          return response.json();
                        })
                        .then(() => {
                          refetchBlogs();
                          toast({
                            title: "Blog created",
                            description: "New blog post has been created successfully",
                          });
                        })
                        .catch(error => {
                          console.error('Error creating blog post:', error);
                          toast({
                            title: "Creation failed",
                            description: error.message,
                            variant: "destructive"
                          });
                        });
                      }
                      
                      setIsBlogDialogOpen(false);
                    }}>
                      {selectedBlogPost ? 'Update Post' : 'Create Post'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
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
                      defaultInstructions={aiSettings.defaultBlogInstructions}
                      publishByDefault={aiSettings.publishByDefault}
                      onContentGenerated={(generatedContent) => {
                        // Close the generator dialog
                        setIsAiBlogGeneratorOpen(false);
                        
                        // IMPORTANT: Set selectedBlogPost to null to create a new post
                        // instead of updating an existing one
                        setSelectedBlogPost(null);
                        
                        // Open the blog post editor with the generated content
                        setTitle(generatedContent.title || "");
                        setContent(generatedContent.content || "");
                        setExcerpt(generatedContent.excerpt || "");
                        setFeaturedImage(generatedContent.featuredImage || generatedContent.imageUrl || "");
                        setCategory(generatedContent.category || aiSettings.defaultCategory || "industry-trends");
                        setTags(generatedContent.tags || []);
                        // Use the published status from the generated content (controlled by settings)
                        setIsPublished(generatedContent.published || false);
                        // Set the current date (not future date)
                        setPublishDate(new Date());
                        setIsBlogDialogOpen(true);
                        
                        toast({
                          title: "Content ready for editing",
                          description: "AI has generated a draft post based on your requirements",
                        });
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAiBlogGeneratorOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {selectedTab === "listings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">Practice Listings</div>
                <Button>Add New Listing</Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Practice Listings</CardTitle>
                  <CardDescription>
                    Manage practice listings and track interest inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingListings ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : practiceListings?.listings?.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 gap-4 border-b p-4 font-medium">
                        <div>Practice Name</div>
                        <div>Location</div>
                        <div>Revenue</div>
                        <div>Status</div>
                        <div>Inquiries</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {practiceListings.listings.map((listing: any) => (
                        <div key={listing.id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-0 items-center">
                          <div className="font-medium">{listing.practiceName}</div>
                          <div>{listing.location}</div>
                          <div>{listing.revenue.startsWith('$') ? listing.revenue : `$${listing.revenue}`}</div>
                          <div>
                            <span className={
                              listing.status === 'active' 
                                ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs' 
                                : listing.status === 'pending' 
                                  ? 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs'
                                  : 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
                            }>
                              {listing.status}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">{listing.interestCount || 0}</span>
                            {(listing.interestCount > 0) && (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-primary/10 border-transparent bg-muted/50 text-muted-foreground">
                                View
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                fetch(`/api/practice-listing-inquiries/${listing.id}`)
                                  .then(response => {
                                    if (response.ok) return response.json();
                                    return { inquiries: [] };
                                  })
                                  .then(data => {
                                    setSelectedListingInquiries(data.inquiries || []);
                                    setSelectedPracticeListing(listing);
                                    setIsInquiriesModalOpen(true);
                                  })
                                  .catch(error => {
                                    console.error("Error fetching inquiries:", error);
                                    toast({
                                      title: "Error",
                                      description: "Could not load inquiries for this listing",
                                      variant: "destructive"
                                    });
                                  });
                              }}
                            >
                              Inquiries
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Set the selected listing directly without confirmation
                                setSelectedPracticeListing(listing);
                                setIsPracticeListingModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete practice listing: ${listing.practiceName}?`)) {
                                  fetch(`/api/practice-listings/${listing.id}`, {
                                    method: 'DELETE'
                                  })
                                    .then(response => {
                                      if (response.ok) {
                                        // Remove listing from UI
                                        alert(`Deleted practice listing: ${listing.practiceName}`);
                                        // Refresh listings data
                                        refetchPracticeListings();
                                      } else {
                                        throw new Error('Failed to delete practice listing');
                                      }
                                    })
                                    .catch(error => {
                                      console.error("Error deleting practice listing:", error);
                                      alert(`Error: ${error.message}`);
                                    });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ListChecks className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <div className="font-medium mb-1">No Practice Listings Yet</div>
                      <p className="text-sm text-muted-foreground">
                        Create your first practice listing to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === "firms" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">Firm Profiles</div>
                <div className="flex gap-2">
                  <Link href="/firm-intake" className="no-underline">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      Generate with AI
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      // Simple implementation using window.prompt for demonstration
                      const firm = window.prompt("Enter firm name:");
                      if (!firm) return;
                      
                      const description = window.prompt("Enter firm description:");
                      if (!description) return;
                      
                      const headquarters = window.prompt("Enter headquarters location:");
                      const founded = window.prompt("Enter year founded:");
                      const ceo = window.prompt("Enter CEO name:");
                      
                      // Prompt for category with options
                      const categoryPrompt = window.prompt("Enter firm category (Wirehouse, Regional, Independent, or Supported Indy):");
                      const category = categoryPrompt ? categoryPrompt : "";
                      
                      // Create the new firm profile
                      fetch('/api/firm-profiles', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          firm,
                          description,
                          headquarters: headquarters || 'N/A',
                          founded: founded || 'N/A',
                          ceo: ceo || 'N/A',
                          category: category || '',
                          services: []
                        })
                      })
                        .then(response => {
                          if (response.ok) {
                            return response.json();
                          }
                          throw new Error('Failed to create new firm profile');
                        })
                        .then(data => {
                          console.log("New firm profile created:", data);
                          alert(`Created firm profile: ${firm}`);
                          // Refresh the firm profiles data
                          refetchFirmProfiles();
                        })
                        .catch(error => {
                          console.error("Error creating firm profile:", error);
                          alert(`Error: ${error.message}`);
                        });
                    }}
                  >
                    Add New Firm
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Financial Firm Profiles</CardTitle>
                  <CardDescription>
                    Manage firm profiles and AI-generated data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFirmProfiles ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : firmProfiles?.profiles?.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 gap-4 border-b p-4 font-medium">
                        <div>Firm Name</div>
                        <div>CEO</div>
                        <div>Headquarters</div>
                        <div>Founded</div>
                        <div>Category</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {firmProfiles.profiles.map((firm: any) => (
                        <div key={firm.id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-0 items-center">
                          <div className="font-medium">{firm.firm}</div>
                          <div>{firm.ceo || 'Unknown'}</div>
                          <div>{firm.headquarters || 'N/A'}</div>
                          <div>{firm.founded || 'N/A'}</div>
                          <div>
                            {firm.category ? (
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                {firm.category}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                fetch(`/api/firm-profiles/${encodeURIComponent(firm.firm)}`, {
                                  method: 'GET'
                                })
                                  .then(response => {
                                    if (response.ok) {
                                      return response.json();
                                    }
                                    throw new Error('Failed to fetch firm profile');
                                  })
                                  .then(data => {
                                    console.log("Editing firm profile:", data);
                                    // Set the firm editing state
                                    setEditingFirm(data);
                                    setFirmName(data.firm || "");
                                    setFirmDescription(data.bio?.value || "");
                                    setFirmCeo(data.ceo || "");
                                    setFirmHeadquarters(data.headquarters || "");
                                    setFirmFounded(data.founded || "");
                                    setFirmCategory(data.category || "");
                                    // No need for a separate state since we're directly modifying editingFirm.logoUrl
                                    setIsEditingFirm(true);
                                  })
                                  .catch(error => {
                                    console.error("Error editing firm profile:", error);
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive"
                                    });
                                  });
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Open the firm profile detail page in a new tab using the correct route
                                window.open(`/firm-profiles/${firm.id}`, '_blank');
                              }}
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete firm profile: ${firm.firm}?`)) {
                                  fetch(`/api/firm-profiles/${encodeURIComponent(firm.firm)}`, {
                                    method: 'DELETE'
                                  })
                                    .then(response => {
                                      if (response.ok) {
                                        alert(`Deleted firm profile: ${firm.firm}`);
                                        // Refresh the firm profiles data
                                        refetchFirmProfiles();
                                      } else {
                                        throw new Error('Failed to delete firm profile');
                                      }
                                    })
                                    .catch(error => {
                                      console.error("Error deleting firm profile:", error);
                                      alert(`Error: ${error.message}`);
                                    });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <div className="font-medium mb-1">No Firm Profiles Yet</div>
                      <p className="text-sm text-muted-foreground">
                        Create your first firm profile to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === "calculator" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">Calculator Formulas</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to sync calculator formulas with Airtable?")) {
                        // Set a loading state if needed
                        fetch('/api/sync-firm-parameters', {
                          method: 'POST',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        })
                          .then(response => {
                            if (response.ok) {
                              return response.json();
                            }
                            throw new Error('Failed to sync with Airtable');
                          })
                          .then(data => {
                            console.log("Airtable sync complete:", data);
                            alert(`Sync complete: ${data.count || 'No'} parameters updated`);
                            // Refresh the calculator formulas data
                            refetchCalculatorFormulas();
                          })
                          .catch(error => {
                            console.error("Error syncing with Airtable:", error);
                            alert(`Error: ${error.message}`);
                          });
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync with Airtable
                  </Button>
                  <Button
                    onClick={() => {
                      // Simple implementation using window.prompt for demonstration
                      const firm = window.prompt("Enter firm name (e.g., Ameriprise):");
                      if (!firm) return;
                      
                      const paramName = window.prompt("Enter parameter name (e.g., transitionBonus):");
                      if (!paramName) return;
                      
                      const paramValue = window.prompt("Enter parameter value (e.g., 150):");
                      if (!paramValue) return;
                      
                      // Create the new formula parameter
                      fetch('/api/firm-parameters', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          firm,
                          paramName,
                          paramValue
                        })
                      })
                        .then(response => {
                          if (response.ok) {
                            return response.json();
                          }
                          throw new Error('Failed to create new formula parameter');
                        })
                        .then(data => {
                          console.log("New formula parameter created:", data);
                          alert(`Created new formula: ${paramName} for ${firm}`);
                          // Refresh the calculator formulas data
                          refetchCalculatorFormulas();
                        })
                        .catch(error => {
                          console.error("Error creating formula parameter:", error);
                          alert(`Error: ${error.message}`);
                        });
                    }}
                  >
                    Add New Formula
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Formula Parameters by Firm</CardTitle>
                  <CardDescription>
                    Manage calculator formulas synchronized with Airtable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFormulas ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : calculatorFormulas?.parameters?.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 border-b p-4 font-medium">
                        <div>Firm</div>
                        <div>Parameter</div>
                        <div>Value</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {/* Group parameters by firm and display as 1 row per firm */}
                      {Object.values(calculatorFormulas.parameters.reduce((firmGroups: any, param: any) => {
                        // Group parameters by firm
                        if (!firmGroups[param.firm]) {
                          firmGroups[param.firm] = {
                            firm: param.firm,
                            parameters: []
                          };
                        }
                        firmGroups[param.firm].parameters.push(param);
                        return firmGroups;
                      }, {})).map((firmGroup: any) => (
                        <div key={firmGroup.firm} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 items-center">
                          <div className="font-medium">{firmGroup.firm}</div>
                          <div className="text-muted-foreground">
                            {firmGroup.parameters.length} Parameters
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs">
                              View all values
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Find all parameters for this firm
                                const firmParameters = calculatorFormulas.parameters.filter(
                                  (p: any) => p.firm === firmGroup.firm
                                );
                                
                                // Set the firm for editing (we'll show all params in the dialog)
                                setEditingFormula({
                                  firm: firmGroup.firm,
                                  parameters: firmParameters
                                });
                                setFormulaFirm(firmGroup.firm);
                                setIsEditingFormula(true);
                              }}
                            >
                              Edit Parameters
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <div className="font-medium mb-1">No Formulas Configured</div>
                      <p className="text-sm text-muted-foreground">
                        Add calculator parameters or sync with Airtable
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">User Management</div>
                <Button
                  onClick={() => {
                    // Simple implementation using window.prompt for demonstration
                    const username = window.prompt("Enter user email/username:");
                    if (!username) return;
                    
                    const firstName = window.prompt("Enter first name:");
                    if (!firstName) return;
                    
                    const lastName = window.prompt("Enter last name:");
                    if (!lastName) return;
                    
                    const password = window.prompt("Enter password:");
                    if (!password) return;
                    
                    const isAdmin = window.confirm("Is this user an admin?");
                    const isPremium = window.confirm("Is this a premium user?");
                    
                    // Create the new user
                    fetch('/api/admin/users', {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        username,
                        firstName,
                        lastName,
                        password,
                        isAdmin,
                        isPremium,
                        active: true
                      })
                    })
                      .then(response => {
                        if (response.ok) {
                          return response.json();
                        }
                        throw new Error('Failed to create new user');
                      })
                      .then(data => {
                        console.log("New user created:", data);
                        alert(`Created user: ${username}`);
                        // Refresh the users data
                        refetchUsers();
                      })
                      .catch(error => {
                        console.error("Error creating user:", error);
                        alert(`Error: ${error.message}`);
                      });
                  }}
                >
                  Add New User
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : users?.users?.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-5 gap-4 border-b p-4 font-medium">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">Username</div>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">Name</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {users.users.map((user: any) => (
                        <div key={user.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center">
                          <div className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{user.username}</div>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">{user.firstName} {user.lastName}</div>
                          <div>
                            {user.isAdmin ? (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                Admin
                              </span>
                            ) : user.isPremium ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Premium
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                Basic
                              </span>
                            )}
                          </div>
                          <div>
                            {user.active ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Active
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                fetch(`/api/admin/users/${user.id}`, {
                                  method: 'GET',
                                  credentials: 'include',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  }
                                })
                                  .then(response => {
                                    if (response.ok) {
                                      return response.json();
                                    }
                                    throw new Error('Failed to fetch user data');
                                  })
                                  .then(data => {
                                    console.log("Editing user:", data);
                                    // Set editing user state
                                    setEditingUser(data);
                                    
                                    // Basic user info
                                    setUserUsername(data.username || "");
                                    setUserFirstName(data.firstName || "");
                                    setUserLastName(data.lastName || "");
                                    
                                    // User roles
                                    setUserIsAdmin(data.isAdmin || false);
                                    setUserIsPremium(data.isPremium || false);
                                    setUserActive(data.active !== false); // Default to true if not specified
                                    setUserEmailVerified(data.emailVerified !== false); // Default to true if not specified
                                    
                                    // Profile information
                                    setUserPhone(data.phone || "");
                                    setUserCity(data.city || "");
                                    setUserState(data.state || "");
                                    setUserFirm(data.firm || "");
                                    setUserAum(data.aum || "");
                                    setUserRevenue(data.revenue || "");
                                    setUserFeeBasedPercentage(data.feeBasedPercentage || "");
                                    
                                    // Subscription information
                                    setUserSubscriptionId(data.stripeSubscriptionId || "");
                                    setUserSubscriptionStatus(data.subscriptionStatus || "");
                                    setIsEditingUser(true);
                                  })
                                  .catch(error => {
                                    console.error("Error editing user:", error);
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive"
                                    });
                                  });
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete user: ${user.username}?`)) {
                                  // Use only the admin endpoint with correct credentials
                                  fetch(`/api/admin/users/${user.id}`, {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    }
                                  })
                                    .then(response => {
                                      if (response.ok) {
                                        toast({
                                          title: "User Deleted",
                                          description: `Successfully deleted user: ${user.username}`,
                                        });
                                        // Refresh the users data
                                        refetchUsers();
                                      } else {
                                        throw new Error('Failed to delete user');
                                      }
                                    })
                                    .catch(error => {
                                      console.error("Error deleting user:", error);
                                      toast({
                                        title: "Error",
                                        description: error.message,
                                        variant: "destructive"
                                      });
                                    });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <div className="font-medium mb-1">No Users Found</div>
                      <p className="text-sm text-muted-foreground">
                        Add users to provide access to the platform
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Settings tab content */}
          {selectedTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-medium">System Settings</div>
                <Button
                  onClick={() => {
                    // Save all settings to API or localStorage (for demo)
                    try {
                      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
                      localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
                      localStorage.setItem('seoSettings', JSON.stringify(seoSettings));
                      localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
                      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
                      
                      toast({
                        title: "Settings Saved",
                        description: "Your system settings have been saved successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error Saving Settings",
                        description: "There was a problem saving your settings",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Save All Settings
                </Button>
              </div>
              
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> General
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="flex items-center gap-2">
                    <Search className="h-4 w-4" /> SEO
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <Code className="h-4 w-4" /> API
                  </TabsTrigger>
                </TabsList>
                
                {/* General Settings Tab */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Configuration</CardTitle>
                      <CardDescription>
                        Configure basic system settings for your application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="site-name" className="text-right">
                          Website Name
                        </Label>
                        <Input
                          id="site-name"
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact-email" className="text-right">
                          Contact Email
                        </Label>
                        <Input
                          id="contact-email"
                          value={systemSettings.contactEmail}
                          onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max-upload" className="text-right">
                          Max Upload Size (MB)
                        </Label>
                        <Input
                          id="max-upload"
                          type="number"
                          value={systemSettings.maxUploadFileSize}
                          onChange={(e) => setSystemSettings({...systemSettings, maxUploadFileSize: parseInt(e.target.value) || 5})}
                          className="col-span-3"
                        />
                      </div>

                      {/* Logo Settings */}
                      <div className="my-4 col-span-4">
                        <div className="text-base font-medium border-b pb-2">Site Logo Settings</div>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">
                          Customize your site logos for light and dark mode. Recommended size: 180 x 50px, SVG or PNG format.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="logo-light" className="text-right">
                          Light Mode Logo
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="logo-light"
                              value={systemSettings.logoLightMode}
                              onChange={(e) => setSystemSettings({...systemSettings, logoLightMode: e.target.value})}
                              className="flex-1"
                              placeholder="URL or path to light mode logo"
                            />
                            <Button type="button" variant="outline" size="sm">
                              Upload
                            </Button>
                          </div>
                          {systemSettings.logoLightMode && (
                            <div className="p-4 bg-card border rounded-md flex items-center justify-center">
                              <img 
                                src={systemSettings.logoLightMode} 
                                alt="Light mode logo preview" 
                                className="max-h-12"
                                onError={(e) => e.currentTarget.src = '/placeholder-logo.svg'}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        <Label htmlFor="logo-dark" className="text-right">
                          Dark Mode Logo
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="logo-dark"
                              value={systemSettings.logoDarkMode}
                              onChange={(e) => setSystemSettings({...systemSettings, logoDarkMode: e.target.value})}
                              className="flex-1"
                              placeholder="URL or path to dark mode logo"
                            />
                            <Button type="button" variant="outline" size="sm">
                              Upload
                            </Button>
                          </div>
                          {systemSettings.logoDarkMode && (
                            <div className="p-4 bg-black rounded-md flex items-center justify-center">
                              <img 
                                src={systemSettings.logoDarkMode} 
                                alt="Dark mode logo preview" 
                                className="max-h-12"
                                onError={(e) => e.currentTarget.src = '/placeholder-logo.svg'}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="default-role" className="text-right">
                          Default User Role
                        </Label>
                        <Select 
                          value={systemSettings.defaultUserRole}
                          onValueChange={(value) => setSystemSettings({...systemSettings, defaultUserRole: value})}
                        >
                          <SelectTrigger id="default-role" className="col-span-3">
                            <SelectValue placeholder="Select default role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic User</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right">
                          <Label>System Toggles</Label>
                        </div>
                        <div className="col-span-3 space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="user-registration">User Registration</Label>
                              <p className="text-sm text-muted-foreground">
                                Allow new users to register accounts
                              </p>
                            </div>
                            <Switch
                              id="user-registration"
                              checked={systemSettings.enableUserRegistration}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableUserRegistration: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="public-listings">Public Listings</Label>
                              <p className="text-sm text-muted-foreground">
                                Make practice listings visible to the public
                              </p>
                            </div>
                            <Switch
                              id="public-listings"
                              checked={systemSettings.enablePublicListings}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, enablePublicListings: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="blog-module">Blog Module</Label>
                              <p className="text-sm text-muted-foreground">
                                Enable the blog and news module
                              </p>
                            </div>
                            <Switch
                              id="blog-module"
                              checked={systemSettings.enableBlogModule}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableBlogModule: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="email-verification">Email Verification</Label>
                              <p className="text-sm text-muted-foreground">
                                Require email verification for new users
                              </p>
                            </div>
                            <Switch
                              id="email-verification"
                              checked={systemSettings.requireEmailVerification}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, requireEmailVerification: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="auto-approve">Auto-Approve Listings</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically approve new practice listings
                              </p>
                            </div>
                            <Switch
                              id="auto-approve"
                              checked={systemSettings.autoApproveListings}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoApproveListings: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                              <p className="text-sm text-muted-foreground">
                                Put the site in maintenance mode (admins only)
                              </p>
                            </div>
                            <Switch
                              id="maintenance-mode"
                              checked={systemSettings.maintenanceMode}
                              onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* AI Settings Tab */}
                <TabsContent value="ai">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Content Settings</CardTitle>
                      <CardDescription>
                        Configure AI-powered content generation settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="default-blog-instructions" className="text-right pt-2">
                          Default Blog Instructions
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Textarea
                            id="default-blog-instructions"
                            value={aiSettings.defaultBlogInstructions}
                            onChange={(e) => setAiSettings({...aiSettings, defaultBlogInstructions: e.target.value})}
                            rows={4}
                            className="min-h-[100px]"
                            placeholder="Enter default instructions for AI blog content generation..."
                          />
                          <p className="text-sm text-muted-foreground">
                            These instructions will be used as the default template when generating blog content with AI.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="default-category" className="text-right">
                          Default Category
                        </Label>
                        <Select 
                          value={aiSettings.defaultCategory}
                          onValueChange={(value) => setAiSettings({...aiSettings, defaultCategory: value})}
                        >
                          <SelectTrigger id="default-category" className="col-span-3">
                            <SelectValue placeholder="Select default category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="industry-trends">Industry Trends</SelectItem>
                            <SelectItem value="market-updates">Market Updates</SelectItem>
                            <SelectItem value="practice-management">Practice Management</SelectItem>
                            <SelectItem value="moves">Moves</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="wealth-management">Wealth Management</SelectItem>
                            <SelectItem value="advisor-insights">Advisor Insights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max-generated-length" className="text-right">
                          Max Content Length
                        </Label>
                        <Input
                          id="max-generated-length"
                          type="number"
                          value={aiSettings.maxGeneratedLength}
                          onChange={(e) => setAiSettings({...aiSettings, maxGeneratedLength: parseInt(e.target.value) || 1000})}
                          className="col-span-3"
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right">
                          <Label>AI Content Options</Label>
                        </div>
                        <div className="col-span-3 space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="auto-generate-tags">Auto-Generate Tags</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically generate tags for AI-created content
                              </p>
                            </div>
                            <Switch
                              id="auto-generate-tags"
                              checked={aiSettings.autoGenerateTags}
                              onCheckedChange={(checked) => setAiSettings({...aiSettings, autoGenerateTags: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="publish-by-default">Publish by Default</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically mark AI-generated content as published
                              </p>
                            </div>
                            <Switch
                              id="publish-by-default"
                              checked={aiSettings.publishByDefault}
                              onCheckedChange={(checked) => setAiSettings({...aiSettings, publishByDefault: checked})}
                              disabled={true} /* Disabled to prevent automatic publishing */
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={saveAiSettings}
                        disabled={savingAiSettings}
                      >
                        {savingAiSettings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save AI Settings
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Email Settings Tab */}
                <TabsContent value="email">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Configuration</CardTitle>
                      <CardDescription>
                        Configure email settings and notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="from-email" className="text-right">
                          Default From Email
                        </Label>
                        <Input
                          id="from-email"
                          value={emailSettings.defaultFromEmail}
                          onChange={(e) => setEmailSettings({...emailSettings, defaultFromEmail: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="admin-emails" className="text-right">
                          Admin Notification Emails
                        </Label>
                        <Input
                          id="admin-emails"
                          value={emailSettings.adminNotificationEmails}
                          onChange={(e) => setEmailSettings({...emailSettings, adminNotificationEmails: e.target.value})}
                          className="col-span-3"
                          placeholder="comma-separated emails"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email-signature" className="text-right">
                          Email Signature
                        </Label>
                        <Textarea
                          id="email-signature"
                          value={emailSettings.emailSignature}
                          onChange={(e) => setEmailSettings({...emailSettings, emailSignature: e.target.value})}
                          className="col-span-3"
                          rows={4}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right">
                          <Label>Email Toggles</Label>
                        </div>
                        <div className="col-span-3 space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="enable-notifications">Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Enable email notifications system-wide
                              </p>
                            </div>
                            <Switch
                              id="enable-notifications"
                              checked={emailSettings.enableEmailNotifications}
                              onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmailNotifications: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="welcome-email">Welcome Email</Label>
                              <p className="text-sm text-muted-foreground">
                                Send welcome email to new users
                              </p>
                            </div>
                            <Switch
                              id="welcome-email"
                              checked={emailSettings.sendWelcomeEmail}
                              onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendWelcomeEmail: checked})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            toast({
                              title: "Test Email Sent",
                              description: "A test email has been sent to your admin email"
                            });
                          }}
                        >
                          <Send className="h-4 w-4" />
                          Send Test Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* SEO Settings Tab */}
                <TabsContent value="seo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        SEO Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure search engine optimization settings for better visibility
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="general-seo" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="general-seo" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            General
                          </TabsTrigger>
                          <TabsTrigger value="social-seo" className="flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            Social Media
                          </TabsTrigger>
                          <TabsTrigger value="advanced-seo" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Advanced
                          </TabsTrigger>
                        </TabsList>
                        
                        {/* General SEO Settings */}
                        <TabsContent value="general-seo" className="space-y-4 pt-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="site-title" className="text-right">
                              Site Title
                            </Label>
                            <Input
                              id="site-title"
                              value={seoSettings.siteTitle || "Financial Advisor Services"}
                              onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="meta-title" className="text-right">
                              Default Meta Title
                            </Label>
                            <div className="col-span-3 space-y-2">
                              <Input
                                id="meta-title"
                                value={seoSettings.metaTitle}
                                onChange={(e) => setSeoSettings({...seoSettings, metaTitle: e.target.value})}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Recommended length: 50-60 characters</span>
                                <span>{seoSettings.metaTitle?.length || 0} characters</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="meta-description" className="text-right pt-2">
                              Meta Description
                            </Label>
                            <div className="col-span-3 space-y-2">
                              <Textarea
                                id="meta-description"
                                value={seoSettings.metaDescription}
                                onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                                rows={3}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Recommended length: 120-160 characters</span>
                                <span>{seoSettings.metaDescription?.length || 0} characters</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="meta-keywords" className="text-right">
                              Meta Keywords
                            </Label>
                            <div className="col-span-3">
                              <Input
                                id="meta-keywords"
                                value={seoSettings.metaKeywords || ""}
                                onChange={(e) => setSeoSettings({...seoSettings, metaKeywords: e.target.value})}
                                placeholder="financial advisor, wealth management, ria, transition"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Separate keywords with commas</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="seo-title-format" className="text-right">
                              Page Title Format
                            </Label>
                            <Select 
                              value={seoSettings.titleFormat || "page | site"} 
                              onValueChange={(value) => setSeoSettings({...seoSettings, titleFormat: value})}
                            >
                              <SelectTrigger id="seo-title-format" className="col-span-3">
                                <SelectValue placeholder="Select title format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="page | site">Page Title | Site Title</SelectItem>
                                <SelectItem value="site | page">Site Title | Page Title</SelectItem>
                                <SelectItem value="page">Page Title Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="canonical-domain" className="text-right">
                              Canonical Domain
                            </Label>
                            <Input
                              id="canonical-domain"
                              value={seoSettings.canonicalDomain || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, canonicalDomain: e.target.value})}
                              className="col-span-3"
                              placeholder="https://www.yoursite.com"
                            />
                          </div>
                        </TabsContent>
                        
                        {/* Social Media SEO Settings */}
                        <TabsContent value="social-seo" className="space-y-4 pt-4">
                          <div className="rounded-lg border p-4 mb-6">
                            <div className="text-sm font-medium mb-2">Open Graph Preview</div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                              <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 flex items-start">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 flex-shrink-0 rounded mr-3"></div>
                                <div>
                                  <div className="font-medium text-sm">{seoSettings.siteTitle || "Financial Advisor Services"}</div>
                                  <div className="text-xs text-muted-foreground">yoursite.com</div>
                                  <div className="text-sm mt-1.5 font-medium">{seoSettings.ogTitle || seoSettings.metaTitle || "Your Website Title"}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {seoSettings.ogDescription || seoSettings.metaDescription || "Your website description goes here"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="og-title" className="text-right">
                              OG Title
                            </Label>
                            <Input
                              id="og-title"
                              value={seoSettings.ogTitle || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, ogTitle: e.target.value})}
                              className="col-span-3"
                              placeholder="Default: Meta Title"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="og-description" className="text-right pt-2">
                              OG Description
                            </Label>
                            <Textarea
                              id="og-description"
                              value={seoSettings.ogDescription || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, ogDescription: e.target.value})}
                              className="col-span-3"
                              rows={2}
                              placeholder="Default: Meta Description"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="og-image" className="text-right">
                              OG Image URL
                            </Label>
                            <div className="col-span-3 space-y-3">
                              <Input
                                id="og-image"
                                value={seoSettings.ogImage || ""}
                                onChange={(e) => setSeoSettings({...seoSettings, ogImage: e.target.value})}
                                placeholder="https://www.example.com/og-image.jpg"
                              />
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                  Recommended size: 1200x630 pixels (1.91:1 ratio)
                                </p>
                                <Button variant="outline" size="sm">
                                  Upload Image
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="twitter-card" className="text-right">
                              Twitter Card Type
                            </Label>
                            <Select 
                              value={seoSettings.twitterCardType || "summary_large_image"} 
                              onValueChange={(value) => setSeoSettings({...seoSettings, twitterCardType: value})}
                            >
                              <SelectTrigger id="twitter-card" className="col-span-3">
                                <SelectValue placeholder="Select card type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="summary">Summary</SelectItem>
                                <SelectItem value="summary_large_image">Summary with Large Image</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="twitter-handle" className="text-right">
                              Twitter Handle
                            </Label>
                            <Input
                              id="twitter-handle"
                              value={seoSettings.twitterHandle || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, twitterHandle: e.target.value})}
                              className="col-span-3"
                              placeholder="@yourusername"
                            />
                          </div>
                        </TabsContent>
                        
                        {/* Advanced SEO Settings */}
                        <TabsContent value="advanced-seo" className="space-y-4 pt-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ga-id" className="text-right">
                              Google Analytics ID
                            </Label>
                            <Input
                              id="ga-id"
                              value={seoSettings.googleAnalyticsId || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, googleAnalyticsId: e.target.value})}
                              className="col-span-3"
                              placeholder="UA-XXXXXXXX-X or G-XXXXXXXXXX"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gsc-verification" className="text-right">
                              Google Site Verification
                            </Label>
                            <Input
                              id="gsc-verification"
                              value={seoSettings.googleSiteVerification || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, googleSiteVerification: e.target.value})}
                              className="col-span-3"
                              placeholder="Google Search Console verification code"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="robots-content" className="text-right pt-2">
                              Robots Directives
                            </Label>
                            <Textarea
                              id="robots-content"
                              value={seoSettings.robotsDirectives || ""}
                              onChange={(e) => setSeoSettings({...seoSettings, robotsDirectives: e.target.value})}
                              className="col-span-3"
                              rows={3}
                              placeholder="Additional directives for robots.txt"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="schema-code" className="text-right pt-2">
                              Custom Schema Markup
                            </Label>
                            <div className="col-span-3 space-y-2">
                              <Textarea
                                id="schema-code"
                                value={seoSettings.customSchema || ""}
                                onChange={(e) => setSeoSettings({...seoSettings, customSchema: e.target.value})}
                                className="font-mono text-xs"
                                rows={5}
                                placeholder='{"@context":"https://schema.org","@type":"Organization",...}'
                              />
                              <p className="text-xs text-muted-foreground">
                                Enter custom JSON-LD schema markup for your site (optional)
                              </p>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <div className="text-right">
                              <Label>SEO Toggles</Label>
                            </div>
                            <div className="col-span-3 space-y-4">
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <Label htmlFor="social-sharing">Social Sharing</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Enable social sharing meta tags
                                  </p>
                                </div>
                                <Switch
                                  id="social-sharing"
                                  checked={seoSettings.enableSocialSharing !== false}
                                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, enableSocialSharing: checked})}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <Label htmlFor="robots-index">Index Content</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Allow search engines to index your content
                                  </p>
                                </div>
                                <Switch
                                  id="robots-index"
                                  checked={seoSettings.allowIndex !== false}
                                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, allowIndex: checked})}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <Label htmlFor="sitemap">Auto-Generate Sitemap</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Automatically create and update XML sitemap
                                  </p>
                                </div>
                                <Switch
                                  id="sitemap"
                                  checked={seoSettings.sitemapEnabled !== false}
                                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, sitemapEnabled: checked})}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <Label htmlFor="seo-schema">Enable Schema Markup</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Add structured data for rich search results
                                  </p>
                                </div>
                                <Switch
                                  id="seo-schema"
                                  checked={seoSettings.enableSchema !== false}
                                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, enableSchema: checked})}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* API Settings Tab */}
                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Configuration</CardTitle>
                      <CardDescription>
                        Configure API settings for external connections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max-api-requests" className="text-right">
                          API Rate Limit
                        </Label>
                        <Input
                          id="max-api-requests"
                          type="number"
                          value={apiSettings.maxApiRequestsPerMinute}
                          onChange={(e) => setApiSettings({...apiSettings, maxApiRequestsPerMinute: parseInt(e.target.value) || 60})}
                          className="col-span-3"
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right">
                          <Label>API Toggles</Label>
                        </div>
                        <div className="col-span-3 space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="api-access">Enable API Access</Label>
                              <p className="text-sm text-muted-foreground">
                                Allow external applications to access the API
                              </p>
                            </div>
                            <Switch
                              id="api-access"
                              checked={apiSettings.enableApiAccess}
                              onCheckedChange={(checked) => setApiSettings({...apiSettings, enableApiAccess: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="cors">Allow CORS</Label>
                              <p className="text-sm text-muted-foreground">
                                Enable Cross-Origin Resource Sharing
                              </p>
                            </div>
                            <Switch
                              id="cors"
                              checked={apiSettings.allowCors}
                              onCheckedChange={(checked) => setApiSettings({...apiSettings, allowCors: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="api-keys">Require API Keys</Label>
                              <p className="text-sm text-muted-foreground">
                                Require API keys for all API requests
                              </p>
                            </div>
                            <Switch
                              id="api-keys"
                              checked={apiSettings.requireApiKeys}
                              onCheckedChange={(checked) => setApiSettings({...apiSettings, requireApiKeys: checked})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 border rounded-lg bg-muted/40">
                        <div className="font-medium mb-2">API Keys</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-sm bg-muted p-2 rounded">
                              d8e8fca2dc0f896fd7cb4cb0031ba249
                            </code>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Revoke
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button className="mt-4 w-full" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Generate New API Key
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Coming Soon placeholder for other tabs */}
          {selectedTab !== "dashboard" && selectedTab !== "blog" && 
           selectedTab !== "listings" && selectedTab !== "firms" && 
           selectedTab !== "calculator" && selectedTab !== "users" &&
           selectedTab !== "settings" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Settings className="h-12 w-12 text-primary" />
              </div>
              <div className="text-xl font-medium mb-2">Coming Soon</div>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                This section is currently under development and will be available soon.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTab("dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
        
        {/* Firm Profile Edit Modal */}
        <Dialog open={isEditingFirm} onOpenChange={setIsEditingFirm}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Firm Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-name" className="text-right">
                  Firm Name
                </Label>
                <Input
                  id="firm-name"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="col-span-3"
                  disabled={true} // Typically firm name shouldn't be editable as it's the ID
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-logo" className="text-right">
                  Logo URL
                </Label>
                <Input
                  id="firm-logo"
                  value={editingFirm?.logoUrl || ""}
                  onChange={(e) => {
                    if (editingFirm) {
                      setEditingFirm({
                        ...editingFirm,
                        logoUrl: e.target.value
                      });
                    }
                  }}
                  className="col-span-3"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-ceo" className="text-right">
                  CEO Name
                </Label>
                <Input
                  id="firm-ceo"
                  value={firmCeo}
                  onChange={(e) => setFirmCeo(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-hq" className="text-right">
                  Headquarters
                </Label>
                <Input
                  id="firm-hq"
                  value={firmHeadquarters}
                  onChange={(e) => setFirmHeadquarters(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={firmCategory || ""}
                  onValueChange={(value) => setFirmCategory(value)}
                >
                  <SelectTrigger id="firm-category" className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wirehouse">Wirehouse</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Independent">Independent</SelectItem>
                    <SelectItem value="Supported Indy">Supported Indy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-founded" className="text-right">
                  Founded
                </Label>
                <Input
                  id="firm-founded"
                  value={firmFounded}
                  onChange={(e) => setFirmFounded(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 1985"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="firm-description" className="text-right pt-2">
                  Description
                </Label>
                <div className="col-span-3 space-y-2">
                  <Textarea
                    id="firm-description"
                    value={firmDescription}
                    onChange={(e) => setFirmDescription(e.target.value)}
                    className="w-full"
                    rows={6}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (!firmName) {
                        toast({
                          title: "Error",
                          description: "Firm name is required for AI enrichment",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      toast({
                        title: "Processing",
                        description: "Enriching firm profile with AI. This may take a moment...",
                      });
                      
                      fetch('/api/enrich-firm-profile', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          firmName,
                          currentDescription: firmDescription || ""
                        })
                      })
                        .then(response => {
                          if (response.ok) {
                            return response.json();
                          }
                          throw new Error('Failed to enrich firm profile with AI');
                        })
                        .then(data => {
                          console.log("AI-enriched firm profile:", data);
                          // Update fields with enriched content
                          if (data.enrichedDescription) {
                            setFirmDescription(data.enrichedDescription);
                          }
                          
                          // Update founded year if provided
                          if (data.founded) {
                            setFirmFounded(data.founded);
                          }
                          
                          // Update category if provided
                          if (data.category) {
                            setFirmCategory(data.category);
                          }
                          
                          // Update headquarters if provided
                          if (data.headquarters) {
                            setFirmHeadquarters(data.headquarters);
                          }
                          
                          toast({
                            title: "Success",
                            description: "Firm profile successfully enriched with AI",
                          });
                        })
                        .catch(error => {
                          console.error("Error enriching firm profile:", error);
                          toast({
                            title: "Error",
                            description: error.message,
                            variant: "destructive"
                          });
                        });
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Enrich with AI
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingFirm(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (editingFirm) {
                  const updatedFirm = {
                    ...editingFirm,
                    ceo: firmCeo,
                    headquarters: firmHeadquarters,
                    founded: firmFounded,
                    category: firmCategory,
                    logoUrl: editingFirm.logoUrl || "",
                    bio: {
                      ...editingFirm.bio,
                      value: firmDescription
                    }
                  };
                  
                  fetch(`/api/firm-profiles/${encodeURIComponent(firmName)}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedFirm)
                  })
                    .then(response => {
                      if (response.ok) {
                        return response.json();
                      }
                      throw new Error('Failed to update firm profile');
                    })
                    .then(data => {
                      console.log("Updated firm profile:", data);
                      toast({
                        title: "Success",
                        description: `Firm profile for ${firmName} updated successfully`,
                      });
                      setIsEditingFirm(false);
                      refetchFirmProfiles();
                    })
                    .catch(error => {
                      console.error("Error updating firm profile:", error);
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                      });
                    });
                }
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Calculator Formula Edit Modal */}
        <Dialog open={isEditingFormula} onOpenChange={setIsEditingFormula}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Formula Parameters for {formulaFirm}</DialogTitle>
              <DialogDescription>
                Update parameter values for this firm to adjust calculator formulas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editingFormula?.parameters?.map((param: any, index: number) => (
                <div key={index} className="grid grid-cols-12 items-center gap-4 pb-4 border-b last:border-0">
                  <div className="col-span-4">
                    <Label htmlFor={`formula-name-${index}`}>
                      Parameter Name
                    </Label>
                    <Input
                      id={`formula-name-${index}`}
                      value={param.paramName}
                      className="mt-1"
                      disabled={true}
                    />
                  </div>
                  <div className="col-span-4">
                    <Label htmlFor={`formula-value-${index}`}>
                      Value
                    </Label>
                    <Input
                      id={`formula-value-${index}`}
                      defaultValue={param.paramValue}
                      className="mt-1"
                      onChange={(e) => {
                        // Update the value in the editingFormula parameters array
                        const updatedParams = [...editingFormula.parameters];
                        updatedParams[index] = {
                          ...updatedParams[index],
                          paramValue: e.target.value
                        };
                        setEditingFormula({
                          ...editingFormula,
                          parameters: updatedParams
                        });
                      }}
                    />
                  </div>
                  <div className="col-span-4">
                    <Label className="text-muted-foreground text-xs block mb-1">
                      Actions
                    </Label>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to save changes to ${param.paramName}?`)) {
                            fetch(`/api/firm-parameters/${param.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                firm: param.firm,
                                paramName: param.paramName,
                                paramValue: param.paramValue,
                                notes: param.notes || ""
                              })
                            })
                              .then(response => {
                                if (response.ok) {
                                  return response.json();
                                }
                                throw new Error('Failed to update parameter');
                              })
                              .then(data => {
                                toast({
                                  title: "Success",
                                  description: `Parameter ${param.paramName} updated`,
                                });
                              })
                              .catch(error => {
                                console.error("Error updating parameter:", error);
                                toast({
                                  title: "Error",
                                  description: error.message,
                                  variant: "destructive"
                                });
                              });
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive border-destructive"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${param.paramName}?`)) {
                            fetch(`/api/firm-parameters/${param.id}`, {
                              method: 'DELETE'
                            })
                              .then(response => {
                                if (response.ok) {
                                  // Remove this parameter from the current view
                                  const updatedParams = editingFormula.parameters.filter(
                                    (p: any) => p.id !== param.id
                                  );
                                  setEditingFormula({
                                    ...editingFormula,
                                    parameters: updatedParams
                                  });
                                  
                                  toast({
                                    title: "Success",
                                    description: `Parameter ${param.paramName} deleted`,
                                  });
                                  
                                  // If no more parameters for this firm, close the dialog
                                  if (updatedParams.length === 0) {
                                    setIsEditingFormula(false);
                                    refetchCalculatorFormulas();
                                  }
                                } else {
                                  throw new Error('Failed to delete parameter');
                                }
                              })
                              .catch(error => {
                                console.error("Error deleting parameter:", error);
                                toast({
                                  title: "Error",
                                  description: error.message,
                                  variant: "destructive"
                                });
                              });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingFormula(false)}>
                Close
              </Button>
              <Button onClick={() => {
                // Add a new parameter to this firm
                const paramName = window.prompt("Enter new parameter name:", "");
                if (!paramName) return;
                
                const paramValue = window.prompt("Enter parameter value:", "0");
                if (paramValue === null) return;
                
                const notes = window.prompt("Enter notes (optional):", "");
                
                fetch('/api/firm-parameters', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    firm: formulaFirm,
                    paramName,
                    paramValue,
                    notes: notes || ""
                  })
                })
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error('Failed to create parameter');
                  })
                  .then(data => {
                    toast({
                      title: "Success",
                      description: `New parameter ${paramName} added`,
                    });
                    
                    // Add the new parameter to our current view
                    const updatedParams = [...editingFormula.parameters, data];
                    setEditingFormula({
                      ...editingFormula,
                      parameters: updatedParams
                    });
                  })
                  .catch(error => {
                    console.error("Error creating parameter:", error);
                    toast({
                      title: "Error",
                      description: error.message,
                      variant: "destructive"
                    });
                  });
              }}>
                Add Parameter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* User Edit Modal */}
        <Dialog open={isEditingUser} onOpenChange={(open) => {
          if (!open) {
            setResetPasswordMode(false);
            setNewPassword("");
          }
          setIsEditingUser(open);
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update user information and manage subscription status
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="profile" className="mt-2">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Account & Security
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscription
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 pt-4">
                <div className="flex items-center gap-4 pb-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl bg-primary/10">
                      {userFirstName && userLastName ? 
                        `${userFirstName[0]}${userLastName[0]}` : 
                        userUsername?.substring(0, 2)?.toUpperCase() || "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{userFirstName} {userLastName}</h3>
                    <p className="text-sm text-muted-foreground">{userUsername}</p>
                    {userIsAdmin && <UIBadge variant="secondary" className="mt-1">Administrator</UIBadge>}
                    {userIsPremium && <UIBadge className="mt-1 ml-2">Premium</UIBadge>}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-username">Email Address</Label>
                    <Input
                      id="user-username"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      disabled={true} // Username/email typically shouldn't be editable
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-phone">Phone Number</Label>
                    <Input
                      id="user-phone"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-firstname">First Name</Label>
                    <Input
                      id="user-firstname"
                      value={userFirstName}
                      onChange={(e) => setUserFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-lastname">Last Name</Label>
                    <Input
                      id="user-lastname"
                      value={userLastName}
                      onChange={(e) => setUserLastName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-city">City</Label>
                    <Input
                      id="user-city"
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-state">State</Label>
                    <Input
                      id="user-state"
                      value={userState}
                      onChange={(e) => setUserState(e.target.value)}
                      placeholder="NY"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-md font-medium">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-firm">Current Firm</Label>
                    <Input
                      id="user-firm"
                      value={userFirm}
                      onChange={(e) => setUserFirm(e.target.value)}
                      placeholder="Morgan Stanley"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-aum">Assets Under Management</Label>
                    <Input
                      id="user-aum"
                      value={userAum}
                      onChange={(e) => setUserAum(e.target.value)}
                      placeholder="$10,000,000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-revenue">Annual Revenue</Label>
                    <Input
                      id="user-revenue"
                      value={userRevenue}
                      onChange={(e) => setUserRevenue(e.target.value)}
                      placeholder="$500,000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-fee-based">Fee-Based %</Label>
                    <Input
                      id="user-fee-based"
                      value={userFeeBasedPercentage}
                      onChange={(e) => setUserFeeBasedPercentage(e.target.value)}
                      placeholder="80%"
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Account & Security Tab */}
              <TabsContent value="account" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium">Account Status & Roles</h3>
                    <p className="text-sm text-muted-foreground">Manage user access and permissions</p>
                  </div>
                  <div>
                    <Switch 
                      id="user-active" 
                      checked={userActive}
                      onCheckedChange={(checked) => setUserActive(checked)}
                    />
                    <Label htmlFor="user-active" className="ml-2">
                      {userActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 border rounded-md">
                    <Checkbox 
                      id="user-admin" 
                      checked={userIsAdmin}
                      onCheckedChange={(checked) => setUserIsAdmin(checked === true)}
                    />
                    <div className="ml-3">
                      <Label htmlFor="user-admin" className="font-medium">Administrator</Label>
                      <p className="text-sm text-muted-foreground">
                        Full access to all administrative features
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-md">
                    <Checkbox 
                      id="user-premium" 
                      checked={userIsPremium}
                      onCheckedChange={(checked) => setUserIsPremium(checked === true)}
                    />
                    <div className="ml-3">
                      <Label htmlFor="user-premium" className="font-medium">Premium User</Label>
                      <p className="text-sm text-muted-foreground">
                        Access to premium features and content
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-md">
                    <Checkbox 
                      id="user-email-verified" 
                      checked={userEmailVerified}
                      onCheckedChange={(checked) => setUserEmailVerified(checked === true)}
                    />
                    <div className="ml-3">
                      <Label htmlFor="user-email-verified" className="font-medium">Email Verified</Label>
                      <p className="text-sm text-muted-foreground">
                        User has verified their email address
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Password Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Reset the user's password or force a password change
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setResetPasswordMode(!resetPasswordMode)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {resetPasswordMode ? "Cancel Reset" : "Reset Password"}
                    </Button>
                  </div>
                  
                  {resetPasswordMode && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/30 space-y-4">
                      <h4 className="font-medium">Set New Password</h4>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => {
                          if (newPassword.length < 8) {
                            toast({
                              title: "Password Error",
                              description: "Password must be at least 8 characters",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          // Handle password reset logic
                          fetch(`/api/users/${editingUser.id}/reset-password`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ newPassword })
                          })
                            .then(response => {
                              if (response.ok) {
                                toast({
                                  title: "Password Reset",
                                  description: "Password has been reset successfully",
                                });
                                setResetPasswordMode(false);
                                setNewPassword("");
                              } else {
                                throw new Error('Failed to reset password');
                              }
                            })
                            .catch(error => {
                              console.error("Error resetting password:", error);
                              toast({
                                title: "Error",
                                description: error.message,
                                variant: "destructive"
                              });
                            });
                        }}
                      >
                        Set New Password
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium">Subscription Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {userSubscriptionStatus || "No active subscription"}
                    </p>
                  </div>
                  <UIBadge variant={userSubscriptionStatus === "active" ? "default" : "outline"}>
                    {userSubscriptionStatus === "active" ? "Active" : 
                     userSubscriptionStatus === "trialing" ? "Trial" : 
                     userSubscriptionStatus === "past_due" ? "Past Due" : 
                     userSubscriptionStatus === "canceled" ? "Canceled" : "No Subscription"}
                  </UIBadge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <h4 className="font-medium">Premium Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        {userSubscriptionId ? `Subscription ID: ${userSubscriptionId.substring(0, 8)}...` : "No subscription"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {userSubscriptionId ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // View subscription details in Stripe dashboard
                          window.open(`https://dashboard.stripe.com/subscriptions/${userSubscriptionId}`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => {
                          // Create subscription logic would go here
                          toast({
                            title: "Create Subscription",
                            description: "Feature coming soon",
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Subscription
                      </Button>
                    )}
                  </div>
                </div>
                
                <Accordion type="single" collapsible>
                  <AccordionItem value="payment-history">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Payment History
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="py-2 px-4 text-left">Date</th>
                              <th className="py-2 px-4 text-left">Amount</th>
                              <th className="py-2 px-4 text-left">Status</th>
                              <th className="py-2 px-4 text-left">Invoice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Sample payment history - Would fetch real data in production */}
                            <tr className="border-b">
                              <td className="py-2 px-4">Mar 01, 2025</td>
                              <td className="py-2 px-4">$49.99</td>
                              <td className="py-2 px-4">
                                <UIBadge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Paid
                                </UIBadge>
                              </td>
                              <td className="py-2 px-4">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4">Feb 01, 2025</td>
                              <td className="py-2 px-4">$49.99</td>
                              <td className="py-2 px-4">
                                <UIBadge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Paid
                                </UIBadge>
                              </td>
                              <td className="py-2 px-4">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setIsEditingUser(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (editingUser) {
                  // Only include fields we actually need to update
                  const updatedUser = {
                    firstName: userFirstName,
                    lastName: userLastName,
                    isAdmin: userIsAdmin,
                    isPremium: userIsPremium,
                    active: userActive,
                    emailVerified: userEmailVerified,
                    // Include professional profile fields
                    phone: userPhone,
                    city: userCity,
                    state: userState,
                    firm: userFirm,
                    aum: userAum,
                    revenue: userRevenue,
                    feeBasedPercentage: userFeeBasedPercentage
                  };
                  
                  fetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedUser)
                  })
                    .then(response => {
                      if (response.ok) {
                        return response.json();
                      }
                      throw new Error('Failed to update user');
                    })
                    .then(data => {
                      console.log("Updated user:", data);
                      toast({
                        title: "Success",
                        description: `User ${userUsername} updated successfully`,
                      });
                      setIsEditingUser(false);
                      refetchUsers();
                    })
                    .catch(error => {
                      console.error("Error updating user:", error);
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                      });
                    });
                }
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Practice Listing Edit Modal */}
      <Dialog open={isPracticeListingModalOpen} onOpenChange={setIsPracticeListingModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPracticeListing ? 'Edit Practice Listing' : 'Add New Practice Listing'}
            </DialogTitle>
            <DialogDescription>
              {selectedPracticeListing 
                ? `Update listing: ${selectedPracticeListing.practiceName || selectedPracticeListing.title || 'Unnamed Practice'}` 
                : 'Add a new practice listing to the marketplace'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedPracticeListing && (
              <>
                {/* Basic Information Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-name" className="text-right">Name</Label>
                    <Input 
                      id="practice-name" 
                      value={selectedPracticeListing.practiceName || selectedPracticeListing.title || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        practiceName: e.target.value,
                        title: e.target.value
                      })}
                      className="col-span-3" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-location" className="text-right">Location</Label>
                    <Input 
                      id="practice-location" 
                      value={selectedPracticeListing.location || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        location: e.target.value
                      })}
                      className="col-span-3" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-aum" className="text-right">AUM</Label>
                    <Input 
                      id="practice-aum" 
                      value={selectedPracticeListing.aum || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        aum: e.target.value
                      })}
                      className="col-span-3" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-revenue" className="text-right">Annual Revenue</Label>
                    <Input 
                      id="practice-revenue" 
                      value={selectedPracticeListing.revenue || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        revenue: e.target.value
                      })}
                      className="col-span-3" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-clients" className="text-right">Clients</Label>
                    <Input 
                      id="practice-clients" 
                      value={selectedPracticeListing.clients || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        clients: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Number of clients" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-type" className="text-right">Type</Label>
                    <Select 
                      value={selectedPracticeListing.type || 'Full Service'} 
                      onValueChange={(value) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        type: value
                      })}
                    >
                      <SelectTrigger id="practice-type" className="col-span-3">
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
                    <Label htmlFor="practice-status" className="text-right">Status</Label>
                    <Select 
                      value={selectedPracticeListing.status || 'Pending'} 
                      onValueChange={(value) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        status: value
                      })}
                    >
                      <SelectTrigger id="practice-status" className="col-span-3">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Description Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="practice-description" className="text-right pt-2">Description</Label>
                    <Textarea 
                      id="practice-description" 
                      value={selectedPracticeListing.description || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        description: e.target.value
                      })}
                      className="col-span-3 min-h-[120px]" 
                    />
                  </div>
                </div>
                
                {/* Practice Details Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Practice Details</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-established" className="text-right">Established</Label>
                    <Input 
                      id="practice-established" 
                      value={selectedPracticeListing.established || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        established: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Year established" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-clientAvgAge" className="text-right">Client Average Age</Label>
                    <Input 
                      id="practice-clientAvgAge" 
                      value={selectedPracticeListing.clientAvgAge || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        clientAvgAge: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Average client age" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-investmentStyle" className="text-right">Investment Style</Label>
                    <Input 
                      id="practice-investmentStyle" 
                      value={selectedPracticeListing.investmentStyle || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        investmentStyle: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Description of investment approach" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-feeStructure" className="text-right">Fee Structure</Label>
                    <Input 
                      id="practice-feeStructure" 
                      value={selectedPracticeListing.feeStructure || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        feeStructure: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Fee structure (e.g. Fee-based (65%), commission (35%))" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-growthRate" className="text-right">Growth Rate</Label>
                    <Input 
                      id="practice-growthRate" 
                      value={selectedPracticeListing.growthRate || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        growthRate: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Annual growth rate (e.g. 6.5% annually)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-clientRetentionRate" className="text-right">Client Retention Rate</Label>
                    <Input 
                      id="practice-clientRetentionRate" 
                      value={selectedPracticeListing.clientRetentionRate || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        clientRetentionRate: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Client retention rate (e.g. 97% annually)" 
                    />
                  </div>
                </div>
                
                {/* Sale Terms Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Sale Terms</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-askingPrice" className="text-right">Asking Price</Label>
                    <Input 
                      id="practice-askingPrice" 
                      value={selectedPracticeListing.askingPrice || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        askingPrice: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Asking price (e.g. 2.4x revenue)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-transitionPeriod" className="text-right">Transition Period</Label>
                    <Input 
                      id="practice-transitionPeriod" 
                      value={selectedPracticeListing.transitionPeriod || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        transitionPeriod: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Transition period (e.g. 6-12 months)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-sellerMotivation" className="text-right">Seller Motivation</Label>
                    <Input 
                      id="practice-sellerMotivation" 
                      value={selectedPracticeListing.sellerMotivation || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        sellerMotivation: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Reason for selling (e.g. Retirement planning)" 
                    />
                  </div>
                </div>
                
                {/* Key Features Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  
                  <div className="grid grid-cols-4 items-center gap-4 mb-3">
                    <Label htmlFor="practice-tags" className="text-right">Features & Tags</Label>
                    <Input 
                      id="practice-tags" 
                      value={selectedPracticeListing.tags || ''} 
                      onChange={(e) => setSelectedPracticeListing({
                        ...selectedPracticeListing,
                        tags: e.target.value
                      })}
                      className="col-span-3"
                      placeholder="Comma-separated tags (e.g. Comprehensive Planning, Fee-Only)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="practice-highlighted" className="text-right">Highlight Listing</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="practice-highlighted"
                        checked={selectedPracticeListing.highlighted || false}
                        onCheckedChange={(checked) => setSelectedPracticeListing({
                          ...selectedPracticeListing,
                          highlighted: checked
                        })}
                      />
                      <Label htmlFor="practice-highlighted">Featured listing</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {!selectedPracticeListing && (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading practice listing details...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPracticeListingModalOpen(false)}>
              Cancel
            </Button>
            
            <Button 
              type="button" 
              onClick={() => {
                if (!selectedPracticeListing) return;
                
                // Update the practice listing through API
                fetch(`/api/practice-listings/${selectedPracticeListing.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(selectedPracticeListing),
                })
                .then(response => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error('Failed to update practice listing');
                })
                .then(data => {
                  // Success
                  toast({
                    title: "Practice listing updated",
                    description: `Successfully updated ${selectedPracticeListing.practiceName || selectedPracticeListing.title}`,
                  });
                  setIsPracticeListingModalOpen(false);
                  refetchPracticeListings();
                })
                .catch(error => {
                  console.error('Error updating practice listing:', error);
                  toast({
                    title: "Update failed",
                    description: error.message,
                    variant: "destructive"
                  });
                });
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Practice Listing Inquiries Dialog */}
      <Dialog open={isInquiriesModalOpen} onOpenChange={setIsInquiriesModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Inquiries for {selectedPracticeListing?.practiceName || selectedPracticeListing?.title || 'Practice Listing'}
            </DialogTitle>
            <DialogDescription>
              View all submitted inquiries for this practice listing
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedListingInquiries && selectedListingInquiries.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 border-b p-4 font-medium">
                  <div>Name</div>
                  <div>Contact Info</div>
                  <div>Date</div>
                  <div className="text-right">Actions</div>
                </div>
                
                {selectedListingInquiries.map((inquiry: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 items-center">
                    <div className="font-medium">{inquiry.name}</div>
                    <div>
                      <div>{inquiry.email}</div>
                      <div className="text-xs text-muted-foreground">{inquiry.phone}</div>
                    </div>
                    <div>{new Date(inquiry.submittedAt || inquiry.date || Date.now()).toLocaleDateString()}</div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const inquiryDetails = `
Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: ${inquiry.phone}
Date: ${new Date(inquiry.submittedAt || inquiry.date || Date.now()).toLocaleString()}

Message:
${inquiry.message}
                          `;
                          
                          alert(inquiryDetails);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No Inquiries Found</h3>
                <p className="text-sm text-muted-foreground">
                  There are no inquiries for this practice listing yet
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInquiriesModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}