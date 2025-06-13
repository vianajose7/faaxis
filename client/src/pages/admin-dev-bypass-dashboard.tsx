import React, { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import SecureManagementPortal from '@/pages/secure-management-portal';
import { setDevAdminBypass } from '@/hmr-ws-patch';

/**
 * Admin Dev Dashboard with Authentication Bypass
 * 
 * This component renders the actual SecureManagementPortal but first
 * activates the built-in dev admin bypass mechanism, which is already
 * integrated with the auth hooks.
 */
export default function AdminDevBypassDashboard() {
  // Log evidence that our component is rendering
  console.log("🎯 DEV BYPASS: Rendering AdminDevBypassDashboard with auth bypass");
  
  // Activate the admin bypass
  useEffect(() => {
    console.log("Activating dev admin bypass for SecureManagementPortal");
    
    // Set the dev admin bypass flag that the auth hook will check
    setDevAdminBypass();
    
    // Create a fake admin user
    const adminUser = {
      id: 'dev-bypass-admin',
      username: 'dev-admin@advisoro.com',
      firstName: 'Dev',
      lastName: 'Admin',
      fullName: 'Dev Admin',
      email: 'dev-admin@advisoro.com',
      isAdmin: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      lastLogin: new Date().toISOString()
    };

    // Set it in the query cache to trick the auth system
    queryClient.setQueryData(['/api/user'], adminUser);
    
    // Force a refetch of the user to pick up our changes
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    
    console.log("Injected fake admin user:", adminUser);
  }, []);
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm z-50">
        DEV ADMIN BYPASS ACTIVE - No authentication required
      </div>
      <div className="pt-6">
        <SecureManagementPortal />
      </div>
    </>
  );
}