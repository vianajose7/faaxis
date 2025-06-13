import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function AdminBypass() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bypass, setBypass] = useState<boolean>(false);

  useEffect(() => {
    async function activateBypass() {
      try {
        // Set a fake admin user directly in the query cache
        queryClient.setQueryData(["/api/user"], {
          id: "admin-bypass",
          username: "admin@direct-access",
          emailVerified: true,
          isAdmin: true
        });

        // Wait a moment for the query cache to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Signal success
        setBypass(true);
        setLoading(false);
      } catch (err: any) {
        console.error("Admin bypass error:", err);
        setError(err.message || "Failed to activate admin bypass");
        setLoading(false);
      }
    }

    activateBypass();
  }, []);

  if (bypass) {
    return <Redirect to="/secure-management-portal" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Activating admin bypass...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Bypass Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            Try Again
          </Button>
        </div>
      ) : null}
    </div>
  );
}