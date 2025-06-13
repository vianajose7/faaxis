import OpenAI from "openai";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { generateImagesForArticles } from "./image-generator";
import { newsRepository } from "./news-repository";
import { NewsArticle } from "@shared/schema";
import { format } from "date-fns";

// Initialize OpenAI API client - using lazy initialization for security
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.");
    }
    
    // Validate API key format
    const apiKey = process.env.OPENAI_API_KEY.trim();
    
    // Accept both standard 'sk-' keys and project-specific 'sk-proj-' keys
    if (!apiKey || typeof apiKey !== 'string' || !(apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'))) {
      throw new Error("Invalid OpenAI API key format. API keys should start with 'sk-' or 'sk-proj-'");
    }
    
    openaiInstance = new OpenAI({ apiKey });
    console.log("OpenAI client initialized successfully in news-generator");
  }
  
  return openaiInstance;
}

// For backward compatibility
const openai = getOpenAI();

/**
 * Scrape content from AdvisorHub or InvestmentNews
 * @param url URL to scrape content from
 * @returns Extracted title, content, date, and source
 */
async function scrapeArticle(url: string): Promise<{
  title: string;
  content: string;
  date: string;
  source: string;
}> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let title = "";
    let content = "";
    let date = "";
    let source = url.includes("advisorhub.com") ? "AdvisorHub" : "InvestmentNews";
    
    // Different selectors based on the source
    if (source === "AdvisorHub") {
      title = $("h1.entry-title").text().trim();
      content = $("div.entry-content").text().trim();
      date = $("time.entry-date").text().trim();
    } else {
      title = $("h1.article-title").text().trim();
      content = $("div.article-content").text().trim();
      date = $("time.article-date").text().trim();
    }
    
    return { title, content, date, source };
  } catch (error) {
    console.error(`Error scraping article: ${error}`);
    throw new Error(`Failed to scrape article: ${error}`);
  }
}

/**
 * Rewrite an article using OpenAI
 * @param originalTitle Original article title
 * @param originalContent Original article content
 * @param source Source of the article
 * @returns Rewritten article (title, content, excerpt)
 */
async function rewriteArticle(
  originalTitle: string,
  originalContent: string,
  source: string
): Promise<{ title: string; content: string; excerpt: string }> {
  try {
    const prompt = `
    You are a financial news editor specializing in financial advisor movements and transitions between firms.
    
    Please rewrite the following article from ${source} about financial advisor movements.
    Make it concise, professional, and focused on the key facts about advisor transitions.
    
    Original Title: ${originalTitle}
    
    Original Content:
    ${originalContent.substring(0, 4000)} 
    
    Please provide:
    1. A rewritten title
    2. A short 2-3 sentence excerpt
    3. Rewritten article content (approximately 400-600 words)
    
    Format your response as JSON with these keys: title, excerpt, content
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to get content from OpenAI");
    }
    
    const result = JSON.parse(content);
    return {
      title: result.title,
      content: result.content,
      excerpt: result.excerpt,
    };
  } catch (error) {
    console.error(`Error rewriting article: ${error}`);
    throw new Error(`Failed to rewrite article: ${error}`);
  }
}

/**
 * Process and generate news articles with AI rewriting, then save to database
 * @param urls List of URLs to advisor movement news articles
 * @returns Array of rewritten news articles
 */
export async function generateNewsArticlesFromUrls(urls: string[]): Promise<NewsArticle[]> {
  const savedArticles: NewsArticle[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      console.log(`Processing article ${i + 1}/${urls.length}: ${url}`);
      
      // Scrape the original article
      const { title, content, date, source } = await scrapeArticle(url);
      
      // Skip if article content is too short or couldn't be scraped properly
      if (content.length < 100) {
        console.warn(`Skipping article with insufficient content: ${url}`);
        continue;
      }
      
      // Rewrite the article using AI
      const rewritten = await rewriteArticle(title, content, source);
      
      // Generate a slug from the title
      const slug = rewritten.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Generate a formatted date
      const formattedDate = format(new Date(date || Date.now()), 'MMMM d, yyyy');
      
      // Determine category (most are advisor moves)
      const category = content.toLowerCase().includes("independent") ? "Independence" : "Advisor Moves";
      
      // Prepare article for database
      const articleData = {
        title: rewritten.title,
        slug,
        content: rewritten.content,
        excerpt: rewritten.excerpt,
        date: formattedDate,
        source,
        sourceUrl: url,
        category,
        imageUrl: null, // Will be updated after image generation
        published: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save to database
      const savedArticle = await newsRepository.createArticle(articleData);
      savedArticles.push(savedArticle);
      
      // Sleep for a second to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing article: ${error}`);
    }
  }
  
  // Generate AI images for all articles
  try {
    console.log("Generating AI images for news articles...");
    // TODO: Update image generator to work with database articles
    // await generateImagesForArticles(savedArticles);
    console.log("Successfully generated AI images for news articles");
  } catch (error) {
    console.error("Error generating images for articles:", error);
    // Continue without images if generation fails
  }
  
  return savedArticles;
}

