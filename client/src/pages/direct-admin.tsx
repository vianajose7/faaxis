import { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

/**
 * Direct Admin Access Page
 * 
 * This is a temporary development-only page that provides direct 
 * access to the admin dashboard without authentication.
 * It works by setting a fake admin user object in localStorage and 
 * in the React Query cache, bypassing all authentication checks.
 */
export default function DirectAdminPage() {
  // State variables to track the bypass status
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On component mount, attempt to set up the admin bypass
  useEffect(() => {
    const setupAdminBypass = async () => {
      try {
        // Create a fake admin user
        const adminUser = {
          id: 'bypass-admin-id',
          username: 'admin@direct-access',
          fullName: 'Admin Bypass User',
          isAdmin: true, 
          emailVerified: true,
          createdAt: new Date().toISOString()
        };

        // Store it in localStorage
        localStorage.setItem('admin_bypass', 'true');
        localStorage.setItem('admin_user', JSON.stringify(adminUser));

        // Set it in the query cache
        queryClient.setQueryData(['/api/user'], adminUser);

        // Wait a brief moment for everything to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update status 
        setIsLoading(false);
        
        // Start automatic redirect after 1 second
        setTimeout(() => {
          setIsRedirecting(true);
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'Failed to set up admin bypass');
        setIsLoading(false);
      }
    };

    setupAdminBypass();
  }, []);

  // Handle manual redirect button click
  const handleManualRedirect = () => {
    setIsRedirecting(true);
  };

  // If we're redirecting, go to the admin dashboard
  if (isRedirecting) {
    return <Redirect to="/secure-management-portal" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLoading ? 'Setting Up Direct Admin Access...' : 
              error ? 'Setup Failed' : 'Admin Bypass Ready'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLoading ? 'Configuring temporary admin access...' : 
              error ? 'There was an error setting up the admin bypass' : 
              'You now have direct access to the admin dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Setting up admin bypass...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                <p>{error}</p>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md">
                <p>Admin bypass successfully configured!</p>
                <p className="text-sm mt-2">
                  Redirecting to admin dashboard automatically...
                </p>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={handleManualRedirect}
              >
                Go to Admin Dashboard Now
              </Button>
              <div className="text-center pt-4 text-sm text-muted-foreground">
                <p>This is a temporary development feature.</p>
                <p>It will be removed before production deployment.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}