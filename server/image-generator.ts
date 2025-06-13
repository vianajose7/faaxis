import OpenAI from "openai";
import { NewsArticle } from "./news-generator";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

// Convert fs functions to promise-based for better async handling
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);

// Initialize OpenAI client - using the same pattern as other services
let openai: OpenAI | null = null;

// Create safe OpenAI client initialization function
function getOpenAIClient(): OpenAI {
  // Only initialize once
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.");
    }
    
    // Validate API key format
    const apiKey = process.env.OPENAI_API_KEY.trim();
    
    // Basic validation - check if it's a non-empty string with valid prefix
    // Accept both standard 'sk-' keys and project-specific 'sk-proj-' keys
    if (!apiKey || typeof apiKey !== 'string' || !(apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'))) {
      throw new Error("Invalid OpenAI API key format. API keys should start with 'sk-' or 'sk-proj-'");
    }
    
    // Initialize the client
    openai = new OpenAI({ apiKey });
  }
  
  return openai;
}

/**
 * Generate an image for a blog post or news article
 * @param article The article or blog post to generate an image for
 * @param outputPath Optional custom output path for the generated image
 * @returns The path to the saved image
 */
export async function generateImageForArticle(
  article: NewsArticle,
  outputPath?: string
): Promise<string> {
  try {
    console.log(`Generating image for article: ${article.title}`);
    
    // Create a prompt based on the article content
    const prompt = generateImagePrompt(article);
    
    // Generate the image using OpenAI
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Get the image URL
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image: No URL returned");
    }
    
    // Download and save the image
    const imagePath = await downloadAndSaveImage(imageUrl, article.id, outputPath);
    
    console.log(`Successfully generated image for article: ${article.title}`);
    return imagePath;
  } catch (error) {
    console.error(`Error generating image for article: ${error}`);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a batch of images for multiple articles
 * @param articles List of articles to generate images for
 * @param outputDir Optional custom output directory for the generated images
 * @returns Object mapping article IDs to image paths
 */
/**
 * Generate an image for a specific article by ID
 * @param articleId The ID of the article to generate an image for
 * @param article Optional article data (if not provided, will be fetched from the news generator)
 * @returns The URL path to the generated image
 */
export async function generateImageForArticleById(
  articleId: string, 
  article?: NewsArticle
): Promise<string | null> {
  try {
    console.log(`Generating image for specific article ID: ${articleId}`);
    
    // If article data isn't provided, try to find it
    if (!article) {
      // Import the news generator to fetch articles
      const { getNewsArticles } = await import('./news-generator');
      const newsData = await getNewsArticles();
      
      // Find the article with the matching ID
      article = newsData.newsArticles.find(a => a.id === articleId);
      
      if (!article) {
        throw new Error(`Article with ID ${articleId} not found`);
      }
    }
    
    // Create output directory if needed
    const outputDir = "public/news";
    try {
      await mkdirAsync(outputDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error(`Error creating output directory: ${error}`);
        throw error;
      }
    }
    
    // Generate image for this article
    const imagePath = await generateImageForArticle(article, path.join(outputDir, `article-${articleId}.jpg`));
    
    // Update article with image URL path
    const imageUrlPath = `/news/article-${articleId}.jpg`;
    article.imageUrl = imageUrlPath;
    
    console.log(`Successfully generated image for article ${articleId}`);
    return imageUrlPath;
  } catch (error) {
    console.error(`Error generating image for article ${articleId}: ${error}`);
    return null;
  }
}

export async function generateImagesForArticles(
  articles: NewsArticle[],
  outputDir: string = "public/news"
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  // Make sure output directory exists
  try {
    await mkdirAsync(outputDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error(`Error creating output directory: ${error}`);
      throw error;
    }
  }
  
  // Generate images for each article
  for (const article of articles) {
    try {
      // Delay between requests to avoid rate limiting
      if (articles.indexOf(article) > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate image
      const imagePath = await generateImageForArticle(article, path.join(outputDir, `article-${article.id}.jpg`));
      
      // Update article with image URL
      results[article.id] = imagePath;
      article.imageUrl = `/news/article-${article.id}.jpg`;
    } catch (error) {
      console.error(`Error generating image for article ${article.id}: ${error}`);
      // Continue with other articles even if one fails
    }
  }
  
  return results;
}

/**
 * Create an image generation prompt based on article content
 * @param article The article to generate a prompt for
 * @returns Image generation prompt
 */
function generateImagePrompt(article: NewsArticle): string {
  // Basic prompt template
  let prompt = `Create a professional, photorealistic image depicting financial advisors in a business setting, suitable for a news article titled "${article.title}". `;
  
  // Detect the type of article
  if (article.category === "Advisor Moves" || article.title.toLowerCase().includes("recruit") || article.title.toLowerCase().includes("join") || article.title.toLowerCase().includes("team")) {
    prompt += "Show financial advisors in a professional meeting, possibly in a modern office with glass walls, discussing business opportunities. Include subtle hints of transition and new beginnings. Use warm professional lighting.";
  } else if (article.category === "Independence" || article.title.toLowerCase().includes("independent") || article.title.toLowerCase().includes("ria") || article.title.toLowerCase().includes("form")) {
    prompt += "Depict financial advisors launching their independent practice. Show them in a modern, boutique office space with their own branding visible. Convey a sense of ownership and entrepreneurship.";
  } else {
    prompt += "Show professional financial advisors in a consulting situation, analyzing market data or meeting with clients. Include elements that convey trust, expertise and financial growth.";
  }
  
  // Add style guidance
  prompt += " The image should be high quality, appropriate for a financial news publication, with professional lighting and composition. No text or watermarks.";
  
  return prompt;
}

/**
 * Download an image from a URL and save it to disk
 * @param imageUrl URL of the image to download
 * @param articleId ID of the article (used for filename)
 * @param customPath Optional custom path to save the image
 * @returns Path to the saved image
 */
async function downloadAndSaveImage(
  imageUrl: string,
  articleId: string,
  customPath?: string
): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    // Get image data
    const imageBuffer = await response.arrayBuffer();
    
    // Determine save path
    const outputDir = "public/news";
    try {
      await mkdirAsync(outputDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error(`Error creating output directory: ${error}`);
      }
    }
    
    const savePath = customPath || path.join(outputDir, `article-${articleId}.jpg`);
    
    // Save the image
    await writeFileAsync(savePath, Buffer.from(imageBuffer));
    
    return savePath;
  } catch (error) {
    console.error(`Error downloading and saving image: ${error}`);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}