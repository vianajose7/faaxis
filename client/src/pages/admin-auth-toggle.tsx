import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminAuthToggle() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Show toast notification about feature being removed
    toast({
      title: "Feature Removed",
      description: "Authentication bypass has been permanently disabled for security reasons.",
      variant: "default"
    });
  }, [toast]);

  // Redirect to admin page
  const handleReturn = () => {
    setLocation('/admin');
  };

  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Enhanced Security Mode
          </CardTitle>
          <CardDescription>
            Authentication security has been improved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Bypass Removed</AlertTitle>
            <AlertDescription>
              The authentication bypass feature has been permanently disabled to enhance security.
              All users must now authenticate properly with valid credentials and two-factor authentication.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground mt-4">
            <p className="mb-2 font-medium">Security Enhancements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Development authentication bypass has been removed</li>
              <li>Two-factor authentication (2FA) is now required for admin access</li>
              <li>Improved session management and CSRF protection</li>
              <li>Enhanced security logging and monitoring</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleReturn}
          >
            Return to Admin Panel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}