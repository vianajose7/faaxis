import React, { useState, useEffect, lazy, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { FirmDeal, FirmParameter, FirmProfile, useFirmProfiles } from "@/lib/airtable-service";
import { BlogPost } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
  PieChart
} from "lucide-react";
import { Redirect } from "wouter";
import { FirmProfileDialog } from "@/components/admin/firm-profile-dialog";
import { BlogPostDialog } from '@/components/admin/blog-post-dialog';

/**
 * CMS Dashboard - A WordPress-like content management system that requires admin login
 */
export default function CMSDashboard() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  
  // If authenticated user is not admin, block access
  if (!isLoading && user && !user.isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            You need administrator privileges to access this page.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/"}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }
  // If not authenticated at all, go to admin login
  else if (!isLoading && !user) {
    return <Redirect to="/admin-login" />;
  }
  const [activeTab, setActiveTab] = useState("blogs");
  const [editingDeal, setEditingDeal] = useState<FirmDeal | null>(null);
  const [editingParameter, setEditingParameter] = useState<FirmParameter | null>(null);
  const [editingProfile, setEditingProfile] = useState<FirmProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [firmFilter, setFirmFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Admin dashboard state
  const [users, setUsers] = useState<any[]>([]);
  
  // Fetch blog posts from the API
  const {
    data: fetchedBlogPosts = [],
    isLoading: isLoadingBlogPosts,
    error: blogPostsError,
    refetch: refetchBlogPosts
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog-posts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use the fetched data in our state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // Update our state when the API data changes
  useEffect(() => {
    if (fetchedBlogPosts && fetchedBlogPosts.length > 0) {
      setBlogPosts(fetchedBlogPosts);
    }
  }, [fetchedBlogPosts]);
  const [practiceListings, setPracticeListings] = useState<any[]>([
    {
      id: "1",
      title: "Florida Wealth Management Practice",
      location: "Miami, FL",
      aum: "$150M",
      revenue: "$1.2M",
      status: "Active",
      price: "$3.6M",
      description: "Fee-based wealth management practice with 85% recurring revenue and loyal client base.",
      highlighted: true,
      date: "April 15, 2025"
    },
    {
      id: "2",
      title: "Chicago Financial Planning Practice",
      location: "Chicago, IL",
      aum: "$80M",
      revenue: "$750K",
      status: "Active",
      price: "$2.2M",
      description: "Established practice with strong client relationships and growth potential.",
      highlighted: false,
      date: "April 12, 2025"
    },
    {
      id: "3",
      title: "New York Metro Advisory Firm",
      location: "White Plains, NY",
      aum: "$210M",
      revenue: "$1.7M",
      status: "Pending",
      price: "$5.1M",
      description: "High-net-worth focused practice with strong team and systems in place.",
      highlighted: true,
      date: "April 10, 2025"
    },
    {
      id: "4",
      title: "Texas RIA Practice",
      location: "Austin, TX",
      aum: "$120M",
      revenue: "$950K",
      status: "Active",
      price: "$2.8M",
      description: "Growing practice in vibrant market with excellent retention rate.",
      highlighted: false,
      date: "April 8, 2025"
    },
    {
      id: "5",
      title: "California Wealth Management",
      location: "San Diego, CA",
      aum: "$175M",
      revenue: "$1.4M",
      status: "Sold",
      price: "$4.2M",
      description: "Established practice with affluent client base and strong systems.",
      highlighted: false,
      date: "April 1, 2025"
    }
  ]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  // Import the BlogPostWithTags interface from the dialog component for consistency
  type BlogPostWithTags = {
    id?: number;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    author?: string;
    category?: string;
    tags: string[] | string;
    imageUrl?: string;
    featuredImage?: string | null;
    published?: boolean;
    featured?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostWithTags | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isPracticeDialogOpen, setIsPracticeDialogOpen] = useState(false);
  
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
  
  // Mutation for refreshing Airtable data
  const refreshAirtableMutation = useMutation({
    mutationFn: async () => {
      console.log("Initiating Airtable data refresh...");
      try {
        const res = await apiRequest("POST", "/api/refresh-airtable");
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error refreshing Airtable data:", errorData);
          throw new Error(errorData.message || "Failed to refresh Airtable data");
        }
        
        const result = await res.json();
        console.log("Refresh successful:", result);
        return result;
      } catch (error) {
        console.error("Error during Airtable refresh:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Data refreshed",
        description: `Successfully refreshed ${data.count?.deals || 0} deals, ${data.count?.parameters || 0} parameters, and ${data.count?.profiles || 0} profiles.`,
      });
      
      // Invalidate and refetch all data
      queryClient.invalidateQueries({ queryKey: ['/api/firm-deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/firm-parameters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/firm-profiles'] });
      
      // Manual refetch for immediate update
      refetchDeals();
      refetchParameters();
      refetchProfiles();
    },
    onError: (error: Error) => {
      console.error("Airtable refresh error:", error);
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh Airtable data. Please try again.",
        variant: "destructive",
      });
    },
  });

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
  
  // Import our new dialog components
  const PracticeListingDialog = lazy(() => import('@/components/admin/practice-listing-dialog').then(module => ({ default: module.PracticeListingDialog })));
  const FirmDealDialog = lazy(() => import('@/components/admin/firm-deal-dialog').then(module => ({ default: module.FirmDealDialog })));
  const ParameterEditor = lazy(() => import('@/components/admin/parameter-editor').then(module => ({ default: module.ParameterEditor })));
  
  // Mock interest submissions for practices
  const mockInterestSubmissions = [
    {
      id: "int1",
      name: "John Smith",
      email: "john.smith@financialaxis.net",
      phone: "(305) 555-1234",
      message: "I'm very interested in this practice. I have experience in wealth management and would like to discuss further.",
      date: "April 16, 2025",
      contacted: true
    },
    {
      id: "int2",
      name: "Sarah Johnson",
      email: "sarah.johnson@wealthadvisors.com",
      phone: "(786) 555-9876",
      message: "This practice seems like a great fit for my expansion plans. I'd like to learn more about the client demographics and growth potential.",
      date: "April 17, 2025",
      contacted: false
    }
  ];
  
  // Mutations for blog post operations
  const createBlogPostMutation = useMutation({
    mutationFn: async (blogData: Partial<BlogPost>) => {
      const res = await apiRequest("POST", "/api/admin/blog-posts", blogData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create blog post");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      refetchBlogPosts();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<BlogPost> }) => {
      const res = await apiRequest("PATCH", `/api/admin/blog-posts/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update blog post");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      refetchBlogPosts();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/blog-posts/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete blog post");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      refetchBlogPosts();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Blog post dialog handlers
  const handleBlogSave = (blogData: BlogPostWithTags) => {
    // Convert tags array to comma-separated string for backend storage
    const processedData: Partial<BlogPost> = {
      ...blogData,
      tags: Array.isArray(blogData.tags) ? blogData.tags.join(',') : blogData.tags
    };
    
    if (blogData.id) {
      // Update existing blog post
      updateBlogPostMutation.mutate({ 
        id: blogData.id, 
        data: processedData 
      });
      
      toast({
        title: "Updating blog post",
        description: `"${blogData.title}" is being updated...`,
      });
    } else {
      // Create new blog post
      createBlogPostMutation.mutate(processedData);
      
      toast({
        title: "Creating blog post",
        description: `"${blogData.title}" is being created...`,
      });
    }
    
    setIsBlogDialogOpen(false);
    setSelectedBlogPost(null);
  };
  
  // Practice listing dialog handlers
  const handlePracticeSave = (listingData: any) => {
    // Add interest submissions if it's an existing practice and doesn't have them
    if (listingData.id && !listingData.interestSubmissions) {
      // Only add mock submissions to certain practices for demo purposes
      if (['1', '2', '3'].includes(listingData.id)) {
        listingData.interestSubmissions = mockInterestSubmissions;
      } else {
        listingData.interestSubmissions = [];
      }
    }
    
    // Find index if existing, otherwise -1
    const index = practiceListings.findIndex(listing => listing.id === listingData.id);
    
    if (index >= 0) {
      // Update existing practice listing
      const updatedListings = [...practiceListings];
      updatedListings[index] = listingData;
      setPracticeListings(updatedListings);
      
      toast({
        title: "Practice listing updated",
        description: `"${listingData.title}" has been updated successfully.`,
      });
    } else {
      // Add new practice listing
      setPracticeListings([listingData, ...practiceListings]);
      
      toast({
        title: "Practice listing created",
        description: `"${listingData.title}" has been created successfully.`,
      });
    }
    
    setIsPracticeDialogOpen(false);
    setSelectedPractice(null);
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

  // Loading state for external data
  if (isDealsLoading || isParametersLoading || isProfilesLoading) {
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
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          <p className="text-green-800 dark:text-green-300">
            <strong>CMS Dashboard:</strong> Welcome, admin! This secure content management system allows you to edit blogs, 
            manage firm information, and update practice listings. Only administrators can access this area.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Management System</h1>
          <p className="text-muted-foreground">
            Edit website content, manage listings, and update firm information
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Button 
            onClick={handleRefreshAirtable} 
            disabled={refreshAirtableMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon size={16} className={refreshAirtableMutation.isPending ? "animate-spin" : ""} />
            {refreshAirtableMutation.isPending ? "Refreshing..." : "Refresh Airtable Data"}
          </Button>
          {refreshAirtableMutation.isError && (
            <p className="text-sm text-red-500 mt-1">
              Error refreshing data. Check console for details.
            </p>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
          <TabsTrigger value="practices">Practice Listings</TabsTrigger>
          <TabsTrigger value="profiles">Firm Profiles</TabsTrigger>
          <TabsTrigger value="firms">Firm Deals</TabsTrigger>
          <TabsTrigger value="parameters">Calculation Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Blog Posts
                    {isLoadingBlogPosts && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Manage blog articles, create new posts, and update content
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => refetchBlogPosts()}
                  >
                    <RefreshCwIcon size={16} className={isLoadingBlogPosts ? "animate-spin" : ""} />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedBlogPost(null);
                      setIsBlogDialogOpen(true);
                    }}
                    disabled={createBlogPostMutation.isPending}
                  >
                    <PlusCircleIcon size={16} />
                    {createBlogPostMutation.isPending ? "Creating..." : "Add New Article"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
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
                      <TableHead>Slug</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingBlogPosts ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading blog posts...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : blogPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">No blog posts found</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBlogPost(null);
                                setIsBlogDialogOpen(true);
                              }}
                            >
                              Create your first blog post
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      blogPosts
                        .filter(post => !searchQuery || 
                          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(post => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{post.slug}</TableCell>
                            <TableCell>
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </TableCell>
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
                                    // Transform the post before setting it to selectedBlogPost
                                    const transformedPost: BlogPostWithTags = {
                                      ...post,
                                      // Convert tags string to array for proper handling in dialog
                                      tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : []
                                    };
                                    setSelectedBlogPost(transformedPost);
                                    setIsBlogDialogOpen(true);
                                  }}
                                  disabled={updateBlogPostMutation.isPending}
                                >
                                  <PencilIcon size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                                      deleteBlogPostMutation.mutate(post.id);
                                      toast({
                                        title: "Deleting blog post",
                                        description: `"${post.title}" is being deleted...`,
                                      });
                                    }
                                  }}
                                  disabled={deleteBlogPostMutation.isPending}
                                >
                                  <Trash2Icon size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* New Blog Post Dialog with Rich Editor */}
          {isBlogDialogOpen && (
            <Suspense fallback={
              <Dialog open>
                <DialogContent>
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </DialogContent>
              </Dialog>
            }>
              <BlogPostDialog
                open={isBlogDialogOpen}
                onOpenChange={setIsBlogDialogOpen}
                post={selectedBlogPost}
                onSave={handleBlogSave}
              />
            </Suspense>
          )}
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
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
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>AUM</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {practiceListings
                      .filter(practice => !searchQuery || 
                        practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        practice.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        practice.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(practice => (
                        <TableRow key={practice.id}>
                          <TableCell className="font-medium">
                            {practice.title}
                            {practice.highlighted && (
                              <Badge variant="secondary" className="ml-2">Featured</Badge>
                            )}
                          </TableCell>
                          <TableCell>{practice.location}</TableCell>
                          <TableCell>{practice.aum}</TableCell>
                          <TableCell>{practice.price}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={practice.status === 'Active' ? 'secondary' : 
                                practice.status === 'Pending' ? 'outline' : 'destructive'}
                            >
                              {practice.status}
                            </Badge>
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
          
          {/* New Practice Listing Dialog with Interest Submissions */}
          {isPracticeDialogOpen && (
            <Suspense fallback={
              <Dialog open>
                <DialogContent>
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </DialogContent>
              </Dialog>
            }>
              <PracticeListingDialog
                open={isPracticeDialogOpen}
                onOpenChange={setIsPracticeDialogOpen}
                listing={selectedPractice}
                onSave={handlePracticeSave}
              />
            </Suspense>
          )}
        </TabsContent>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Firm Profiles</CardTitle>
                  <CardDescription>
                    Manage firm profiles, CEO information, and company details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => refetchProfiles()}
                  >
                    <RefreshCwIcon size={16} />
                    Refresh Profiles
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input 
                  placeholder="Search firm profiles..." 
                  className="w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firm</TableHead>
                      <TableHead>CEO</TableHead>
                      <TableHead>Founded</TableHead>
                      <TableHead>Headquarters</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firmProfiles
                      .filter(profile => !searchQuery || 
                        profile.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        profile.ceo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        profile.headquarters.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(profile => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.firm}</TableCell>
                          <TableCell>{profile.ceo}</TableCell>
                          <TableCell>{profile.founded}</TableCell>
                          <TableCell>{profile.headquarters}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditingProfile(profile);
                                  setIsProfileDialogOpen(true);
                                }}
                              >
                                <PencilIcon size={16} />
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
          
          {editingProfile && (
            <FirmProfileDialog 
              open={isProfileDialogOpen} 
              onOpenChange={setIsProfileDialogOpen}
              profile={editingProfile}
              onSave={(updatedProfile) => {
                toast({
                  title: "Profile saved",
                  description: "Firm profile has been updated successfully.",
                });
                setEditingProfile(null);
              }}
            />
          )}
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
                        <TableCell className="text-right">{param.paramValue}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{param.notes}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingParameter(param);
                                setEditingDeal(null);
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
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingDeal 
                ? `Edit Firm Deal: ${editingDeal.firm}` 
                : editingParameter 
                  ? `Edit Parameter: ${editingParameter.paramName}` 
                  : activeTab === "firms" 
                    ? "Add New Firm Deal" 
                    : "Add New Parameter"}
            </DialogTitle>
            <DialogDescription>
              {editingDeal || activeTab === "firms"
                ? "Set the upfront and backend compensation percentages for this firm"
                : "Configure calculation parameters used in deal analysis"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Dialog content changes based on whether we're editing a firm deal or a parameter */}
          {(editingDeal || activeTab === "firms") ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firm-name" className="text-right">
                  Firm Name
                </Label>
                <Input
                  id="firm-name"
                  value={formFirm}
                  onChange={(e) => setFormFirm(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Upfront %
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="upfront-min"
                    type="number"
                    placeholder="Min"
                    value={formUpfrontMin}
                    onChange={(e) => setFormUpfrontMin(parseFloat(e.target.value))}
                  />
                  <span>to</span>
                  <Input
                    id="upfront-max"
                    type="number"
                    placeholder="Max"
                    value={formUpfrontMax}
                    onChange={(e) => setFormUpfrontMax(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Backend %
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="backend-min"
                    type="number"
                    placeholder="Min"
                    value={formBackendMin}
                    onChange={(e) => setFormBackendMin(parseFloat(e.target.value))}
                  />
                  <span>to</span>
                  <Input
                    id="backend-max"
                    type="number"
                    placeholder="Max"
                    value={formBackendMax}
                    onChange={(e) => setFormBackendMax(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Total Deal %
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="total-min"
                    type="number"
                    placeholder="Min"
                    value={formTotalDealMin}
                    onChange={(e) => setFormTotalDealMin(parseFloat(e.target.value))}
                  />
                  <span>to</span>
                  <Input
                    id="total-max"
                    type="number"
                    placeholder="Max"
                    value={formTotalDealMax}
                    onChange={(e) => setFormTotalDealMax(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right mt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="param-firm" className="text-right">
                  Firm
                </Label>
                <Input
                  id="param-firm"
                  value={formFirm}
                  onChange={(e) => setFormFirm(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="param-name" className="text-right">
                  Parameter Name
                </Label>
                <Input
                  id="param-name"
                  value={formParamName}
                  onChange={(e) => setFormParamName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="param-value" className="text-right">
                  Value
                </Label>
                <Input
                  id="param-value"
                  type="number"
                  value={formParamValue}
                  onChange={(e) => setFormParamValue(parseFloat(e.target.value))}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="param-notes" className="text-right mt-2">
                  Notes
                </Label>
                <Textarea
                  id="param-notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setEditingDeal(null);
              setEditingParameter(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}