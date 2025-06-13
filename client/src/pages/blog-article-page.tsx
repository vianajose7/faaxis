import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, X, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogArticlePage() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // Get the article slug from the URL
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  // Fetch the blog post from the API
  const { 
    data: article, 
    isLoading, 
    error 
  } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug, // Only run query if slug is available
    retry: 3, // Retry failed queries 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });
  
  // Fetch all blog posts for related articles
  const {
    data: allBlogPosts,
    isLoading: isLoadingAllPosts
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!article, // Only run query if the main article is loaded
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-16 flex-grow text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Button asChild>
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Create SEO-friendly metadata for the article
  const articleDescription = article.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .slice(0, 160) // Limit to ~160 characters for meta description
    .trim();

  const pageTitle = `${article.title} | Financial Advisor Insights`;
  const articleKeywords = `${article.category.toLowerCase()}, financial advisor, wealth management, ${slug?.replace(/-/g, ' ') || 'advisor insights'}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title={pageTitle}
        description={articleDescription}
        canonicalUrl={`/blog/${slug || ''}`}
        ogType="article"
        keywords={articleKeywords}
      />
      <div className="container mx-auto px-4">
        <Navbar />
      </div>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <span className="text-sm text-primary font-medium">{article.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{article.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8">
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
          </div>

          <div 
            className={`bg-muted h-64 w-full mb-8 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ${
              article.featuredImage ? 'bg-cover bg-center' : ''
            }`}
            style={article.featuredImage ? { backgroundImage: `url(${article.featuredImage})` } : {}}
            onClick={() => setIsImageModalOpen(true)}
            role="button"
            aria-label="View full image"
            title="Click to view full image"
          >
            {!article.featuredImage && (
              <div className="text-muted-foreground font-medium">[Article Featured Image - Click to View Full Size]</div>
            )}
          </div>
          
          {/* Image Modal */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIsImageModalOpen(false)}>
              <div className="relative max-w-5xl w-full max-h-[90vh] bg-card rounded-lg overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="font-semibold text-lg">Article Image</h3>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    setIsImageModalOpen(false);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
                  {article.featuredImage ? (
                    <img 
                      src={article.featuredImage} 
                      alt={article.title} 
                      className="max-w-full max-h-[70vh] object-contain" 
                    />
                  ) : (
                    <div className="relative w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-muted-foreground p-8 text-center">
                        <p className="mb-4 font-medium">[No Image Available]</p>
                        <p className="text-sm">This article does not have a featured image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-foreground dark:text-white max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

          <div className="my-12 flex justify-between items-center border-t border-b py-6">
            <div>
              <h3 className="font-medium">Share this article</h3>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      text: articleDescription,
                      url: window.location.href,
                    })
                    .catch((error) => console.error('Error sharing', error));
                  } else {
                    // Fallback for browsers that don't support navigator.share
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => {
                        alert('Link copied to clipboard!');
                      })
                      .catch(err => {
                        console.error('Could not copy text: ', err);
                      });
                  }
                }}
                title="Share this article"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank');
                }}
                title="Share on Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
                title="Share on LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                      alert('Link copied to clipboard!');
                    })
                    .catch(err => {
                      console.error('Could not copy text: ', err);
                    });
                }}
                title="Copy link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </Button>
            </div>
          </div>

          <div className="my-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            {isLoadingAllPosts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : !allBlogPosts || allBlogPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No related articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allBlogPosts
                  // Filter out the current article
                  .filter(post => post.id !== article.id)
                  // Filter to get related articles (same category or similar tags)
                  .filter(post => {
                    // Match by category
                    if (post.category === article.category) return true;
                    
                    // Parse tags if they exist (they're stored as JSON strings)
                    try {
                      if (article.tags && post.tags) {
                        const articleTagsArray = typeof article.tags === 'string' 
                          ? JSON.parse(article.tags) 
                          : article.tags;
                        
                        const postTagsArray = typeof post.tags === 'string'
                          ? JSON.parse(post.tags)
                          : post.tags;
                          
                        // Check if any tags match
                        return Array.isArray(articleTagsArray) && 
                               Array.isArray(postTagsArray) &&
                               postTagsArray.some(tag => articleTagsArray.includes(tag));
                      }
                    } catch (e) {
                      console.error('Error parsing tags:', e);
                    }
                    
                    return false;
                  })
                  // Limit to 2 related articles as requested
                  .slice(0, 2)
                  .map(relatedPost => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <Link href={`/blog/${relatedPost.slug}`} className="block">
                        {relatedPost.featuredImage && (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={relatedPost.featuredImage} 
                              alt={relatedPost.title} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(relatedPost.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <h3 className="font-medium text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.content
                              .replace(/<[^>]*>/g, '')
                              .slice(0, 120)
                              .trim()}...
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                
                {/* Always show the "View more" card if there are fewer than 3 related articles */}
                {/* Showing "View more" only when we have fewer than the max allowed (2) related articles */}
                {allBlogPosts
                  .filter(post => post.id !== article.id)
                  .filter(post => {
                    // Same logic as above for consistency
                    if (post.category === article.category) return true;
                    
                    try {
                      if (article.tags && post.tags) {
                        const articleTagsArray = typeof article.tags === 'string' 
                          ? JSON.parse(article.tags) 
                          : article.tags;
                        
                        const postTagsArray = typeof post.tags === 'string'
                          ? JSON.parse(post.tags)
                          : post.tags;
                          
                        return Array.isArray(articleTagsArray) && 
                               Array.isArray(postTagsArray) &&
                               postTagsArray.some(tag => articleTagsArray.includes(tag));
                      }
                    } catch (e) {
                      console.error('Error parsing tags:', e);
                    }
                    
                    return false;
                  })
                  .length < 2 && (
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Link href="/blog">
                        <h3 className="font-medium mb-2 hover:text-primary">View more articles on our blog</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Explore more insights and resources for financial advisors
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}