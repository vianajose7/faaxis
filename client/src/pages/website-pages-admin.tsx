import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Edit, Trash, Eye, Plus, Search, FileEdit, LayoutDashboard } from "lucide-react";
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

interface WebsitePage {
  id: number;
  title: string;
  slug: string;
  content: string;
  lastModified: string;
  createdAt: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  template: 'default' | 'landing' | 'sidebar';
}

export default function WebsitePagesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch website pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['/api/website-pages'],
    queryFn: async () => {
      const response = await fetch('/api/website-pages', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch website pages');
      }
      
      return response.json();
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: number) => {
      return apiRequest('DELETE', `/api/website-pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-pages'] });
      toast({
        title: "Page deleted",
        description: "The website page has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete page",
        description: error.message || "An error occurred while deleting the page.",
        variant: "destructive",
      });
    },
  });

  // Toggle published status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ pageId, isPublished }: { pageId: number, isPublished: boolean }) => {
      return apiRequest('PATCH', `/api/website-pages/${pageId}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website-pages'] });
      toast({
        title: "Page updated",
        description: "The page visibility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update page",
        description: error.message || "An error occurred while updating the page.",
        variant: "destructive",
      });
    },
  });

  const handleDeletePage = (pageId: number) => {
    deletePageMutation.mutate(pageId);
  };

  const handleTogglePublish = (pageId: number, currentStatus: boolean) => {
    togglePublishMutation.mutate({ pageId, isPublished: !currentStatus });
  };

  // Filter pages based on search term
  const filteredPages = pages ? pages.filter((page: WebsitePage) => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.metaDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <h1 className="text-3xl font-bold">Website Pages Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage website content pages.</p>
        </div>
        <Link href="/pages-admin/new">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Page
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Pages Overview</CardTitle>
          <CardDescription>Summary of website pages and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Total Pages</h3>
              <p className="text-3xl font-bold">{pages ? pages.length : 0}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Published</h3>
              <p className="text-3xl font-bold text-green-800">
                {pages ? pages.filter((p: WebsitePage) => p.isPublished).length : 0}
              </p>
            </div>
            <div className="bg-amber-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-amber-800">Drafts</h3>
              <p className="text-3xl font-bold text-amber-800">
                {pages ? pages.filter((p: WebsitePage) => !p.isPublished).length : 0}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Templates</h3>
              <p className="text-3xl font-bold text-blue-800">
                {pages ? new Set(pages.map((p: WebsitePage) => p.template)).size : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            className="pl-8 min-w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage website pages and content</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL Path</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
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
            ) : filteredPages.length > 0 ? (
              filteredPages.map((page: WebsitePage) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell className="capitalize">{page.template}</TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(page.lastModified || page.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/${page.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/pages-admin/edit/${page.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant={page.isPublished ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(page.id, page.isPublished)}
                      >
                        {page.isPublished ? "Unpublish" : "Publish"}
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
                            <AlertDialogTitle>Delete Page</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{page.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePage(page.id)}
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
                  No pages found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 rounded-md border border-teal-200 bg-teal-50 p-4">
        <h3 className="text-teal-800 font-medium mb-2">
          <LayoutDashboard className="h-4 w-4 inline-block mr-1" /> About Website Pages
        </h3>
        <p className="text-teal-700 text-sm">
          This page allows you to manage all content pages on your website. You can create new pages, 
          edit existing ones, toggle their publication status, or delete them. Each page can use a different
          template to suit your content needs.
        </p>
      </div>
    </div>
  );
}