import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Edit, Trash, Eye, Plus, Search, FileText, Filter } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export default function BlogPostsAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPublished, setShowPublished] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);

  // Fetch blog posts
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog-posts'],
    queryFn: async () => {
      const response = await fetch('/api/blog-posts', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      return response.json();
    },
  });

  // Delete blog post mutation
  const deleteBlogPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('DELETE', `/api/blog-posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "Blog post deleted",
        description: "The blog post has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message || "An error occurred while deleting the blog post.",
        variant: "destructive",
      });
    },
  });

  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ postId, published }: { postId: number, published: boolean }) => {
      return apiRequest('PATCH', `/api/blog-posts/${postId}`, { published });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "Blog post updated",
        description: "The blog post status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update blog post",
        description: error.message || "An error occurred while updating the blog post.",
        variant: "destructive",
      });
    },
  });

  const handleDeletePost = (postId: number) => {
    deleteBlogPostMutation.mutate(postId);
  };

  const handleTogglePublish = (postId: number, currentStatus: boolean) => {
    togglePublishMutation.mutate({ postId, published: !currentStatus });
  };

  // Filter posts based on search term and publish status
  const filteredPosts = blogPosts ? blogPosts.filter((post: BlogPost) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      (showPublished && post.published) || 
      (showDrafts && !post.published);
    
    return matchesSearch && statusMatch;
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
          <h1 className="text-3xl font-bold">Blog Posts Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage blog content.</p>
        </div>
        <Link href="/cms-dashboard/new">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Content Overview</CardTitle>
          <CardDescription>Analytics and metrics for your blog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
              <p className="text-3xl font-bold">{blogPosts ? blogPosts.length : 0}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Published</h3>
              <p className="text-3xl font-bold">
                {blogPosts ? blogPosts.filter((post: BlogPost) => post.published).length : 0}
              </p>
            </div>
            <div className="bg-amber-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-amber-800">Drafts</h3>
              <p className="text-3xl font-bold">
                {blogPosts ? blogPosts.filter((post: BlogPost) => !post.published).length : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={showPublished}
              onCheckedChange={() => setShowPublished(!showPublished)}
            />
            <label
              htmlFor="published"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Published
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="drafts"
              checked={showDrafts}
              onCheckedChange={() => setShowDrafts(!showDrafts)}
            />
            <label
              htmlFor="drafts"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Drafts
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage your blog content</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post: BlogPost) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(post.updatedAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/cms-dashboard/edit/${post.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
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
                            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant={post.published ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(post.id, post.published)}
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No blog posts found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-amber-800 font-medium mb-2">
          <FileText className="h-4 w-4 inline-block mr-1" /> About Blog Management
        </h3>
        <p className="text-amber-700 text-sm">
          This page allows you to manage all blog content. You can create new posts, edit existing ones,
          toggle their publication status, or delete them. Use the search and filter options to find specific posts.
        </p>
      </div>
    </div>
  );
}