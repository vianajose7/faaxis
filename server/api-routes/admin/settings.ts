import { Request, Response, Router } from 'express';
import { db } from '../../db';
import { storage } from '../../storage';

const router = Router();

/**
 * Save AI settings
 * POST /api/admin/settings/ai
 */
router.post('/ai', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const aiSettings = req.body;
    
    if (!aiSettings) {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    
    // Save the settings to the database
    await storage.saveSettings('ai', aiSettings);
    
    // Return success response
    return res.status(200).json({ message: 'AI settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving AI settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Save email settings
 * POST /api/admin/settings/email
 */
router.post('/email', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const emailSettings = req.body;
    
    if (!emailSettings) {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    
    // Save the settings to the database
    await storage.saveSettings('email', emailSettings);
    
    // Return success response
    return res.status(200).json({ message: 'Email settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving email settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Save SEO settings
 * POST /api/admin/settings/seo
 */
router.post('/seo', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const seoSettings = req.body;
    
    if (!seoSettings) {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    
    // Save the settings to the database
    await storage.saveSettings('seo', seoSettings);
    
    // Return success response
    return res.status(200).json({ message: 'SEO settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving SEO settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Save system settings
 * POST /api/admin/settings/system
 */
router.post('/system', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const systemSettings = req.body;
    
    if (!systemSettings) {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    
    // Save the settings to the database
    await storage.saveSettings('system', systemSettings);
    
    // Return success response
    return res.status(200).json({ message: 'System settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving system settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Get all settings
 * GET /api/admin/settings
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Get all settings
    const settings = await storage.getAllSettings();
    
    // Return success response
    return res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Get specific settings by type
 * GET /api/admin/settings/:type
 */
router.get('/:type', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ message: 'Setting type is required' });
    }
    
    // Get settings by type
    const settings = await storage.getSettings(type);
    
    // Return success response
    return res.status(200).json(settings);
  } catch (error: any) {
    console.error(`Error getting ${req.params.type} settings:`, error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;