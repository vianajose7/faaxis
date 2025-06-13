import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";

export default function BlogPage() {
  // Fetch blog posts from API with improved error handling
  const { 
    data: blogArticles = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="News & Insights | Industry Trends & Career Development"
        description="Expert insights on wirehouse transitions, practice valuation, advisor compensation, and wealth management industry trends for financial advisors."
        canonicalUrl="/blog"
        keywords="financial advisor blog, advisor compensation, wirehouse transitions, wealth management, practice valuation, advisor career growth"
      />
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">News & Insights</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights and resources to help financial advisors navigate their careers,
            maximize compensation, and build successful practices.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">Error loading blog posts</p>
            <p className="text-muted-foreground mb-6">
              We encountered a problem fetching the latest articles. Please try again later.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        ) : blogArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">No blog posts found</p>
            <p className="text-muted-foreground">
              Check back soon for new articles and insights!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogArticles.map((article) => (
              <Card key={article.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/blog/${article.slug}`} className="block">
                  <div 
                    className={`bg-muted h-48 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ${
                      article.featuredImage ? 'bg-cover bg-center' : ''
                    }`}
                    style={article.featuredImage ? { backgroundImage: `url(${article.featuredImage})` } : {}}
                  >
                    {!article.featuredImage && (
                      <div className="text-muted-foreground font-medium">[Article Featured Image]</div>
                    )}
                  </div>
                </Link>
                <CardHeader className="pb-3">
                  <div className="text-sm text-primary font-medium mb-1">{article.category || 'Insights'}</div>
                  <Link href={`/blog/${article.slug}`} className="hover:text-primary transition-colors">
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 mt-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">
                      {new Date(article.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>5 min read</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group" asChild>
                    <Link href={`/blog/${article.slug}`}>
                      Read Article 
                      <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}