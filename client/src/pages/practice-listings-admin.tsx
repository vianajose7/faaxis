import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Edit, Trash, Eye, Plus, Search, SlidersHorizontal, Tag } from "lucide-react";
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

interface PracticeListing {
  id: number;
  title: string;
  location: string;
  price: number;
  description: string;
  contact: string;
  status: 'active' | 'pending' | 'sold';
  createdAt: string;
  updatedAt: string;
  interestedCount: number;
  viewed: number;
}

export default function PracticeListingsAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showSold, setShowSold] = useState(false);

  // Fetch practice listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/practice-listings'],
    queryFn: async () => {
      const response = await fetch('/api/practice-listings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch practice listings');
      }
      
      return response.json();
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return apiRequest('DELETE', `/api/practice-listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practice-listings'] });
      toast({
        title: "Listing deleted",
        description: "The practice listing has been deleted successfully.",
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

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      listingId, 
      status 
    }: { 
      listingId: number, 
      status: 'active' | 'pending' | 'sold' 
    }) => {
      return apiRequest('PATCH', `/api/practice-listings/${listingId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practice-listings'] });
      toast({
        title: "Listing updated",
        description: "The listing status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update listing",
        description: error.message || "An error occurred while updating the listing.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = (listingId: number) => {
    deleteListingMutation.mutate(listingId);
  };

  const handleUpdateStatus = (listingId: number, status: 'active' | 'pending' | 'sold') => {
    updateStatusMutation.mutate({ listingId, status });
  };

  // Filter listings based on search term and status
  const filteredListings = listings ? listings.filter((listing: PracticeListing) => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      (showActive && listing.status === 'active') || 
      (showPending && listing.status === 'pending') ||
      (showSold && listing.status === 'sold');
    
    return matchesSearch && statusMatch;
  }) : [];

  // Calculate stats
  const totalListings = listings ? listings.length : 0;
  const activeListings = listings ? listings.filter((l: PracticeListing) => l.status === 'active').length : 0;
  const pendingListings = listings ? listings.filter((l: PracticeListing) => l.status === 'pending').length : 0;
  const soldListings = listings ? listings.filter((l: PracticeListing) => l.status === 'sold').length : 0;
  const totalInterested = listings ? listings.reduce((sum: number, l: PracticeListing) => sum + (l.interestedCount || 0), 0) : 0;

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
          <h1 className="text-3xl font-bold">Practice Listings Management</h1>
          <p className="text-muted-foreground">Manage practice listings, buyer inquiries, and sales.</p>
        </div>
        <Link href="/practice-listings/new">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
            <CardTitle className="text-green-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pendingListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{soldListings}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-600">Interested Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{totalInterested}</p>
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
              id="active"
              checked={showActive}
              onCheckedChange={() => setShowActive(!showActive)}
            />
            <label
              htmlFor="active"
              className="text-sm font-medium text-green-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active
            </label>
          </div>
          
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
              id="sold"
              checked={showSold}
              onCheckedChange={() => setShowSold(!showSold)}
            />
            <label
              htmlFor="sold"
              className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Sold
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage your practice listings</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interested</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing: PracticeListing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium max-w-xs truncate">{listing.title}</TableCell>
                  <TableCell>{listing.location}</TableCell>
                  <TableCell>${listing.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {listing.status === 'active' && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                    {listing.status === 'pending' && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>
                    )}
                    {listing.status === 'sold' && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">Sold</Badge>
                    )}
                  </TableCell>
                  <TableCell>{listing.interestedCount || 0}</TableCell>
                  <TableCell>{format(new Date(listing.updatedAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/practice-listings/${listing.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/practice-listings/edit/${listing.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(listing.id, 'active')}
                            disabled={listing.status === 'active'}
                            className={listing.status === 'active' ? 'text-muted-foreground' : 'text-green-600'}
                          >
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(listing.id, 'pending')}
                            disabled={listing.status === 'pending'}
                            className={listing.status === 'pending' ? 'text-muted-foreground' : 'text-amber-600'}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(listing.id, 'sold')}
                            disabled={listing.status === 'sold'}
                            className={listing.status === 'sold' ? 'text-muted-foreground' : 'text-blue-600'}
                          >
                            Mark as Sold
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No practice listings found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-blue-800 font-medium mb-2">
          <Tag className="h-4 w-4 inline-block mr-1" /> About Practice Listings
        </h3>
        <p className="text-blue-700 text-sm">
          This page allows you to manage all practice listings. You can create new listings, edit existing ones,
          change their status to Pending or Sold, or delete them. The status filters and search box help you find specific listings.
        </p>
      </div>
    </div>
  );
}