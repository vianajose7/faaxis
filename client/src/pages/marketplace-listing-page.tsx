import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, MapPin, Building, Users, DollarSign, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  userId: number;
  location: string;
  aum?: string;
  revenue?: string;
  clients?: string;
  featured?: boolean;
}

export default function MarketplaceListingPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch the listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: [`/api/marketplace-listings/${id}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/marketplace-listings/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Listing not found");
          }
          throw new Error("Error fetching listing");
        }
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    retry: 1,
  });
  
  // Show error notification and redirect if the listing doesn't exist
  useEffect(() => {
    if (error) {
      toast({
        title: "Listing not found",
        description: "The marketplace listing you're looking for doesn't exist or is no longer available.",
        variant: "destructive",
      });
      navigate("/marketplace");
    }
  }, [error, navigate, toast]);
  
  // Placeholder data for demonstration when real data isn't available
  // This will be shown when listing isn't loaded yet but we need to render the UI
  const placeholderListing: MarketplaceListing = {
    id: parseInt(id || "0"),
    title: "",
    description: "",
    price: 0,
    category: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 0,
    location: "",
  };
  
  // For display purposes - use either the real listing or the placeholder
  const displayListing = listing || placeholderListing;
  
  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };
  
  // Handle contact button click
  const handleContactClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the seller.",
        variant: "default",
      });
      navigate("/auth");
      return;
    }
    
    // Either show contact info or open contact form
    toast({
      title: "Contact information",
      description: `Please reach out to ${displayListing.contactName} at ${displayListing.contactEmail || displayListing.contactPhone || "the provided contact information"}`,
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading listing details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-16 px-4">
      <Button 
        variant="outline" 
        className="mb-8"
        onClick={() => navigate("/marketplace")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{displayListing.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{displayListing.location}</span>
                  </div>
                </div>
                <div>
                  {displayListing.featured && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col p-4 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground text-sm mb-1">Price</span>
                  <span className="text-2xl font-bold">{formatPrice(displayListing.price)}</span>
                </div>
                
                {displayListing.aum && (
                  <div className="flex flex-col p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground text-sm mb-1">AUM</span>
                    <span className="text-2xl font-bold">{displayListing.aum}</span>
                  </div>
                )}
                
                {displayListing.revenue && (
                  <div className="flex flex-col p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground text-sm mb-1">Revenue</span>
                    <span className="text-2xl font-bold">{displayListing.revenue}</span>
                  </div>
                )}
                
                {displayListing.clients && (
                  <div className="flex flex-col p-4 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground text-sm mb-1">Clients</span>
                    <span className="text-2xl font-bold">{displayListing.clients}</span>
                  </div>
                )}
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <h3>Description</h3>
                <div className="whitespace-pre-wrap">
                  {displayListing.description || "No detailed description provided for this listing."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to learn more about this listing
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium">{displayListing.category || "Financial Practice"}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Posted by</div>
                    <div className="font-medium">{displayListing.contactName}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{displayListing.location}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Button className="w-full" onClick={handleContactClick}>
                  Contact Seller
                </Button>
                
                {user && (
                  <div className="mt-4 text-sm text-center text-muted-foreground">
                    <p>Or reach out directly:</p>
                    {displayListing.contactEmail && (
                      <div className="flex items-center justify-center mt-2">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${displayListing.contactEmail}`} className="text-primary hover:underline">
                          {displayListing.contactEmail}
                        </a>
                      </div>
                    )}
                    {displayListing.contactPhone && (
                      <div className="flex items-center justify-center mt-2">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${displayListing.contactPhone}`} className="text-primary hover:underline">
                          {displayListing.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">
                Browse Other Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}