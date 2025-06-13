import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  source: string;
  category: string;
  sourceUrl?: string;
  imageUrl?: string;
}

export default function TestNewsPage() {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Query to fetch news articles
  const { data, isLoading, error } = useQuery<{ newsArticles: NewsArticle[] }>({
    queryKey: ['/api/news'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to generate an image for an article
  const generateImageMutation = useMutation({
    mutationFn: async (articleId: string) => {
      setIsGeneratingImage(true);
      
      // Make a direct fetch request to the API
      const res = await fetch(`/api/news/${articleId}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to generate image: ${errorText}`);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image generated successfully",
        description: "The article image has been created using AI.",
      });
      
      // Invalidate the news query cache to reflect the updated image
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setIsGeneratingImage(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate image",
        description: error.message || "An error occurred while generating the image",
        variant: "destructive",
      });
      setIsGeneratingImage(false);
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={48} className="animate-spin text-primary" />
          <span className="ml-2">Loading news articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading News</h2>
          <p>{(error as Error).message || "An error occurred while loading news articles"}</p>
        </div>
      </div>
    );
  }

  const newsArticles = data?.newsArticles || [];

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">News Articles Test Page</h1>
      <p className="mb-6 text-muted-foreground">
        This page demonstrates fetching news articles and generating images with AI.
      </p>
      
      {newsArticles.length === 0 ? (
        <div className="bg-muted rounded-lg p-6 text-center">
          <p>No news articles found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {newsArticles.map(article => (
            <Card key={article.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{article.title}</CardTitle>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{article.category}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {article.imageUrl ? (
                    <div className="relative h-48 w-full md:w-64 rounded-md overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 w-full md:w-64 bg-muted rounded-md">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="mb-4">{article.excerpt}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => generateImageMutation.mutate(article.id)}
                      disabled={generateImageMutation.isPending || isGeneratingImage}
                    >
                      {generateImageMutation.isPending && generateImageMutation.variables === article.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-1" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} className="mr-1" />
                          {article.imageUrl ? 'Regenerate' : 'Generate'} Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}