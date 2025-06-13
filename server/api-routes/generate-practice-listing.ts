import { Request, Response } from 'express';
import { generatePracticeListingProfile } from '../openai-service';

/**
 * API endpoint for generating a practice listing profile with AI
 * Uses OpenAI to create realistic practice listing data
 */
export async function generatePracticeListingHandler(req: Request, res: Response) {
  try {
    // Get seed information from request body, if any
    const seedInfo = req.body || {};
    
    // Validate that at least one seed field is provided (optional)
    // if (!seedInfo.name && !seedInfo.location && !seedInfo.aum && !seedInfo.specialty) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: "At least one seed parameter is required (name, location, aum, or specialty)" 
    //   });
    // }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing for practice listing generation");
      return res.status(400).json({
        success: false,
        message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
      });
    }
    
    console.log(`Generating practice listing profile with seed:`, seedInfo);
    
    // Call OpenAI to generate the practice listing
    const practiceData = await generatePracticeListingProfile(seedInfo);
    
    // If generation failed, return the error
    if (!practiceData.success) {
      return res.status(500).json({
        success: false,
        message: practiceData.error || "Failed to generate practice listing profile"
      });
    }
    
    // Return the generated practice listing data
    res.json({
      success: true,
      practice: practiceData.practice
    });
  } catch (error: any) {
    console.error("Error generating practice listing profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while generating the practice listing profile"
    });
  }
}