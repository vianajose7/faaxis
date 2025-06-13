import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user

// Initialize OpenAI client - using lazy initialization for security
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
    console.log("OpenAI client initialized successfully");
  }
  
  return openaiInstance;
}

// For backward compatibility
const openai = getOpenAI();

interface GenerateBlogPostOptions {
  url: string;
  instructions?: string;
  settings?: {
    tone?: string;
    length?: string;
    seoKeywords?: string[];
    audience?: string;
  };
}

// Function for basic blog content generation
export async function generateBlogContent(prompt: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert financial writer who produces high-quality blog content for financial advisors." 
        },
        { 
          role: "user", 
          content: `Generate a professional blog post about the following topic: ${prompt}. Format the content with proper HTML markup including headings, paragraphs, and lists where appropriate.` 
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating blog content:", error);
    throw new Error(`Failed to generate blog content: ${error.message}`);
  }
}

// Function to enhance firm profiles with AI
export async function enhanceProfile(firmName: string, description: string): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    // Create a more structured prompt to ensure correct JSON format
    const prompt = `
    Enhance this financial advisor firm profile to make it more compelling to potential clients.
    
    Firm name: ${firmName}
    Current description: ${description}
    
    Respond with a JSON object following EXACTLY this structure:
    {
      "enhancedDescription": "An enhanced profile description (2-3 paragraphs)",
      "keyValuePropositions": ["value 1", "value 2", "value 3", "value 4", "value 5"],
      "tagline": "A compelling tagline/slogan for the firm",
      "foundedYear": "YYYY format - provide a realistic estimate if not mentioned",
      "companyCategory": "Must be exactly one of: Wirehouse, Regional, Independent, or Supported Indy",
      "headquartersLocation": "City, State format"
    }
    
    The year MUST be in numeric format (e.g., "1985" not "Founded in 1985").
    The headquartersLocation MUST be in "City, State" format.
    The companyCategory MUST be one of the exact options specified.
    `;

    console.log("Sending profile enrichment request to OpenAI for:", firmName);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert marketing consultant specializing in financial advisor firm branding. Always provide factual information when available, and realistic estimates when not. Always respond with VALID JSON that matches the requested structure exactly." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log("Received response from OpenAI");
    
    // Parse and validate the response
    let enhancedProfile;
    try {
      enhancedProfile = JSON.parse(completion.choices[0].message.content || "{}");
      console.log("Parsed OpenAI response:", JSON.stringify(enhancedProfile, null, 2).substring(0, 200) + "...");
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.log("Raw response:", completion.choices[0].message.content);
      throw new Error("Invalid response format from AI service");
    }
    
    // Ensure all fields exist with proper fallbacks
    const result = {
      enhancedProfile: enhancedProfile.enhancedDescription || description,
      valuePropositions: Array.isArray(enhancedProfile.keyValuePropositions) 
        ? enhancedProfile.keyValuePropositions 
        : [],
      tagline: enhancedProfile.tagline || "",
      founded: enhancedProfile.foundedYear || "",
      category: enhancedProfile.companyCategory || "",
      headquarters: enhancedProfile.headquartersLocation || ""
    };
    
    console.log("Returning structured profile data:", JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error("Error enhancing profile:", error);
    throw new Error(`Failed to enhance profile: ${error.message}`);
  }
}

// Function to summarize and rewrite content from a URL
export async function generateBlogPost({ url, instructions, settings }: GenerateBlogPostOptions) {
  try {
    // Validate input
    if (!url) {
      throw new Error("URL is required");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required. Please set the OPENAI_API_KEY environment variable.");
    }

    // Fetch the content from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch content from URL: ${response.statusText}`);
    }

    const htmlContent = await response.text();

    // Extract main text content from HTML (basic processing)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit content to avoid token limits

    // Build the prompt with settings and instructions
    let fullPrompt = `You are an expert financial advisor content writer. Rewrite this article as a new blog post for a financial services website. `;

    if (settings) {
      if (settings.tone) fullPrompt += `Use a ${settings.tone} tone. `;
      if (settings.length) fullPrompt += `Make the content ${settings.length}. `;
      if (settings.audience) fullPrompt += `The target audience is ${settings.audience}. `;
      if (settings.seoKeywords && settings.seoKeywords.length > 0) 
        fullPrompt += `Include these SEO keywords naturally: ${settings.seoKeywords.join(', ')}. `;
    }

    if (instructions) {
      fullPrompt += `\nAdditional instructions: ${instructions}\n\n`;
    }

    fullPrompt += `Original content:\n${textContent}\n\n`;
    fullPrompt += `Respond with a JSON object containing the following fields: 
    {
      "title": "An engaging title for the blog post",
      "content": "The full HTML content including paragraphs and headings",
      "excerpt": "A short summary of the post (max 150 characters)",
      "category": "One of: industry-trends, market-updates, practice-management, moves, technology, wealth-management, advisor-insights",
      "tags": ["tag1", "tag2", "tag3"]
    }`;

    // Call the OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an expert content writer specializing in financial advisory services."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = chatCompletion.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    throw new Error(`Failed to generate blog post: ${error.message}`);
  }
}

