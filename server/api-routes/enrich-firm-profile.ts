import { Request, Response } from 'express';
import { enhanceProfile } from '../openai-service';

/**
 * API endpoint for enriching an existing firm profile with AI
 * Use OpenAI to generate enhanced content based on existing firm information
 */
export async function enrichFirmProfileHandler(req: Request, res: Response) {
  try {
    const { firmName, currentDescription } = req.body;
    
    if (!firmName) {
      return res.status(400).json({ 
        message: "Firm name is required" 
      });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing for firm profile enrichment");
      return res.status(400).json({
        success: false,
        message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
      });
    }
    
    console.log(`Enriching profile for: ${firmName}`);
    
    // Call OpenAI to enhance the profile
    const enrichedData = await enhanceProfile(firmName, currentDescription || "");
    
    // Log what we're returning
    console.log("Returning enriched firm profile data:", {
      success: true,
      enrichedDescription: enrichedData.enhancedProfile || currentDescription,
      valuePropositions: enrichedData.valuePropositions || [],
      tagline: enrichedData.tagline || "",
      founded: enrichedData.founded || "",
      category: enrichedData.category || "",
      headquarters: enrichedData.headquarters || "",
      firmName
    });
    
    // Return the enriched content
    res.json({
      success: true,
      enrichedDescription: enrichedData.enhancedProfile || currentDescription,
      valuePropositions: enrichedData.valuePropositions || [],
      tagline: enrichedData.tagline || "",
      founded: enrichedData.founded || "",
      category: enrichedData.category || "",
      headquarters: enrichedData.headquarters || "",
      firmName
    });
  } catch (error: any) {
    console.error("Error enriching firm profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while enriching the firm profile"
    });
  }
}