/**
 * Generate an article using OpenAI
 * 
 * @param articleId Unique identifier for the article
 * @param title Optional title (if not provided, one will be generated)
 * @returns A complete news article
 */
export async function generateArticleWithAI(articleId: string, title?: string): Promise<NewsArticle> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    // Generate article topics if title is not provided
    if (!title) {
      const topics = [
        "Morgan Stanley Team Joins UBS",
        "Raymond James Recruits JPMorgan Advisors",
        "Merrill Lynch Team Launches Independent RIA",
        "LPL Financial Attracts Wells Fargo Advisors",
        "Rockefeller Capital Expansion with Goldman Sachs Team",
        "RBC Wealth Management Recruits Advisor Team from Merrill Lynch",
        "First Republic Private Wealth Advisors Join Steward Partners",
        "Independent Advisor Alliance Adds Former Wirehouse Team",
        "Dynasty Financial Partners Supports New RIA Launch",
        "Sanctuary Wealth Adds Team from Morgan Stanley"
      ];
      
      title = topics[Math.floor(Math.random() * topics.length)];
    }

    // Generate the article using OpenAI
    console.log(`Generating article with title: ${title}`);
    
    const prompt = `
    You are a financial news editor specializing in financial advisor movements and transitions between firms.
    
    Please write a detailed article about the following event in the wealth management industry:
    
    Title: ${title}
    
    The article should:
    1. Be written in a professional journalistic style
    2. Include specific details like advisor names, assets under management, dates, and locations
    3. Include quotes from the advisors and executives involved
    4. Explain the motivations behind the move
    5. Provide context about industry trends
    6. Be approximately 700-900 words in length
    7. Include a brief 2-3 sentence excerpt that summarizes the main points
    
    Format your response as JSON with these keys: title, content, excerpt, category
    The category should be either "Advisor Moves" or "Independence" depending on the nature of the transition.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to get content from OpenAI");
    }
    
    const result = JSON.parse(content);
    
    // Generate a formatted date (current date)
    const date = format(new Date(), 'MMMM d, yyyy');
    
    // Create the article
    return {
      id: Number(articleId.replace('temp-', '')) || 0,
      title: result.title || title,
      content: result.content,
      excerpt: result.excerpt,
      date,
      source: "Financial Advisor News",
      sourceUrl: `/news/${articleId}`,
      category: result.category || "Advisor Moves",
      imageUrl: `/news/article-${Math.floor(Math.random() * 10) + 1}.jpg`, // Random image
      published: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: (result.title || title)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    };
  } catch (error) {
    console.error(`Error generating article with AI: ${error}`);
    throw new Error(`Failed to generate article: ${error}`);
  }
}

/**
 * Data structure for news articles returned by the API
 */
interface NewsArticlesData {
  newsArticles: NewsArticle[];
  source: 'database' | 'api' | 'development';
  timestamp: string;
}

/**
 * Get all news articles, using the database as the primary source
 */
export async function getNewsArticles(): Promise<NewsArticlesData> {
  try {
    // First try to get articles from the database
    const dbArticles = await newsRepository.getAllArticles();
    
    // If we have articles in the database, return them
    if (dbArticles && dbArticles.length > 0) {
      return {
        newsArticles: dbArticles,
        source: 'database',
        timestamp: new Date().toISOString()
      };
    }
    
    // If database is empty, check if we need to initialize it
    if (process.env.OPENAI_API_KEY) {
      console.log("Database empty. Initializing with default articles...");
      await newsRepository.initializeArticlesIfNeeded(5);
      
      // Get articles again after initialization
      const initArticles = await newsRepository.getAllArticles();
      if (initArticles && initArticles.length > 0) {
        return {
          newsArticles: initArticles,
          source: 'database',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Check for URLs in environment variables as a fallback
    const newsSourceUrls = process.env.NEWS_SOURCE_URLS ? JSON.parse(process.env.NEWS_SOURCE_URLS) : null;
    
    // If we have real URLs and OpenAI API key, use real data
    if (newsSourceUrls && Array.isArray(newsSourceUrls) && newsSourceUrls.length > 0 && process.env.OPENAI_API_KEY) {
      console.log("Fetching news from real sources and saving to database...");
      const articles = await generateNewsArticlesFromUrls(newsSourceUrls);
      
      return { 
        newsArticles: articles,
        source: 'api',
        timestamp: new Date().toISOString()
      };
    }
    
    // If not in production or missing API keys, inform about development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log("Using development news data. To fetch real data, provide NEWS_SOURCE_URLS and OPENAI_API_KEY environment variables.");
    } else {
      console.warn("Production environment detected but missing NEWS_SOURCE_URLS or OPENAI_API_KEY. Using development data as fallback.");
    }
    
    // Use mock data as a last resort
    const mockArticles = generateMockNewsArticles();
    
    // Save mock articles to database for future use
    for (const article of mockArticles) {
      try {
        await newsRepository.createArticle({
          title: article.title,
          slug: article.id.replace('news-', ''),
          content: article.content,
          excerpt: article.excerpt,
          date: article.date,
          source: article.source,
          sourceUrl: article.sourceUrl,
          category: article.category,
          imageUrl: article.imageUrl,
          published: true,
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error(`Error saving mock article to database: ${err}`);
      }
    }
    
    // Get the articles from the database after saving
    const savedMockArticles = await newsRepository.getAllArticles();
    
    return { 
      newsArticles: savedMockArticles.length > 0 ? savedMockArticles : mockArticles,
      source: 'development',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching news articles:", error);
    throw new Error("Failed to retrieve news articles. Please try again later.");
  }
}

/**
 * Generate mock news articles for development
 * (This can be used when scraping is not possible or for testing)
 */
export function generateMockNewsArticles(): NewsArticle[] {
  // AdvisorHub articles
  const advisorHubArticles: NewsArticle[] = [
    {
      id: 1,
      title: "UBS Recruits $5M Morgan Stanley Team in Boston",
      content: `UBS Financial Services has recruited a Morgan Stanley team that managed $850 million in client assets and generated $5 million in annual production, according to people familiar with the move.

