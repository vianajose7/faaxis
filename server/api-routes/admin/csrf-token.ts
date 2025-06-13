import { Request, Response, Router } from 'express';

const router = Router();

/**
 * Get a CSRF token for protected routes
 * GET /api/admin/csrf-token
 */
router.get('/', (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Get CSRF token from request
    const csrfToken = (req as any).csrfToken();
    
    // Return the token
    return res.status(200).json({ csrfToken });
  } catch (error: any) {
    console.error('Error getting CSRF token:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;