// Function to extract article from URL for the blog generator
export async function extractArticleContent(url: string) {
  try {
    // Fetch the content from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch content from URL: ${response.statusText}`);
    }

    const htmlContent = await response.text();

    // Use OpenAI to extract the main article content and identify key information
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an assistant that extracts the main article content from a webpage and identifies key information."
        },
        {
          role: "user",
          content: `Extract the main article content from this HTML. Ignore navigation, ads, footers, etc. 
                   Return a JSON with 'title', 'author' (if available), 'mainContent' (the article text only), 
                   and 'keywords' (list of 5 key topics).\n\n${htmlContent.substring(0, 10000)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error: any) {
    console.error("Error extracting article content:", error);
    throw new Error(`Failed to extract article content: ${error.message}`);
  }
}

// Function to generate company data for firm profiles
export async function generateCompanyData(firmName: string): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    const prompt = `
    Generate realistic company information for a financial advisory firm named "${firmName}".
    
    Please provide the following as a JSON object:
    1. A brief company history and mission
    2. Key personnel (CEO/Founder, CIO, etc.)
    3. Headquarters location
    4. Year founded
    5. Specializations
    6. Awards/recognitions
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an AI research assistant that generates realistic company profiles for financial advisory firms." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const companyData = JSON.parse(completion.choices[0].message.content || "{}");
    return companyData;
  } catch (error: any) {
    console.error("Error generating company data:", error);
    throw new Error(`Failed to generate company data: ${error.message}`);
  }
}

/**
 * Generate a randomized practice listing profile using AI
 * Creates realistic practice listings with varied attributes
 */
export async function generatePracticeListingProfile(seedInfo: {
  name?: string;
  location?: string;
  aum?: string;
  specialty?: string;
} = {}): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    // Use seed information if provided, otherwise request randomization
    const prompt = `
    Generate a realistic practice listing profile for a financial advisor${seedInfo.name ? ` named "${seedInfo.name}"` : ""}${seedInfo.location ? ` located in ${seedInfo.location}` : ""}${seedInfo.specialty ? ` specializing in ${seedInfo.specialty}` : ""}.
    
    Please provide the following as a JSON object:
    {
      "advisorName": "Full name of advisor",
      "practiceTitle": "Title of the practice",
      "location": "City, State",
      "aum": "${seedInfo.aum || "An assets under management value between $10M and $5B"}",
      "founded": "YYYY format - year the practice was founded (between 1980 and 2023)",
      "clientCount": "Number of clients (typically 50-500)",
      "clientMinimum": "Minimum client investment (e.g., $250K)",
      "feeStructure": "Fee structure description (e.g., '1% of AUM up to $1M, 0.8% above')",
      "specialty": "Primary specialty of the practice",
      "credentials": ["List of credentials like CFP, CFA, etc."],
      "services": ["Array of 3-6 services offered"],
      "background": "Brief professional background (1-2 paragraphs)",
      "philosophy": "Brief investment/advisory philosophy (1 paragraph)",
      "yearsCertified": "Number of years certified (5-40)",
      "teamSize": "Number of team members (1-50)",
      "contactEmail": "Realistic professional email address",
      "phoneNumber": "Formatted phone number",
      "website": "Professional website URL"
    }
    `;

    console.log("Generating practice listing profile, using seed info:", seedInfo);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert in financial advisory practices who creates realistic practice profiles with convincing, varied details. Make each profile unique with realistic numbers, specialty areas, and credentials." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.9, // Higher temperature for more randomization
    });

    try {
      const practiceData = JSON.parse(completion.choices[0].message.content || "{}");
      console.log("Generated practice listing profile successfully");
      return {
        success: true,
        practice: practiceData
      };
    } catch (parseError) {
      console.error("Failed to parse practice listing profile data:", parseError);
      throw new Error("Failed to generate valid practice listing data");
    }
  } catch (error: any) {
    console.error("Error generating practice listing profile:", error);
    return {
      success: false,
      error: error.message || "Failed to generate practice listing profile"
    };
  }
}