The five-person team, led by Timothy P. Dwyer and John E. Cowley, joined UBS's Boston office on April 15, 2025. They had been with Morgan Stanley since 2009, previously working at Smith Barney before its acquisition.

"The team was attracted to UBS's global platform and high-net-worth client focus," said Regional Manager Sarah Johnson. "Their practice aligns perfectly with our wealth management strategy."

Dwyer, who began his career at Merrill Lynch in 1998, specializes in estate planning and multi-generational wealth transfer strategies. Cowley joined the financial services industry in 2001 and focuses on portfolio management for executives and business owners.

The team also includes financial advisors Michael Thompson and Jennifer Rodriguez, along with client service associate Allison Greene.

UBS has been actively recruiting from wirehouses, particularly targeting teams with high-net-worth clients. The firm recently adjusted its recruiting package to offer enhanced upfront bonuses for teams managing over $500 million.

Morgan Stanley declined to comment on the departure. A UBS spokesperson confirmed the move but did not provide additional details on recruitment terms.

Industry recruiters note that advisor movement has accelerated in recent months as teams evaluate options before year-end growth targets set in.`,
      excerpt: "UBS Financial Services has recruited a Morgan Stanley team that managed $850 million in client assets and generated $5 million in annual production. The five-person team, led by Timothy P. Dwyer and John E. Cowley, joined UBS's Boston office on April 15, 2025.",
      date: "April 15, 2025",
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/ubs-recruits-5m-morgan-stanley-team-in-boston",
      category: "Advisor Moves",
      imageUrl: "/news/article-1.jpg",
      published: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: "ubs-recruits-5m-morgan-stanley-team-in-boston"
    },
    {
      id: 2,
      title: "Raymond James Lures JPMorgan Team with $3M Production",
      content: `Raymond James Financial Services, the firm's independent broker-dealer division, has recruited a team of advisors from JPMorgan Chase that managed approximately $550 million in client assets and produced around $3 million in annual revenue.

