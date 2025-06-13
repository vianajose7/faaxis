import { db } from './db';
import { newsArticles, InsertNewsArticle, NewsArticle, blogPosts } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { generateArticleWithAI } from './news-generator';
import { format } from 'date-fns';

/**
 * News repository for managing news articles in the database
 */
class NewsRepository {
  /**
   * Get all published news articles
   */
  async getAllArticles(): Promise<NewsArticle[]> {
    return db.select().from(newsArticles).where(eq(newsArticles.published, true));
  }
  
  /**
   * Create a blog post from a news article to ensure consistency
   */
  async createBlogFromNewsArticle(article: NewsArticle): Promise<number> {
    // Check if blog post already exists with this title to avoid duplicates
    const [existingPost] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.title, article.title));
      
    if (existingPost) {
      console.log(`Blog post already exists for news article: ${article.title}`);
      return existingPost.id;
    }
    
    // Create a consistent slug
    const slug = article.slug || article.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Format the content for blog post format
    const content = `
# ${article.title}

${article.content}

---
*Source: ${article.source}*
`;
    
    // Insert the blog post
    const [newPost] = await db.insert(blogPosts).values({
      title: article.title,
      slug: slug,
      excerpt: article.excerpt,
      content: content,
      author: "News Team",
      category: article.category || "Industry News",
      tags: JSON.stringify(["News", article.category || "Industry News"]),
      featuredImage: article.imageUrl,
      published: true,
      featured: article.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();
    
    console.log(`Created blog post from news article: ${article.title}`);
    return newPost.id;
  }

  /**
   * Get a news article by ID
   */
  async getArticleById(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  /**
   * Get a news article by slug
   */
  async getArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.slug, slug));
    return article;
  }

  /**
   * Create a new news article
   */
  async createArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  /**
   * Update an existing news article
   */
  async updateArticle(id: number, article: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const [updatedArticle] = await db
      .update(newsArticles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return updatedArticle;
  }

  /**
   * Delete a news article by marking it as unpublished 
   * and also update the corresponding blog post
   */
  async deleteArticle(id: number): Promise<boolean> {
    try {
      // First get the article to find its title (needed to match the blog post)
      const article = await this.getArticleById(id);
      if (!article) {
        console.log(`Article with ID ${id} not found for deletion`);
        return false;
      }
      
      // Mark the news article as unpublished instead of deleting
      const [unpublishedArticle] = await db
        .update(newsArticles)
        .set({ 
          published: false,
          updatedAt: new Date()
        })
        .where(eq(newsArticles.id, id))
        .returning({ id: newsArticles.id });
      
      // Also update any corresponding blog post to maintain consistency
      if (article.title) {
        // Find blog post by title
        const [blogPost] = await db.select()
          .from(blogPosts)
          .where(eq(blogPosts.title, article.title));
          
        if (blogPost) {
          console.log(`Also marking blog post unpublished: "${article.title}"`);
          await db
            .update(blogPosts)
            .set({ 
              published: false,
              updatedAt: new Date().toISOString()
            })
            .where(eq(blogPosts.id, blogPost.id));
        }
      }
      
      return !!unpublishedArticle;
    } catch (error) {
      console.error(`Error soft-deleting article ${id}:`, error);
      return false;
    }
  }

  /**
   * Generate an article using AI and save it to the database
   */
  async generateAndSaveArticle(title?: string): Promise<NewsArticle> {
    try {
      // Generate article using OpenAI
      const tempId = `temp-${Date.now()}`;
      const generatedArticle = await generateArticleWithAI(tempId, title);
      
      // Generate slug from title
      const slug = generatedArticle.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Format date for consistency
      const formattedDate = format(new Date(), 'MMMM d, yyyy');
      
      // Prepare for database insertion
      const articleToSave: InsertNewsArticle = {
        title: generatedArticle.title,
        slug,
        content: generatedArticle.content,
        excerpt: generatedArticle.excerpt,
        date: formattedDate,
        source: generatedArticle.source || 'Financial Advisor News',
        sourceUrl: generatedArticle.sourceUrl || `/news/${slug}`,
        category: generatedArticle.category,
        imageUrl: generatedArticle.imageUrl,
        published: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save to database
      return await this.createArticle(articleToSave);
    } catch (error) {
      console.error(`Error generating and saving article: ${error}`);
      throw error;
    }
  }
  
  /**
   * Recover any deleted news articles that have corresponding blog posts
   * This helps fix cases where news articles were hard-deleted but their blog posts remain
   */
  async recoverDeletedArticlesFromBlogs(): Promise<number> {
    try {
      // Get all blog posts in the news category
      const newsBlogPosts = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.category, "Industry News"))
        .orderBy(desc(blogPosts.createdAt));
      
      // Get all existing news articles (both published and unpublished)
      const allNewsArticles = await db.select().from(newsArticles);
      const existingTitles = new Set(allNewsArticles.map(article => article.title));
      
      let recoveredCount = 0;
      
      // Process each blog post that doesn't have a corresponding news article
      for (const blogPost of newsBlogPosts) {
        if (!existingTitles.has(blogPost.title)) {
          console.log(`Found orphaned blog post "${blogPost.title}" without news article - recreating`);
          
          // Extract source from the content if available
          const sourceMatch = blogPost.content.match(/\*Source: (.*?)\*/);
          const source = sourceMatch ? sourceMatch[1] : "Financial Advisor News";
          
          // Create a new news article from the blog post
          const newsArticle: InsertNewsArticle = {
            title: blogPost.title,
            slug: blogPost.slug,
            content: blogPost.content,
            excerpt: blogPost.excerpt || blogPost.content.substring(0, 200),
            date: format(new Date(blogPost.createdAt), 'MMMM d, yyyy'),
            source,
            sourceUrl: `/blog/${blogPost.slug}`,
            category: blogPost.category,
            imageUrl: blogPost.featuredImage || undefined,
            published: blogPost.published || false,
            featured: blogPost.featured || false,
            createdAt: new Date(blogPost.createdAt),
            updatedAt: new Date(),
          };
          
          await this.createArticle(newsArticle);
          recoveredCount++;
        }
      }
      
      console.log(`Recovered ${recoveredCount} news articles from orphaned blog posts`);
      return recoveredCount;
    } catch (error) {
      console.error("Error recovering deleted articles:", error);
      return 0;
    }
  }
  
  /**
   * Check if we need to initialize the database with some articles
   */
  async initializeArticlesIfNeeded(count: number = 5): Promise<void> {
    // Check if we already have articles
    const existingArticles = await this.getAllArticles();
    
    if (existingArticles.length === 0) {
      console.log(`Initializing database with ${count} AI-generated articles...`);
      
      // Generate articles in parallel with different topics
      const topics = [
        "Morgan Stanley Team Joins UBS",
        "Raymond James Recruits JPMorgan Advisors",
        "Merrill Lynch Team Launches Independent RIA",
        "LPL Financial Attracts Wells Fargo Advisors",
        "Rockefeller Capital Expansion with Goldman Sachs Team",
      ];
      
      // Generate articles sequentially to avoid rate limits
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        try {
          const article = await this.generateAndSaveArticle(topics[i]);
          console.log(`Generated article ${i + 1}/${count}: ${topics[i]}`);
          
          // Also create a blog post from this news article
          await this.createBlogFromNewsArticle(article);
          console.log(`Created blog post for article: ${topics[i]}`);
          
          // Add a delay to avoid rate limits with OpenAI
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating article ${i + 1}: ${error}`);
        }
      }
      
      console.log('Database initialization complete');
    }
  }
}

export const newsRepository = new NewsRepository();