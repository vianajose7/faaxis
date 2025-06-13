import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LinkIcon, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface AiBlogGeneratorProps {
  onContentGenerated: (content: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl?: string;
  }) => void;
  defaultInstructions?: string;
  publishByDefault?: boolean;
}

export function AiBlogGenerator({ 
  onContentGenerated,
  defaultInstructions = 'Completely rewrite it. Unique. Search Google for more backstory. Format properly for rich-text editor. Make it a tad longer. Open and informative tone.',
  publishByDefault = false
}: AiBlogGeneratorProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a source article URL to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Show generation steps
      setGenerationStep("Analyzing source article...");
      
      // Make API call to generate blog content - using public endpoint for testing
      const response = await fetch('/api/public/generate-blog-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl,
          prompt: instructions || undefined,
          generateImage: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate content");
      }
      
      setGenerationStep("Processing generated content...");
      
      const generatedContent = await response.json();
      
      // Make sure we pass the expected props whether it's called imageUrl or featuredImage
      const formattedContent = {
        title: generatedContent.title,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        imageUrl: generatedContent.imageUrl || generatedContent.featuredImage, // Handle both fields
        published: publishByDefault, // Use the publishByDefault prop to set published state
        publishedAt: null // Ensure no publication date for AI-generated content by default
      };
      
      // Return the generated content via callback
      onContentGenerated(formattedContent);
      
      toast({
        title: "Content Generated",
        description: "Your AI-generated blog post is ready for editing",
      });
    } catch (error) {
      console.error("Error generating blog content:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source Article URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="sourceUrl"
              placeholder="https://example.com/article"
              className="pl-8"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter URL of the article you want to use as a source for AI generation
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="Add specific instructions like tone, focus, or additional topics to include..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[100px]"
          disabled={isGenerating}
        />
        <p className="text-sm text-muted-foreground">
          Add specific guidance for the AI to customize the generated content
        </p>
      </div>

      {isGenerating && generationStep && (
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">{generationStep}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !sourceUrl}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Blog Post
          </>
        )}
      </Button>
    </div>
  );
}