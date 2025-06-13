import { Request, Response, Router } from 'express';
import { storage } from '../../storage';

const router = Router();

/**
 * Log an admin activity
 * POST /api/admin/activity-log
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const { action, entityType, entityId, details } = req.body;
    
    if (!action || !entityType) {
      return res.status(400).json({ message: 'Missing required fields: action and entityType are required' });
    }
    
    // Log the activity
    await storage.logActivity({
      userId: (req.user as any).id,
      action,
      entityType,
      entityId: entityId || null,
      details: details || '',
      timestamp: new Date()
    });
    
    // Return success response
    return res.status(200).json({ message: 'Activity logged successfully' });
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Get recent activity logs
 * GET /api/admin/activity-log
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    
    // Get recent activity logs
    const logs = await storage.getRecentActivityLogs(limit);
    
    // Return success response
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error getting activity logs:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;