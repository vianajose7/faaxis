import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, Tag, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function NewsArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch news article from the API with AI generation
  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        // Request the article from our API, which will generate it with AI if needed
        console.log(`Fetching article with ID: ${slug}`);
        const response = await fetch(`/api/news/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Article not found');
        }
        
        const data = await response.json();
        console.log('Article successfully loaded');
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError("We couldn't load this article. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchArticle();
    }
  }, [slug]);
  
  // Format content with paragraphs
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title={article ? `${article.title} | Industry News` : "Loading Article | Industry News"}
        description={article?.excerpt || "Loading financial advisor news article..."}
        canonicalUrl={slug ? `/news/${slug}` : "/news"}
        keywords={article ? `financial advisor news, ${article.category.toLowerCase()}, wealth management, advisor recruitment, advisor transitions` : "financial advisor news"}
      />
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" asChild>
            <Link href="/news">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to News
            </Link>
          </Button>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : article ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{article.category}</span>
                  </div>
                </div>
                <Separator className="my-6" />
              </div>
              
              {article.imageUrl && (
                <div className="mb-8 overflow-hidden rounded-lg">
                  <img 
                    src={article.imageUrl} 
                    alt={`Featured image for ${article.title}`}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Featured image for "{article.title}"
                  </p>
                </div>
              )}
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-xl font-medium mb-8 text-muted-foreground italic">
                  {article.excerpt}
                </div>
                
                <div className="article-content text-foreground dark:text-gray-300">
                  {article.content && formatContent(article.content)}
                </div>
                
                <Separator className="my-8" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Note:</strong> Information is based on public announcements and industry reports. Details may have changed since publication.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

