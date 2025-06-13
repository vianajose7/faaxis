import OpenAI from "openai";
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

// Convert fs functions to promise-based for better async handling
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set. Blog generation features will not work correctly.");
}

// Initialize OpenAI client - using lazy initialization pattern for security
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

// Validate if we have a valid API key before making requests
function validateApiKey() {
  try {
    getOpenAIClient();
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to initialize OpenAI client");
    }
  }
}

/**
 * Scrape content from a source URL
 * @param url URL to scrape content from
 * @returns Extracted text content
 */
async function scrapeContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and other non-content elements
    $('script, style, nav, footer, header, aside, iframe, .cookie-banner, .ad, .advertisement').remove();
    
    // Extract the title
    const title = $('title').text().trim();
    
    // Extract the main content
    // Try to focus on article content, main elements, or divs with content
    let content = $('article').text() || 
                 $('main').text() || 
                 $('.content, .post-content, .entry-content, .article-content').text();
    
    // If no specific content container found, take the body content
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up the content
    content = content.replace(/\\s+/g, ' ').trim();
    
    // Return a structured object with the title and content
    return `Title: ${title}\n\nContent: ${content}`;
  } catch (error) {
    console.error('Error scraping content:', error);
    throw new Error('Failed to scrape content from the provided URL');
  }
}

/**
 * Search Google for additional context
 * @param query Search query
 * @returns Additional context from search results
 */
async function searchForContext(query: string): Promise<string> {
  // Note: In a real implementation, this would use an actual Google Search API
  // For now, we'll simulate this functionality
  try {
    // First validate the API key
    validateApiKey();
    const client = getOpenAIClient();
    
    // Simulate Google search results with OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a search engine. Given a query, provide 3-5 short factual summary points that might appear in search results. Format as bullet points with source attribution in parentheses. Focus only on objective information that would be useful for writing an article."
        },
        {
          role: "user",
          content: `Search query: ${query}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return response.choices[0].message.content || "No additional context found.";
  } catch (error) {
    console.error('Error searching for context:', error);
    return "Failed to gather additional context.";
  }
}

/**
 * Generate blog content using OpenAI
 * @param sourceContent Content scraped from the source URL
 * @param additionalContext Additional context from search
 * @param prompt User's custom instructions
 * @returns Generated blog content
 */
async function generateBlogContent(
  sourceContent: string,
  additionalContext: string,
  prompt: string
): Promise<{ title: string; content: string; excerpt: string }> {
  try {
    // Prepare the system message with instructions
    const systemMessage = `You are an expert financial advisor content writer. Your task is to write a high-quality article based on the provided source content and additional context. 
    
Follow these formatting guidelines:
1. Start with a clear title using a single # heading
2. Use ## for main sections and ### for subsections
3. Keep paragraphs short (3-4 sentences maximum) with blank lines between them
4. Add bullet points or numbered lists for easy scanning
5. Include proper spacing throughout the document
6. Use **bold text** for emphasis on key points
7. Add a "Key Takeaways" section at the end
8. Format the article in proper Markdown with clear heading hierarchy

Content guidelines:
1. Create original content (not copied from source)
2. Use professional but conversational tone
3. Include relevant statistics and data when available
4. Make content actionable for financial advisors
5. Structure content in a logical flow with clear transitions

Custom instructions from the user: ${prompt}`;

    // Validate the API key and get the client
    validateApiKey();
    const client = getOpenAIClient();
    
    // Generate the content
    const response = await client.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: `SOURCE CONTENT:\n${sourceContent}\n\nADDITIONAL CONTEXT:\n${additionalContext}\n\nCreate a well-structured article for financial advisors based on this information.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });
    
    const generatedContent = response.choices[0].message.content || "";
    
    // Generate a title and excerpt if not included in the content
    const titleMatch = generatedContent.match(/^#\s(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled Article";
    
    // Create an excerpt from the first paragraph (excluding headings)
    const contentLines = generatedContent.split('\n');
    let excerpt = "";
    for (const line of contentLines) {
      if (line && !line.startsWith('#') && line.length > 50) {
        excerpt = line.substring(0, 160) + (line.length > 160 ? "..." : "");
        break;
      }
    }
    
    if (!excerpt && contentLines.length > 0) {
      excerpt = contentLines[0].substring(0, 160);
    }
    
    // Format Markdown to basic HTML for proper display in the rich text editor
    const formattedContent = generatedContent
      // Replace headings with HTML tags
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Replace bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Replace italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Replace bullet points with proper list items
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Wrap list items in unordered lists
      .replace(/(<li>.*<\/li>\n)+/g, (match) => `<ul>${match}</ul>`)
      // Replace numbered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Wrap numbered list items in ordered lists
      .replace(/(<li>.*<\/li>\n)+/g, (match) => {
        // Only wrap in ol if not already wrapped in ul (which we did in the previous step)
        if (!match.includes('<ul>')) {
          return `<ol>${match}</ol>`;
        }
        return match;
      })
      // Replace paragraphs (text blocks separated by blank lines)
      .replace(/^(?!<[ho]|<li|<ul|<ol)(.+)$/gm, '<p>$1</p>');

    return {
      title,
      content: formattedContent,
      excerpt: excerpt || "No excerpt available."
    };
    
  } catch (error: any) {
    console.error('Error generating blog content:', error);
    const errorMessage = error.message || 'Unknown error';
    throw new Error(`Failed to generate blog content: ${errorMessage}`);
  }
}

