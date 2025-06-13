import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Edit, Trash, Eye, Plus, Search, RefreshCw, Building } from "lucide-react";
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
// Define local interface to match server-side structure
interface FirmProfile {
  id: string;
  firm: string;
  ceo: string;
  bio: string;
  logoUrl: string;
  founded: string;
  headquarters: string;
}

export default function FirmProfilesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch firm profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/firm-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/firm-profiles', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch firm profiles');
      }
      
      return response.json();
    },
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return apiRequest('DELETE', `/api/admin/firm-profiles/${profileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/firm-profiles'] });
      toast({
        title: "Profile deleted",
        description: "The firm profile has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete profile",
        description: error.message || "An error occurred while deleting the profile.",
        variant: "destructive",
      });
    },
  });

  // Refresh AI data mutation
  const refreshAiDataMutation = useMutation({
    mutationFn: async (firmName: string) => {
      return apiRequest('POST', `/api/firm-profiles/refresh-data`, { firmName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/firm-profiles'] });
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "The firm profile data has been refreshed with the latest AI-generated information.",
      });
    },
    onError: (error: any) => {
      setIsRefreshing(false);
      toast({
        title: "Failed to refresh data",
        description: error.message || "An error occurred while refreshing the profile data.",
        variant: "destructive",
      });
    },
  });

  // Refresh all profiles from Airtable
  const refreshAllProfilesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/firm-profiles/refresh-all`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/firm-profiles'] });
      toast({
        title: "All profiles refreshed",
        description: "All firm profiles have been refreshed from Airtable.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to refresh profiles",
        description: error.message || "An error occurred while refreshing profiles from Airtable.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProfile = (profileId: string) => {
    deleteProfileMutation.mutate(profileId);
  };

  const handleRefreshAiData = (firmName: string) => {
    setIsRefreshing(true);
    refreshAiDataMutation.mutate(firmName);
  };

  const handleRefreshAllProfiles = () => {
    refreshAllProfilesMutation.mutate();
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles ? profiles.filter((profile: FirmProfile) => {
    const matchesSearch = 
      profile.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.ceo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.headquarters.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

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
          <h1 className="text-3xl font-bold">Firm Profiles Management</h1>
          <p className="text-muted-foreground">Manage financial firm profiles, information, and market data.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-1"
            onClick={handleRefreshAllProfiles}
            disabled={refreshAllProfilesMutation.isPending}
          >
            {refreshAllProfilesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Refresh All Profiles
              </>
            )}
          </Button>
          <Link href="/secure-management-portal/firm-profiles/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> New Profile
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Profiles Overview</CardTitle>
          <CardDescription>Metrics and statistics about firm profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Total Firms</h3>
              <p className="text-3xl font-bold">{profiles ? profiles.length : 0}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">With Logo</h3>
              <p className="text-3xl font-bold text-blue-800">
                {profiles ? profiles.filter((p: FirmProfile) => p.logoUrl).length : 0}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">With Enhanced Data</h3>
              <p className="text-3xl font-bold text-green-800">
                {profiles ? profiles.filter((p: FirmProfile) => p.bio && p.bio.length > 100).length : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search firms..."
            className="pl-8 min-w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage financial firm profiles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Firm Name</TableHead>
              <TableHead>CEO</TableHead>
              <TableHead>Headquarters</TableHead>
              <TableHead>Founded</TableHead>
              <TableHead>Has Logo</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile: FirmProfile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.firm}</TableCell>
                  <TableCell>{profile.ceo || "—"}</TableCell>
                  <TableCell>{profile.headquarters || "—"}</TableCell>
                  <TableCell>{profile.founded || "—"}</TableCell>
                  <TableCell>
                    {profile.logoUrl ? (
                      <Badge className="bg-green-100 text-green-800">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/firm-profiles/${profile.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/secure-management-portal/firm-profiles/edit/${profile.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRefreshAiData(profile.firm)}
                        disabled={isRefreshing}
                        className="text-blue-600"
                      >
                        {isRefreshing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
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
                            <AlertDialogTitle>Delete Firm Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the profile for "{profile.firm}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProfile(profile.id)}
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No firm profiles found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 rounded-md border border-purple-200 bg-purple-50 p-4">
        <h3 className="text-purple-800 font-medium mb-2">
          <Building className="h-4 w-4 inline-block mr-1" /> About Firm Profiles
        </h3>
        <p className="text-purple-700 text-sm">
          This page allows you to manage financial firm profiles. You can add new profiles, edit existing ones,
          refresh profile data from Airtable, or delete profiles. The "Refresh All Profiles" button will update all profiles 
          from Airtable, while the refresh button for individual profiles will update their AI-enhanced data.
        </p>
      </div>
    </div>
  );
}