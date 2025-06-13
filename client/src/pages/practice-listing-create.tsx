import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, MagicWand, Buildings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
import { Switch } from "@/components/ui/switch";

export default function PracticeListingCreate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [seedInfo, setSeedInfo] = useState({
    name: "",
    location: "",
    aum: "",
    specialty: ""
  });
  
  const [formData, setFormData] = useState({
    title: "",
    advisorName: "",
    location: "",
    aum: "",
    revenue: "",
    clientCount: "",
    clientMinimum: "",
    established: "",
    specialty: "",
    credentials: "",
    description: "",
    services: "",
    email: "",
    phone: "",
    price: "",
    status: "active",
    highlighted: false,
    type: "Full Service"
  });
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // AI Generation mutation
  const generateListingMutation = useMutation({
    mutationFn: async (seedData: any) => {
      const response = await apiRequest('POST', '/api/generate-practice-listing', seedData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate practice listing');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.practice) {
        // Update the form with AI generated data
        const practice = data.practice;
        setFormData({
          ...formData,
          title: practice.practiceTitle || "",
          advisorName: practice.advisorName || "",
          location: practice.location || "",
          aum: practice.aum || "",
          clientCount: practice.clientCount || "",
          clientMinimum: practice.clientMinimum || "",
          established: practice.founded || "",
          specialty: practice.specialty || "",
          credentials: (practice.credentials || []).join(", "),
          description: practice.background + "\n\n" + practice.philosophy || "",
          services: (practice.services || []).join(", "),
          email: practice.contactEmail || "",
          phone: practice.phoneNumber || "",
          // Keep existing values for these fields
          status: formData.status,
          highlighted: formData.highlighted,
          type: formData.type,
          price: formData.price || "",
          revenue: practice.revenue || ""
        });
        
        toast({
          title: "Practice listing generated",
          description: "AI has created a practice listing template. You can edit the details before saving.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate practice listing",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });
  
  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      return apiRequest('POST', '/api/practice-listings', listingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practice-listings'] });
      
      toast({
        title: "Listing created",
        description: "The practice listing has been created successfully.",
      });
      
      // Navigate back to listings page
      navigate("/practice-listings-admin");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create listing",
        description: error.message || "An error occurred while creating the listing.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });
  
  // Generate listing with AI
  const handleGenerate = () => {
    setIsGenerating(true);
    generateListingMutation.mutate(seedInfo);
  };
  
  // Create new listing
  const handleCreate = () => {
    if (!formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title for the practice listing.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    const price = parseInt(formData.price.replace(/[^0-9]/g, '')) || 0;
    
    createListingMutation.mutate({
      ...formData,
      price,
      revenue: formData.revenue || 'N/A',
      interestedCount: 0,
      viewed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };
  
  if (!user || !user.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
          <h1 className="text-xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
          <Link href="/admin-login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4 p-2">
          <Link href="/practice-listings-admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Practice Listing</h1>
          <p className="text-muted-foreground">Create a new practice listing for the marketplace</p>
        </div>
      </div>
      
      {/* AI Generation Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MagicWand className="mr-2 h-5 w-5 text-primary" />
            AI Generation
          </CardTitle>
          <CardDescription>
            Generate a practice listing with AI by providing some basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seed-name">Advisor Name (Optional)</Label>
              <Input
                id="seed-name"
                placeholder="John Smith"
                value={seedInfo.name}
                onChange={(e) => setSeedInfo({...seedInfo, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seed-location">Location (Optional)</Label>
              <Input
                id="seed-location"
                placeholder="New York, NY"
                value={seedInfo.location}
                onChange={(e) => setSeedInfo({...seedInfo, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seed-aum">AUM (Optional)</Label>
              <Input
                id="seed-aum"
                placeholder="$500M"
                value={seedInfo.aum}
                onChange={(e) => setSeedInfo({...seedInfo, aum: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seed-specialty">Specialty (Optional)</Label>
              <Input
                id="seed-specialty"
                placeholder="Retirement Planning"
                value={seedInfo.specialty}
                onChange={(e) => setSeedInfo({...seedInfo, specialty: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MagicWand className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Listing Form */}
      <div className="grid grid-cols-1 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Buildings className="mr-2 h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Required information about the practice listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Practice Name/Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Smith Wealth Management"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="advisorName">Advisor Name</Label>
                <Input
                  id="advisorName"
                  name="advisorName"
                  placeholder="John Smith"
                  value={formData.advisorName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aum">Assets Under Management</Label>
                <Input
                  id="aum"
                  name="aum"
                  placeholder="$500M"
                  value={formData.aum}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  name="revenue"
                  placeholder="$5M"
                  value={formData.revenue}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientCount">Number of Clients</Label>
                <Input
                  id="clientCount"
                  name="clientCount"
                  placeholder="150"
                  value={formData.clientCount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientMinimum">Client Minimum</Label>
                <Input
                  id="clientMinimum"
                  name="clientMinimum"
                  placeholder="$500,000"
                  value={formData.clientMinimum}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="established">Year Established</Label>
                <Input
                  id="established"
                  name="established"
                  placeholder="2005"
                  value={formData.established}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  placeholder="Retirement Planning"
                  value={formData.specialty}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="credentials">Credentials</Label>
                <Input
                  id="credentials"
                  name="credentials"
                  placeholder="CFP, CFA, etc."
                  value={formData.credentials}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed description of the practice..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="services">Services</Label>
                <Input
                  id="services"
                  name="services"
                  placeholder="Retirement Planning, Estate Planning, Tax Planning"
                  value={formData.services}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact & Listing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Listing Details</CardTitle>
            <CardDescription>
              Contact information and listing settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="contact@youradvisoryfirm.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Listing Price</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="$2,500,000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Practice Type</Label>
                <Select 
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
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
              
              <div className="space-y-2">
                <Label htmlFor="status">Listing Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highlighted" 
                    checked={formData.highlighted}
                    onCheckedChange={(checked) => handleSwitchChange("highlighted", checked)}
                  />
                  <Label htmlFor="highlighted">Featured Listing</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/practice-listings-admin")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}