/**
 * Generate an image for a blog post using OpenAI
 * @param title Blog post title
 * @param excerpt Blog post excerpt or summary
 * @param blogId Unique identifier for the blog post
 * @returns Path to the generated image
 */
export async function generateBlogImage(
  title: string,
  excerpt: string,
  blogId: string
): Promise<string> {
  try {
    console.log(`Generating image for blog: ${title}`);
    
    // Create a prompt for the image generation
    const prompt = `Create a professional, photorealistic image for a financial advisory blog titled "${title}". 
    The blog is about: ${excerpt}
    
    The image should:
    - Be suitable for a professional financial services website
    - Have high-quality, professional composition
    - Include visual elements related to finance, wealth management, or business growth
    - Convey trust, expertise, and professionalism
    - Have a clean, modern aesthetic with warm professional lighting
    - No text overlays or watermarks
    `;
    
    // Get the OpenAI client
    validateApiKey();
    const client = getOpenAIClient();
    
    // Generate the image
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Get the generated image URL
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image: No URL returned");
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = "public/blog";
    try {
      await mkdirAsync(outputDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error(`Error creating output directory: ${error}`);
        throw error;
      }
    }
    
    // Download the image and save it
    const response2 = await fetch(imageUrl);
    if (!response2.ok) {
      throw new Error(`Failed to download image: ${response2.status} ${response2.statusText}`);
    }
    
    // Get image data as buffer
    const imageBuffer = await response2.arrayBuffer();
    
    // Generate a filename and save path
    const imageName = `blog-${blogId}.jpg`;
    const savePath = path.join(outputDir, imageName);
    
    // Save the image
    await writeFileAsync(savePath, Buffer.from(imageBuffer));
    
    console.log(`Successfully generated and saved image for blog: ${title}`);
    
    // Return the public URL path to the image
    return `/blog/${imageName}`;
  } catch (error) {
    console.error(`Error generating blog image: ${error}`);
    throw new Error(`Failed to generate blog image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function to generate blog content
 * @param sourceUrl URL to an existing article
 * @param prompt User's custom instructions
 * @param generateImage Whether to generate an image for the blog post
 * @returns Generated blog content with optional image URL
 */
export async function generateBlog(
  sourceUrl: string,
  prompt: string,
  generateImage: boolean = false
): Promise<{ title: string; content: string; excerpt: string; imageUrl?: string }> {
  try {
    // 1. Scrape content from the source URL
    const sourceContent = await scrapeContent(sourceUrl);
    
    // 2. Extract a search query from the source content
    const searchQuery = sourceContent.substring(0, 150).replace(/Title:|Content:/g, '').trim();
    
    // 3. Search for additional context
    const additionalContext = await searchForContext(searchQuery);
    
    // 4. Generate blog content using OpenAI
    const blogContent = await generateBlogContent(
      sourceContent,
      additionalContext,
      prompt
    );
    
    // 5. Generate image if requested
    if (generateImage) {
      try {
        // Create a unique ID for the blog
        const blogId = `blog-${Date.now()}`;
        
        // Generate image using the blog title and excerpt
        const imageUrl = await generateBlogImage(
          blogContent.title,
          blogContent.excerpt,
          blogId
        );
        
        // Return blog content with image URL
        return {
          ...blogContent,
          imageUrl
        };
      } catch (imageError) {
        console.error("Failed to generate blog image:", imageError);
        // Continue without image
        return blogContent;
      }
    }
    
    // Return blog content without image
    return blogContent;
  } catch (error: any) {
    console.error('Error in blog generation pipeline:', error);
    throw error;
  }
}