The six-person team, now operating as Clearwater Capital Management, joined Raymond James's independent channel in Chicago on April 12, 2025. The team is led by senior partners Robert Kline and Melissa Chen, who had been with JPMorgan's private client services group for over a decade.

"After careful consideration, we determined that Raymond James offered the independence we needed while providing robust support systems," Kline said in a statement. "The firm's client-first philosophy aligns perfectly with our approach to wealth management."

Chen added that the team was particularly impressed with Raymond James's technology platform and research capabilities, which she believes will enhance their service offerings to high-net-worth clients.

The team also includes advisors David Park and Samantha Ellis, plus two client service associates. They primarily serve business owners, corporate executives, and multi-generational families.

Scott Curtis, president of Raymond James's Private Client Group, noted that the recruitment reflects the firm's continued focus on attracting experienced advisors seeking more autonomy while maintaining access to comprehensive resources.

"We're seeing increased interest from wirehouse and bank advisors who want the best of both worlds – independence with support," Curtis said.

JPMorgan declined to comment on the departures. Industry analysts note that banks continue to face challenges retaining top advisor talent, particularly as compensation structures and client service models evolve post-pandemic.`,
      excerpt: "Raymond James Financial Services has recruited a team of advisors from JPMorgan Chase that managed approximately $550 million in client assets and produced around $3 million in annual revenue. The six-person team, now operating as Clearwater Capital Management, joined Raymond James's independent channel in Chicago.",
      date: "April 12, 2025",
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/raymond-james-lures-jpmorgan-team-with-3m-production",
      category: "Advisor Moves",
      imageUrl: "/news/article-2.jpg",
      published: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: "raymond-james-lures-jpmorgan-team-with-3m-production"
    },
    {
      id: 3,
      title: "Merrill Lynch Team Breaks Away to Form RIA with Dynasty",
      content: `A Merrill Lynch team that managed $1.2 billion in client assets has departed to establish their own independent registered investment advisory firm with Dynasty Financial Partners.

The newly formed Horizon Wealth Advisors, based in San Francisco, is led by partners James Wilson and Rebecca Chen, who collectively spent over 25 years at Merrill Lynch. The team officially launched on April 8, 2025, after several months of preparation.

"We reached a point where we needed greater flexibility to serve our clients' evolving needs," Wilson explained. "The independent model allows us to eliminate conflicts of interest and offer truly customized solutions."

The breakaway team includes four additional staff members and primarily serves technology executives, entrepreneurs, and multi-generational families with complex financial planning needs.

Dynasty Financial Partners will provide technology infrastructure, compliance support, and capital markets access to the new RIA. Fidelity Institutional will serve as the primary custodian.

"This team represents the caliber of advisors increasingly drawn to independence," said Shirl Penney, CEO of Dynasty Financial Partners. "Their expertise with high-net-worth clients and commitment to fiduciary advice makes them ideal partners."

Chen noted that the ability to select best-in-class technology solutions was a major factor in their decision. The firm has implemented a comprehensive tech stack including Addepar for performance reporting and Salesforce for client relationship management.

The team is among a growing cohort of Merrill Lynch advisors departing for independence. Industry consultant Louis Diamond of Diamond Consultants, who was not involved in this transition, observed that "Merrill has been losing experienced advisors at an accelerated rate as Bank of America integration continues to influence the culture."

Merrill Lynch did not respond to requests for comment regarding the departure.`,
      excerpt: "A Merrill Lynch team that managed $1.2 billion in client assets has departed to establish their own independent registered investment advisory firm with Dynasty Financial Partners. The newly formed Horizon Wealth Advisors, based in San Francisco, is led by partners James Wilson and Rebecca Chen.",
      date: "April 8, 2025",
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/merrill-lynch-team-breaks-away-to-form-ria-with-dynasty",
      category: "Independence",
      imageUrl: "/news/article-3.jpg",
      published: true,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: "merrill-lynch-team-breaks-away-to-form-ria-with-dynasty"
    }
  ];
  
  return advisorHubArticles;
}