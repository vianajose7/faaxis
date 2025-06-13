import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  ImagePlus, 
  Tag, 
  Plus, 
  Trash2, 
  PenLine, 
  CalendarDays,
  Wand2,
  Bot
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/components/blog/blog-editor.css';

import { AiBlogGenerator } from "@/components/blog/ai-blog-generator";
import { BlogPost } from "@shared/schema";

// Custom CSS for the Quill editor (ensures proper toolbar display)
// Applied via inline styles instead of using styled-components
// to avoid fragment issues in the component
const quillStyles = {
  editorContainer: {
    height: '350px'
  },
  editor: {
    height: '300px',
    borderRadius: '0.375rem'
  }
};

// Local interface for frontend component
interface BlogPostWithTags {
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
}

interface BlogPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogPostWithTags | null;
  onSave: (post: BlogPostWithTags) => void;
}

// Quill editor modules and formats configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'indent',
  'link', 'image', 'blockquote', 'code-block',
  'color', 'background',
  'align',
  'script',
];

export function BlogPostDialog({ 
  open, 
  onOpenChange, 
  post, 
  onSave 
}: BlogPostDialogProps) {
  // Apply global styles for rich text editor
  useEffect(() => {
    return () => {
      // Cleanup function (if needed)
    };
  }, []);
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('Faaxis Research Team');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  // Reset form when post changes
  useEffect(() => {
    console.log('BlogPostDialog - Post changed:', post);
    if (post) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setContent(post.content || '');
      setExcerpt(post.excerpt || '');
      // Use either imageUrl or featuredImage, whichever is available
      setImageUrl(post.imageUrl || post.featuredImage || '');
      setDate(new Date().toISOString().split('T')[0]); // Always use current date in form
      setAuthor(post.author || 'Faaxis Research Team');
      setPublished(post.published || false);
      setFeatured(post.featured || false);
      
      // Handle tags, which might be stored as a JSON string in the database
      if (post.tags) {
        if (typeof post.tags === 'string') {
          try {
            // Try to parse if it's a JSON string
            const parsedTags = JSON.parse(post.tags);
            if (Array.isArray(parsedTags)) {
              setTags(parsedTags);
            } else {
              // If parsed but not an array, use empty
              setTags([]);
            }
          } catch (e) {
            // If it's not valid JSON, treat it as a comma-separated string
            const tagArray = post.tags.split(',');
            setTags(tagArray.map((tag: string) => tag.trim()));
          }
        } else if (Array.isArray(post.tags)) {
          // If it's already an array, use it directly
          setTags(post.tags);
        } else {
          setTags([]);
        }
      } else {
        setTags([]);
      }
    } else {
      // Reset form for new post
      setTitle('');
      setSlug('');
      setContent('');
      setExcerpt('');
      setImageUrl('');
      setDate(new Date().toISOString().split('T')[0]);
      setAuthor('Faaxis Research Team');
      setPublished(false);
      setFeatured(false);
      setTags([]);
    }
  }, [post]);
  
  // Auto-generate slug from title
  useEffect(() => {
    if (title && (!post || !post.slug)) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, '-');     // Replace spaces with hyphens
      setSlug(generatedSlug);
    }
  }, [title, post]);

  // Handle form submission
  const handleSave = () => {
    if (!title) {
      toast({
        title: "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!slug) {
      toast({
        title: "Slug is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!excerpt) {
      toast({
        title: "Excerpt is required",
        variant: "destructive"
      });
      return;
    }
    
    // Current date in ISO format
    const now = new Date().toISOString();
    
    // Convert tags array to string for storage
    const tagsString = JSON.stringify(tags);
    
    // Prepare the blog post data according to the schema
    const postData = {
      id: post?.id,
      title,
      slug,
      content,
      excerpt,
      featuredImage: imageUrl || null,
      imageUrl: imageUrl || '',
      author: author || 'Faaxis Research Team',
      category: 'General', // Default category
      tags, // Pass tags as array for frontend consistency
      published,
      featured,
      createdAt: post?.id ? post.createdAt : now,
      updatedAt: now
    };
    
    console.log('Saving blog post:', postData);
    onSave(postData);
    
    onOpenChange(false);
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Handle file upload for blog image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show loading toast
    toast({
      title: "Uploading image...",
      description: `Uploading ${file.name}`,
    });
    
    // Simulate upload delay
    setTimeout(() => {
      // In a real implementation, this would upload to a storage service
      // and return the actual URL to the uploaded file
      
      // For demo purposes, create a data URL from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageUrl(dataUrl);
        
        toast({
          title: "Image uploaded successfully",
          description: `${file.name} has been uploaded and will be used for this post`,
        });
      };
      
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "There was an error processing your file. Please try again.",
          variant: "destructive"
        });
      };
      
      reader.readAsDataURL(file);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {post ? `Edit Blog Post: ${post.title}` : 'Create New Blog Post'}
          </DialogTitle>
          <DialogDescription>
            {post 
              ? "Update your blog post content, metadata, and publishing settings." 
              : "Create a new blog post with rich content and publishing settings."}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[65vh] pr-1">
          <div className="grid gap-6 py-4 pr-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
              placeholder="Enter blog post title"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">
              Slug
            </Label>
            <div className="col-span-3 flex gap-2 items-center">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1"
                required
                placeholder="url-friendly-post-name"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                /blog/{slug}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="excerpt" className="text-right pt-2">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Brief summary of the post"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <div className="col-span-3">
              <Tabs defaultValue="editor" className="mb-4">
                <TabsList>
                  <TabsTrigger value="editor" className="flex items-center gap-1">
                    <PenLine className="h-4 w-4" /> Manual Editor
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-1">
                    <Bot className="h-4 w-4" /> AI Generator
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor">
                  <div className="border rounded-md" style={{ minHeight: '400px' }}>
                    <div className="ql-editor-container">
                      <ReactQuill 
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog post content here..."
                        className="blog-post-editor"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        AI Blog Generator
                      </CardTitle>
                      <CardDescription>
                        Create blog content using AI by providing a source URL and custom instructions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AiBlogGenerator 
                        /* Use AI settings from the portal */
                        defaultInstructions={'Completely rewrite it. Unique. Search Google for more backstory. Format properly for rich-text editor. Make it a tad longer. Open and informative tone.'}
                        publishByDefault={false}
                        onContentGenerated={({ title: aiTitle, content: aiContent, excerpt: aiExcerpt, imageUrl: aiImageUrl, published }) => {
                          if (aiTitle && !title) setTitle(aiTitle);
                          if (aiContent) setContent(aiContent);
                          if (aiExcerpt && !excerpt) setExcerpt(aiExcerpt);
                          if (aiImageUrl) setImageUrl(aiImageUrl);
                          
                          // Set published status from AI settings
                          if (typeof published !== 'undefined') {
                            setPublished(published);
                          }
                          
                          // Switch back to editor tab to show the generated content
                          const editorTab = document.querySelector('[data-value="editor"]');
                          if (editorTab && 'click' in editorTab) {
                            (editorTab as HTMLElement).click();
                          }
                          
                          // Show different toast based on whether image was generated
                          toast({
                            title: "AI content applied",
                            description: aiImageUrl 
                              ? "Generated content and featured image have been added to the editor" 
                              : "Generated content has been added to the editor"
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tags" className="text-right pt-2">
              Tags
            </Label>
            <div className="col-span-3 space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  className="flex-1"
                  placeholder="Add a tag (press Enter)"
                  onKeyDown={handleTagKeyPress}
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline" 
                  onClick={handleAddTag}
                  disabled={!currentTag}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex gap-1 items-center">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags added yet</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="image" className="text-right pt-2">
              Featured Image
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-4">
                {imageUrl && (
                  <div className="border rounded p-3 flex flex-col items-center max-w-md">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="max-w-full max-h-[200px] object-contain mb-2"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      Featured image for this post
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-muted/30">
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Upload featured image</p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="max-w-[300px]"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Recommended size: 1200×630 pixels for optimal social sharing
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Or use an image URL</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Publish Date
            </Label>
            <div className="col-span-3 flex gap-2 items-center">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-[200px]"
              />
              <CalendarDays className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-xs text-muted-foreground">
                {date ? new Date(date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Current date will be used'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right">
              Author
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="col-span-3"
              placeholder="Author name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="published" className="text-right">
              Published
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <span className="text-sm text-muted-foreground">
                {published ? 'Post is publicly visible' : 'Post is saved as draft'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">
              Featured
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
              <span className="text-sm text-muted-foreground">
                {featured ? 'Appears in featured sections' : 'Regular post display'}
              </span>
            </div>
          </div>
          
          {!content && (
            <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <PenLine className="h-4 w-4 mr-2 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                The post content is empty. Make sure to add content before publishing.
              </AlertDescription>
            </Alert>
          )}
        </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            {post ? 'Update Post' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}