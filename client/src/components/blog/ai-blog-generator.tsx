import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';

interface AiBlogGeneratorProps {
  onContentGenerated: (content: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl?: string;
    published?: boolean;
  }) => void;
  defaultInstructions?: string;
  publishByDefault?: boolean;
}

export function AiBlogGenerator({ 
  onContentGenerated, 
  defaultInstructions = 'Write a professional, informative article based on this source.',
  publishByDefault = false
}: AiBlogGeneratorProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [prompt, setPrompt] = useState(defaultInstructions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceUrl) {
      toast({
        title: 'Source URL required',
        description: 'Please provide a URL to an existing article for reference.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Fetching source content...');

    try {
      // Use the apiRequest helper to ensure proper authentication
      const response = await apiRequest('POST', '/api/generate-blog-content', {
        sourceUrl,
        prompt: prompt || 'Write a professional, informative article based on this source.',
        generateImage: true // Enable AI image generation
      });
      
      // apiRequest already throws on non-OK responses

      setGenerationProgress('Analyzing content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationProgress('Generating draft...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = await response.json();
      
      if (data.imageUrl) {
        setGenerationProgress('Creating featured image...');
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      setGenerationProgress('Finalizing content...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Pass the generated content to the parent component
      onContentGenerated({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl, // Include the generated image URL
        published: false // Never auto-publish AI-generated content
      });

      // Add information about image generation to the toast
      const successMessage = data.imageUrl 
        ? 'Your article has been created successfully with a featured image.'
        : 'Your article has been created successfully.';
        
      toast({
        title: 'Content generated',
        description: successMessage,
      });
    } catch (error) {
      console.error('Error generating blog content:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-url">Source Article URL</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="source-url"
                  placeholder="https://example.com/article"
                  className="pl-8"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide a URL to an existing article that will be used as a reference
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder="Write a professional article with a conversational tone, focusing on the key insights..."
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Specify tone, length, style, target audience, or specific aspects to focus on
            </p>
          </div>

          {isGenerating && generationProgress && (
            <div className="bg-muted/40 rounded-md p-4 mt-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-medium">{generationProgress}</p>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-2 bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
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
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Article
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}