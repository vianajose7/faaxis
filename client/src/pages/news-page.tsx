import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, Loader2, AlertTriangle, Filter } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug?: string;
  source?: string;
  readTime?: string;
  imageUrl?: string;
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6); // Show 6 articles initially
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Update displayed articles whenever newsArticles or visibleCount or filter changes
  useEffect(() => {
    const filtered = activeFilter 
      ? newsArticles.filter(article => article.category.includes(activeFilter))
      : newsArticles;
    
    setDisplayedArticles(filtered.slice(0, visibleCount));
  }, [newsArticles, visibleCount, activeFilter]);
  
  // Handle loading more articles
  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };
  
  // Track if we're using development data
  const [isDevelopmentData, setIsDevelopmentData] = useState(false);
  
  // Fetch news articles from our news-generator service
  useEffect(() => {
    async function fetchNewsArticles() {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news articles');
        }
        const data = await response.json();
        
        // Check if we're using development data
        if (data.source === 'development') {
          setIsDevelopmentData(true);
        }
        
        // Map the news articles to our UI format
        const articles = data.newsArticles.map((article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          date: article.date,
          category: article.category,
          source: article.source,
          readTime: `${Math.ceil(article.content.length / 1000)} min read`,
          slug: article.id,
          imageUrl: article.imageUrl || `/images/firm-logos/${article.source.toLowerCase().replace(/\s+/g, '-')}.png`
        }));
        
        setNewsArticles(articles);
      } catch (error) {
        console.error('Error fetching news articles:', error);
        // Set error message and empty articles array
        setError('Unable to load news articles. Please try again later.');
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNewsArticles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="Industry News | Financial Advisor Movements & Transitions"
        description="Stay updated on the latest financial advisor moves, team transitions, and industry shifts across wirehouses, independent firms, and RIAs."
        canonicalUrl="/news"
        keywords="financial advisor news, advisor movements, wirehouse transitions, team recruitment, advisor hiring, wealth management news"
      />
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Industry News</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated on the latest financial advisor movements, team transitions,
            and significant industry developments across the wealth management landscape.
          </p>
          
          {isDevelopmentData && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 mt-6 mx-auto max-w-2xl">
              <p className="text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  <strong>Development Mode:</strong> Using sample news data. To display real news articles, 
                  configure NEWS_SOURCE_URLS and OPENAI_API_KEY environment variables.
                </span>
              </p>
            </div>
          )}
        </div>
        
        {/* Category filters */}
        {!loading && !error && newsArticles.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <Badge 
              variant={activeFilter === null ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setActiveFilter(null)}
            >
              All
            </Badge>
            <Badge 
              variant={activeFilter === "Moves" ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setActiveFilter("Moves")}
            >
              Advisor Moves
            </Badge>
            <Badge 
              variant={activeFilter === "Industry" ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setActiveFilter("Industry")}
            >
              Industry Trends
            </Badge>
            <Badge 
              variant={activeFilter === "Educational" ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setActiveFilter("Educational")}
            >
              Educational
            </Badge>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-border mb-4" />
            <p className="text-muted-foreground">Loading news articles...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-medium mb-2">Error Loading News</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">No news articles are currently available.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedArticles.map((article) => (
                <Card key={article.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/news/${article.slug}`} className="block">
                    <div className="bg-muted h-48 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                      <div className="relative w-full h-full">
                        {article.imageUrl ? (
                          <>
                            <img 
                              src={article.imageUrl}
                              alt={`Image for ${article.title}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <Badge 
                                className={`px-2 py-1 ${
                                  article.category.includes("Moves") ? "bg-blue-500" : 
                                  article.category.includes("Industry") ? "bg-purple-500" : 
                                  article.category.includes("Educational") ? "bg-green-500" : 
                                  "bg-primary"
                                }`}
                              >
                                {article.category.includes("Moves") ? "Moves" : 
                                 article.category.includes("Industry") ? "Industry" : 
                                 article.category.includes("Educational") ? "Educational" : 
                                 article.category}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          /* Placeholder for news without image */
                          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-background/70 to-muted">
                            <div className="text-center">
                              <div className="text-xl font-semibold text-primary mb-2">
                                {article.category}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Financial Advisor News
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  <CardHeader className="pb-3">
                    <div className="text-sm text-primary font-medium mb-1">{article.category}</div>
                    <Link href={`/news/${article.slug}`} className="hover:text-primary transition-colors">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2 mt-2">{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{article.date}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{article.readTime}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between group" asChild>
                      <Link href={`/news/${article.slug}`}>
                        Read Full Story 
                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Show "Load More" button if there are more articles to load */}
            {displayedArticles.length < newsArticles.length && (
              <div className="mt-12 text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Load More News
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}