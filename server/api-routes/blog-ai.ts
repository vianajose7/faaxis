import { Router } from "express";
import { generateBlogPost } from "../openai-service";

const router = Router();

// AI-powered blog post generation from URL
router.post("/posts/generate-ai", async (req, res) => {
  try {
    const { articleUrl, instructions, publishByDefault = false, settings } = req.body;
    
    if (!articleUrl) {
      return res.status(400).json({ error: "Article URL is required" });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "OpenAI API key is not configured", 
        message: "The OpenAI API key is required for this feature. Please add it to your environment variables."
      });
    }
    
    console.log(`Generating blog post content from URL: ${articleUrl}`);
    console.log(`Publish by default setting: ${publishByDefault}`);
    
    const generatedContent = await generateBlogPost({ 
      url: articleUrl, 
      instructions, 
      settings 
    });
    
    // Normalize category if it's advisor transitions
    let normalizedContent = { ...generatedContent };
    if (normalizedContent.category === 'advisor-transitions' || normalizedContent.category === 'transitions') {
      console.log(`Normalizing AI generated blog post category from '${normalizedContent.category}' to 'moves'`);
      normalizedContent.category = 'moves';
    }
    
    // Add the publish setting to the response
    const responseData = {
      ...normalizedContent,
      published: publishByDefault, // Set published flag based on settings
      generatedAt: new Date().toISOString()
    };
    
    res.json(responseData);
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    res.status(500).json({ 
      error: "Failed to generate blog post", 
      message: error.message
    });
  }
});

export default router;