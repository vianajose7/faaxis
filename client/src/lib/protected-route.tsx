import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { AdminVerification } from "@/components/admin/admin-verification";
import { Button } from "@/components/ui/button";
import { hasDevAdminBypass } from "@/hmr-ws-patch";

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
  requireVerified = false
}: {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [adminVerified, setAdminVerified] = useState<boolean>(false);
  const [adminSessionBypass, setAdminSessionBypass] = useState<boolean>(false);
  const [, navigate] = useLocation();
  
  // No dev bypass allowed - all routes require proper authentication
  
  // All admin bypasses have been removed for security
  // No admin authentication bypasses allowed - strictly enforced
  useEffect(() => {
    // Clean up any legacy bypass data that might exist in localStorage
    try {
      // Remove any legacy bypass settings for security
      localStorage.removeItem('admin_bypass');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_session');
      localStorage.removeItem('dev_admin');
      
      // Set the bypass state to false to ensure protection
      setAdminSessionBypass(false);
      
      // For security, don't automatically verify - require proper verification
      setAdminVerified(false);
    } catch (error) {
      console.error("Error cleaning up legacy admin bypass settings:", error);
    }
  }, []);

  // Handle successful admin verification
  const handleAdminVerified = () => {
    setAdminVerified(true);
  };

  // Cast the component function to always return a non-null React element
  const SafeComponent = Component as () => React.ReactElement;
  
  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        // No admin bypasses allowed at all - always enforce proper authentication
        // Security has been fully hardened against all shortcuts
        
        if (!user) {
          // If we're already on the admin login page, don't redirect
          if (path === "/admin-login") {
            return <Component />;
          }
          
          // Redirect to specific pages based on requirements
          if (requireAdmin) {
            return <Redirect to="/admin-login" />;
          }
          return <Redirect to="/auth" />;
        }
        
        // Check admin requirement if needed
        if (requireAdmin && !user.isAdmin) {
          return (
            <div className="container max-w-6xl mx-auto py-10 px-4">
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
                <p className="text-muted-foreground text-center mb-6">
                  You need administrator privileges to access this page.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          );
        }
        
        // Additional verification for admin routes - no bypasses allowed
        if (requireAdmin && !adminVerified) {
          return (
            <div className="container max-w-md mx-auto py-10 px-4">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Verification Required</h1>
                <AdminVerification 
                  username={user?.username || 'admin'} 
                  onVerified={handleAdminVerified} 
                />
              </div>
            </div>
          );
        }
        
        // Check email verification requirement if needed - strict security enforced
        if (requireVerified && user && !(user.emailVerified === true)) {
          return (
            <div className="container max-w-6xl mx-auto py-10 px-4">
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
                <p className="text-muted-foreground text-center mb-6">
                  You need to verify your email address before accessing this secure area.
                </p>
                <Button
                  onClick={() => navigate("/verify-email")}
                >
                  Go to Verification Page
                </Button>
              </div>
            </div>
          );
        }
        
        // User is authenticated and passes all required checks
        return <SafeComponent />;
      }}
    </Route>
  );
}
