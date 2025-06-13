import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Edit, Trash, Eye, Plus, Search, CircleCheck, CircleX, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  userName: string;
  location: string;
}

export default function MarketplaceAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentListingId, setCurrentListingId] = useState<number | null>(null);

  // Fetch marketplace listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/marketplace-listings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace-listings/admin', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace listings');
      }
      
      return response.json();
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return apiRequest('DELETE', `/api/marketplace-listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace-listings'] });
      toast({
        title: "Listing deleted",
        description: "The marketplace listing has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete listing",
        description: error.message || "An error occurred while deleting the listing.",
        variant: "destructive",
      });
    },
  });

  // Approve listing mutation
  const approveListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return apiRequest('PATCH', `/api/marketplace-listings/${listingId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace-listings'] });
      toast({
        title: "Listing approved",
        description: "The marketplace listing has been approved and is now publicly visible.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve listing",
        description: error.message || "An error occurred while approving the listing.",
        variant: "destructive",
      });
    },
  });

  // Reject listing mutation
  const rejectListingMutation = useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: number, reason: string }) => {
      return apiRequest('PATCH', `/api/marketplace-listings/${listingId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace-listings'] });
      toast({
        title: "Listing rejected",
        description: "The marketplace listing has been rejected.",
      });
      setRejectionReason("");
      setCurrentListingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject listing",
        description: error.message || "An error occurred while rejecting the listing.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = (listingId: number) => {
    deleteListingMutation.mutate(listingId);
  };

  const handleApproveListing = (listingId: number) => {
    approveListingMutation.mutate(listingId);
  };

  const handleRejectListing = () => {
    if (currentListingId) {
      rejectListingMutation.mutate({ 
        listingId: currentListingId, 
        reason: rejectionReason || "Your listing does not meet our guidelines."
      });
    }
  };

  // Filter listings based on search term and status
  const filteredListings = listings ? listings.filter((listing: MarketplaceListing) => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      (showPending && listing.status === 'pending') || 
      (showApproved && listing.status === 'approved') ||
      (showRejected && listing.status === 'rejected');
    
    return matchesSearch && statusMatch;
  }) : [];

  // Calculate stats
  const totalListings = listings ? listings.length : 0;
  const pendingListings = listings ? listings.filter((l: MarketplaceListing) => l.status === 'pending').length : 0;
  const approvedListings = listings ? listings.filter((l: MarketplaceListing) => l.status === 'approved').length : 0;
  const rejectedListings = listings ? listings.filter((l: MarketplaceListing) => l.status === 'rejected').length : 0;

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Management</h1>
          <p className="text-muted-foreground">Review and manage marketplace listings submitted by users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pendingListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedListings}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-auto relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-8 min-w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pending"
              checked={showPending}
              onCheckedChange={() => setShowPending(!showPending)}
            />
            <label
              htmlFor="pending"
              className="text-sm font-medium text-amber-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pending
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="approved"
              checked={showApproved}
              onCheckedChange={() => setShowApproved(!showApproved)}
            />
            <label
              htmlFor="approved"
              className="text-sm font-medium text-green-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Approved
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rejected"
              checked={showRejected}
              onCheckedChange={() => setShowRejected(!showRejected)}
            />
            <label
              htmlFor="rejected"
              className="text-sm font-medium text-red-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Rejected
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage marketplace listings</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing: MarketplaceListing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium max-w-xs truncate">{listing.title}</TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>${listing.price.toLocaleString()}</TableCell>
                  <TableCell>{listing.userName || listing.contactName}</TableCell>
                  <TableCell>{listing.location}</TableCell>
                  <TableCell>
                    {listing.status === 'pending' && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending Review</Badge>
                    )}
                    {listing.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    )}
                    {listing.status === 'rejected' && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(listing.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/marketplace/${listing.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {listing.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 border-green-600"
                            onClick={() => handleApproveListing(listing.id)}
                          >
                            <CircleCheck className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-600 border-red-600"
                                onClick={() => setCurrentListingId(listing.id)}
                              >
                                <CircleX className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Marketplace Listing</DialogTitle>
                                <DialogDescription>
                                  Provide a reason for rejecting this listing. This will be sent to the user.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    placeholder="Enter the reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  onClick={handleRejectListing}
                                >
                                  Reject Listing
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteListing(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No marketplace listings found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 rounded-md border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="text-indigo-800 font-medium mb-2">
          <Store className="h-4 w-4 inline-block mr-1" /> About Marketplace Management
        </h3>
        <p className="text-indigo-700 text-sm">
          This page allows you to manage all marketplace listings submitted by users. You can approve or reject pending listings,
          delete listings, and filter listings by status. Approved listings will be visible to all users, while rejected listings
          will only be visible to the user who submitted them.
        </p>
      </div>
    </div>
  );
}