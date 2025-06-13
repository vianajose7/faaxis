import { useAuth } from '@/hooks/use-auth';
import { useCallback } from 'react';

/**
 * A hook to handle premium user features and CTA visibility
 * Returns functions and states related to premium status
 */
export function usePremium() {
  const { user } = useAuth();
  
  /**
   * Determines if the user has a premium account
   * @returns boolean indicating if the user has premium access
   */
  const isPremium = useCallback(() => {
    // User must be logged in and have isPremium flag set to true
    return !!user && !!user.isPremium;
  }, [user]);

  /**
   * Determines if premium CTAs should be shown
   * @returns boolean indicating if upgrade CTAs should be visible
   */
  const shouldShowUpgradeCTA = useCallback(() => {
    // Hide CTAs if:
    // 1. User is premium
    // 2. User is not logged in (we'll show login/signup CTAs instead)
    return !!user && !user.isPremium;
  }, [user]);
  
  /**
   * Get premium verification object (for debugging/verification)
   * Contains details about the premium status
   */
  const getPremiumDetails = useCallback(() => {
    if (!user) {
      return {
        status: 'not-logged-in',
        isPremium: false,
        userId: null
      };
    }
    
    return {
      status: user.isPremium ? 'premium' : 'basic',
      isPremium: !!user.isPremium,
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId || null
    };
  }, [user]);
  
  return {
    isPremium,
    shouldShowUpgradeCTA,
    getPremiumDetails,
    // Convenience direct properties for simple cases
    hasPremium: !!user?.isPremium,
    showUpgrade: !!user && !user.isPremium,
  };
}