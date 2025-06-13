import { Router } from 'express';
import { db, pool } from '../db';
import * as schema from '@shared/schema';
import { firmProfiles, calculationParameters, advisorTransitionLeads } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all firm profiles
router.get('/firm-profiles', async (req, res) => {
  try {
    // Fetch firm profiles from database using Drizzle ORM
    const profiles = await db.select().from(firmProfiles);
    
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching firm profiles:', error);
    res.status(500).json({ error: 'Failed to fetch firm profiles' });
  }
});

// Helper function to create slug from firm name
const createSlug = (name: string) => {
  if (!name) return '';
  
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/-+/g, '')
    .trim();
};

// No duplicate import needed

// Get a specific firm profile by slug - route order matters, so this comes first!
router.get('/firm-profiles/slug/:firmSlug', async (req, res) => {
  console.log('💡 DEBUGGING: Entering firm-profiles/slug/:firmSlug route handler');
  
  // Verify imports and database connection
  console.log('💡 DB connection imported:', !!db);
  console.log('💡 Pool imported:', !!pool);
  console.log('💡 FirmProfiles table defined:', !!firmProfiles);
  
  try {
    console.log('💡 Inside first try block');
    
    // For development only, bypass all authentication if SKIP_AUTH is enabled
    console.log('💡 SKIP_AUTH value:', process.env.SKIP_AUTH);
    if (process.env.SKIP_AUTH !== 'true') {
      // In production, check authentication and premium status
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      console.log('💡 User auth check - is authenticated:', isAuthenticated);
      const isPremium = req.user && req.user.isPremium;
      console.log('💡 User auth check - is premium:', isPremium || 'User object missing or not premium');
      
      if (!isAuthenticated || !isPremium) {
        console.log('💡 Auth check failed, returning 403');
        return res.status(403).json({ 
          error: 'Premium access required', 
          message: 'You need to upgrade to premium to access firm profiles' 
        });
      }
    } else {
      console.log('💡 SKIP_AUTH enabled, proceeding with request without authentication');
    }

    const { firmSlug } = req.params;
    console.log(`Searching for firm profile with slug: ${firmSlug}`);
    
    // First try to find a profile with the exact slug (if we have the slug column populated)
    try {
      console.log('Executing db query for slug:', firmSlug);
      console.log('Database connection status:', pool.totalCount, 'connections');
      console.log('DB schema loaded:', Object.keys(schema).join(', '));
      console.log('FirmProfiles definition:', JSON.stringify(firmProfiles));
      
      const profilesBySlug = await db.select()
        .from(firmProfiles)
        .where(eq(firmProfiles.slug, firmSlug));
      
      console.log('Query result for profiles by slug:', JSON.stringify(profilesBySlug));
        
      if (profilesBySlug.length > 0) {
        console.log(`Found profile by exact slug match: ${profilesBySlug[0].firm}`);
        return res.json(profilesBySlug[0]);
      }
    } catch (slugQueryError) {
      console.error('Error during exact slug query:', slugQueryError);
      // Continue with fallback approach
    }
    
    // If exact slug match fails, fetch all profiles and do client-side matching
    console.log('No exact slug match found, trying to match by generating slug from firm name');
    try {
      const allProfiles = await db.select().from(firmProfiles);
      
      // Verify we have profiles
      if (!allProfiles || allProfiles.length === 0) {
        console.log('No firm profiles found in database');
        return res.status(404).json({ error: 'No firm profiles available' });
      }
      
      console.log(`Found ${allProfiles.length} firm profiles to check against`);
      
      // Find the profile that matches the slug
      const matchingProfile = allProfiles.find(profile => {
        if (!profile.firm) return false;
        const generatedSlug = createSlug(profile.firm);
        const matches = generatedSlug === firmSlug;
        if (matches) {
          console.log(`Match found: ${profile.firm} → ${generatedSlug}`);
        }
        return matches;
      });
      
      if (!matchingProfile) {
        console.log(`No firm profile found for slug: ${firmSlug}`);
        // Log available firms for debugging
        console.log('Available firms:', allProfiles.map(p => `${p.firm} (${createSlug(p.firm || '')})`).join(', '));
        return res.status(404).json({ error: 'Firm profile not found' });
      }
      
      console.log(`Found profile by generated slug: ${matchingProfile.firm}`);
      
      // Update the profile to include the slug for future lookups
      try {
        await db.update(firmProfiles)
          .set({ slug: firmSlug })
          .where(eq(firmProfiles.id, matchingProfile.id));
        console.log(`Updated profile with slug: ${firmSlug}`);
      } catch (updateError) {
        console.error('Failed to update profile with slug:', updateError);
        // Don't fail the request if just the update fails
      }
      
      res.json(matchingProfile);
    } catch (allProfilesError) {
      console.error('Error fetching all firm profiles:', allProfilesError);
      throw allProfilesError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error fetching firm profile by slug:', error);
    res.status(500).json({ error: 'Failed to fetch firm profile' });
  }
});

// Get a specific firm profile by ID
router.get('/firm-profiles/id/:id', async (req, res) => {
  try {
    // For development only, bypass all authentication if SKIP_AUTH is enabled
    if (process.env.SKIP_AUTH !== 'true') {
      // In production, check authentication and premium status
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      const isPremium = req.user && req.user.isPremium;
      
      if (!isAuthenticated || !isPremium) {
        return res.status(403).json({ 
          error: 'Premium access required', 
          message: 'You need to upgrade to premium to access firm profiles' 
        });
      }
    }

    const { id } = req.params;
    
    // Fetch firm profile from database using Drizzle ORM
    const profiles = await db.select()
      .from(firmProfiles)
      .where(eq(firmProfiles.id, parseInt(id)));
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Firm profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching firm profile by ID:', error);
    res.status(500).json({ error: 'Failed to fetch firm profile' });
  }
});

// Get a specific firm profile by name
router.get('/firm-profiles/:firmName', async (req, res) => {
  try {
    // For development only, bypass all authentication if SKIP_AUTH is enabled
    if (process.env.SKIP_AUTH !== 'true') {
      // In production, check authentication and premium status
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      const isPremium = req.user && req.user.isPremium;
      
      if (!isAuthenticated || !isPremium) {
        return res.status(403).json({ 
          error: 'Premium access required', 
          message: 'You need to upgrade to premium to access firm profiles' 
        });
      }
    }

    const { firmName } = req.params;
    const decodedFirmName = decodeURIComponent(firmName);
    
    // Fetch firm profile from database using Drizzle ORM
    const profiles = await db.select()
      .from(firmProfiles)
      .where(eq(firmProfiles.firm, decodedFirmName));
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Firm profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching firm profile:', error);
    res.status(500).json({ error: 'Failed to fetch firm profile' });
  }
});

// Get calculator parameters for a specific firm
router.get('/calculator/parameters/:firmName', async (req, res) => {
  try {
    // For development only, bypass all authentication if SKIP_AUTH is enabled
    console.log('💡 SKIP_AUTH value for calculator endpoint:', process.env.SKIP_AUTH);
    if (process.env.SKIP_AUTH !== 'true') {
      // In production, check authentication and premium status
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      console.log('💡 Calculator endpoint - auth check - is authenticated:', isAuthenticated);
      const isPremium = req.user && req.user.isPremium;
      console.log('💡 Calculator endpoint - auth check - is premium:', isPremium || 'User object missing or not premium');
      
      if (!isAuthenticated || !isPremium) {
        console.log('💡 Calculator endpoint - auth check failed, returning 403');
        return res.status(403).json({ 
          error: 'Premium access required', 
          message: 'You need to upgrade to premium to access calculator parameters' 
        });
      }
    } else {
      console.log('💡 SKIP_AUTH enabled for calculator endpoint, proceeding without authentication');
    }
    
    const { firmName } = req.params;
    const decodedFirmName = decodeURIComponent(firmName);
    console.log(`💡 Fetching calculator parameters for: ${decodedFirmName}`);
    
    // Fetch calculator parameters from database using Drizzle ORM
    const params = await db.select()
      .from(calculationParameters)
      .where(eq(calculationParameters.firm, decodedFirmName));
    
    if (params.length === 0) {
      console.log(`💡 No calculator parameters found for: ${decodedFirmName}`);
      return res.json([]);
    }
    
    console.log(`💡 Found ${params.length} calculator parameters for: ${decodedFirmName}`);
    res.json(params);
  } catch (error) {
    console.error('Error fetching calculator parameters:', error);
    res.status(500).json({ error: 'Failed to fetch calculator parameters' });
  }
});

// Submit contact information from landing page
router.post('/contact/advisor-transition', async (req, res) => {
  try {
    const { name, email, phone, currentFirm, aum, message, targetFirm } = req.body;
    
    // Validate required fields
    if (!name || !email || !currentFirm || !targetFirm) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Save contact information to database using Drizzle ORM
    await db.insert(advisorTransitionLeads).values({
      name,
      email,
      phone: phone || null,
      currentFirm,
      aum: aum || null,
      message: message || null,
      targetFirm,
      createdAt: new Date()
    });
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving contact information:', error);
    res.status(500).json({ error: 'Failed to save contact information' });
  }
});

export default router;