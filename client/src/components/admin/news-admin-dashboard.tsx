import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Image,
  MoreHorizontal,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

// Define the type for news articles
interface NewsArticle {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  source: string;
  sourceUrl?: string;
  category: string;
  imageUrl?: string;
  published: boolean;
  featured: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Custom component for confirming deletion
const DeleteConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete "{title}"? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex space-x-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Article Editor Component
const ArticleEditor = ({ 
  article, 
  onSave, 
  onCancel, 
  isSaving 
}: { 
  article: Partial<NewsArticle>, 
  onSave: (article: Partial<NewsArticle>) => void, 
  onCancel: () => void, 
  isSaving: boolean 
}) => {
  const [formData, setFormData] = useState<Partial<NewsArticle>>(article);
  
  // Update form data when article prop changes
  useEffect(() => {
    setFormData(article);
  }, [article]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const generateSlug = () => {
    if (!formData.title) return;
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData({ ...formData, slug });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Do some basic validation
    if (!formData.title?.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your article.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content?.trim()) {
      toast({
        title: "Content is required",
        description: "Please enter content for your article.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.slug?.trim()) {
      // Auto-generate slug if empty
      const newSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      formData.slug = newSlug;
    }
    
    // Create excerpt from content if not provided
    if (!formData.excerpt?.trim() && formData.content) {
      const excerpt = formData.content.substring(0, 150) + '...';
      formData.excerpt = excerpt;
    }
    
    // Set today's date if not provided
    if (!formData.date) {
      const today = new Date();
      formData.date = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 md:col-span-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Enter article title"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center mt-1">
                <Input 
                  id="slug"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleChange}
                  placeholder="article-url-slug"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="ml-2" 
                  onClick={generateSlug}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 md:col-span-2">
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content"
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              placeholder="Enter article content"
              className="mt-1 min-h-[300px]"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea 
            id="excerpt"
            name="excerpt"
            value={formData.excerpt || ''}
            onChange={handleChange}
            placeholder="Brief excerpt for display in listings"
            className="mt-1 h-20"
          />
        </div>
        
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input 
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="mt-1"
          />
          {formData.imageUrl && (
            <div className="mt-2 border rounded p-1 w-32 h-32 overflow-hidden">
              <img 
                src={formData.imageUrl}
                alt="Article preview"
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="date">Publication Date</Label>
          <Input 
            id="date"
            name="date"
            value={formData.date || ''}
            onChange={handleChange}
            placeholder="April 26, 2025"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            name="category" 
            value={formData.category || 'Advisor Moves'} 
            onValueChange={(value) => handleChange({ target: { name: 'category', value } } as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {/* News categories */}
              <SelectGroup>
                <SelectLabel>News Categories</SelectLabel>
                <SelectItem value="Advisor Moves">Advisor Moves</SelectItem>
                <SelectItem value="Team Transitions">Team Transitions</SelectItem>
                <SelectItem value="Firm Announcements">Firm Announcements</SelectItem>
                <SelectItem value="Industry Trends">Industry Trends</SelectItem>
                <SelectItem value="Regulatory Updates">Regulatory Updates</SelectItem>
              </SelectGroup>
              
              {/* Blog categories */}
              <SelectGroup>
                <SelectLabel>Blog Post Categories</SelectLabel>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Practice Management">Practice Management</SelectItem>
                <SelectItem value="Educational">Educational</SelectItem>
                <SelectItem value="Transition Guide">Transition Guide</SelectItem>
                <SelectItem value="Valuation">Valuation</SelectItem>
                <SelectItem value="Career Development">Career Development</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="source">Source</Label>
          <Input 
            id="source"
            name="source"
            value={formData.source || 'Financial Advisor News'}
            onChange={handleChange}
            placeholder="Source name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input 
            id="sourceUrl"
            name="sourceUrl"
            value={formData.sourceUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/source"
            className="mt-1"
          />
        </div>
        
        <div className="md:col-span-2 flex space-x-6 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="published" 
              checked={formData.published} 
              onCheckedChange={(checked) => handleCheckboxChange('published', checked as boolean)}
            />
            <Label htmlFor="published">Published</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured" 
              checked={formData.featured} 
              onCheckedChange={(checked) => handleCheckboxChange('featured', checked as boolean)}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
    </form>
  );
};

// Main News Admin Dashboard Component
export function NewsAdminDashboard() {
  // State for managing the UI
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    source: 'Financial Advisor News',
    category: 'Advisor Moves',
    published: true,
    featured: false,
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all news articles
  const { data: articles = [], isLoading, error, refetch } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }
      const data = await response.json();
      return data.newsArticles;
    },
  });
  
  // Create a new article
  const createArticleMutation = useMutation({
    mutationFn: async (article: Partial<NewsArticle>) => {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article Created',
        description: 'Your article has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update an existing article
  const updateArticleMutation = useMutation({
    mutationFn: async (article: Partial<NewsArticle>) => {
      const response = await fetch(`/api/news/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article Updated',
        description: 'Your article has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete an article
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article Deleted',
        description: 'The article has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Generate image for article
  const generateImageMutation = useMutation({
    mutationFn: async (articleId: number | string) => {
      setIsGeneratingImage(true);
      const response = await fetch(`/api/news/${articleId}/generate-image`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Image Generated',
        description: 'An image has been generated for your article.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsGeneratingImage(false);
      
      // If we're currently editing an article, update the image URL in the form
      if (isEditDialogOpen && editingArticle.id === data.article.id) {
        setEditingArticle({ ...editingArticle, imageUrl: data.article.imageUrl });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsGeneratingImage(false);
    },
  });
  
  // Mutation for generating articles with AI
  const generateWithAIMutation = useMutation({
    mutationFn: async (title?: string) => {
      const response = await fetch('/api/news/generate-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate article with AI');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Article Generated',
        description: 'A new article has been generated with AI.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Filter articles based on active tab and search
  const filteredArticles = articles.filter(article => {
    const searchMatch = search.trim() === '' || 
      article.title.toLowerCase().includes(search.toLowerCase()) || 
      article.content.toLowerCase().includes(search.toLowerCase());
    
    if (!searchMatch) return false;
    
    switch (activeTab) {
      case 'published':
        return article.published === true;
      case 'drafts':
        return article.published === false;
      case 'featured':
        return article.featured === true;
      default:
        return true;
    }
  });
  
  // Handle article save (create or update)
  const handleSaveArticle = (article: Partial<NewsArticle>) => {
    if (article.id) {
      updateArticleMutation.mutate(article);
    } else {
      createArticleMutation.mutate(article);
    }
  };
  
  // Handle new article button click
  const handleNewArticle = () => {
    setEditingArticle({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      source: 'Financial Advisor News',
      category: 'Advisor Moves',
      published: true,
      featured: false,
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle edit article
  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (article: NewsArticle) => {
    setArticleToDelete(article);
    setIsDeleteDialogOpen(true);
  };
  
  // Execute delete
  const executeDelete = () => {
    if (articleToDelete) {
      deleteArticleMutation.mutate(articleToDelete.id);
    }
  };
  
  // Handle generate AI article
  const handleGenerateAIArticle = () => {
    // Prompt for title (optional)
    const title = window.prompt('Enter a title for the AI-generated article (optional)');
    
    if (title !== null) { // User didn't cancel the prompt
      generateWithAIMutation.mutate(title || undefined);
    }
  };
  
  // Stats for the dashboard header
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.published).length,
    drafts: articles.filter(a => !a.published).length,
    featured: articles.filter(a => a.featured).length,
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">News Articles</h2>
          <p className="text-muted-foreground">
            Manage all your news articles from this dashboard.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleNewArticle}>
            <Plus className="mr-2 h-4 w-4" /> New Article
          </Button>
          <Button variant="outline" onClick={handleGenerateAIArticle}>
            <FileText className="mr-2 h-4 w-4" /> Generate with AI
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full md:w-64">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              <p>Error loading articles. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-10 flex flex-col items-center justify-center">
            <Archive className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              {search ? "No articles match your search." : "No articles found in this category."}
            </p>
            {search && (
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setSearch('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    <div className="flex items-center gap-2">
                      {article.featured && (
                        <span className="text-primary">
                          <Star size={16} />
                        </span>
                      )}
                      <span>{article.title}</span>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-muted-foreground" /> {article.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {article.category}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => {
                          const url = `/news/${article.slug}`;
                          window.open(url, '_blank');
                        }}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => updateArticleMutation.mutate({
                          id: article.id,
                          featured: !article.featured
                        })}>
                          <Star className="mr-2 h-4 w-4" /> 
                          {article.featured ? 'Remove from featured' : 'Add to featured'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => updateArticleMutation.mutate({
                          id: article.id,
                          published: !article.published
                        })}>
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
                        
                        {!article.imageUrl && (
                          <DropdownMenuItem onClick={() => generateImageMutation.mutate(article.id)} disabled={isGeneratingImage}>
                            <Image className="mr-2 h-4 w-4" /> 
                            {isGeneratingImage ? 'Generating...' : 'Generate image'}
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteConfirm(article)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Edit Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingArticle.id ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription>
              {editingArticle.id ? 'Make changes to your article here.' : 'Fill in the details for your new article.'}
            </DialogDescription>
          </DialogHeader>
          
          <ArticleEditor
            article={editingArticle}
            onSave={handleSaveArticle}
            onCancel={() => setIsEditDialogOpen(false)}
            isSaving={createArticleMutation.isPending || updateArticleMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title={articleToDelete?.title || ''}
      />
    </div>
  );
}