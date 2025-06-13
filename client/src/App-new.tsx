import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { JwtAuthProvider, useJwtAuth } from "./hooks/use-jwt-auth";

// Import HomePage normally since it's the main entry point
import HomePage from "@/pages/home-page";

// Lazy load other pages to improve initial load time
const JwtAuthPage = lazy(() => import("@/pages/jwt-auth-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useJwtAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login page
    window.location.href = '/jwt-auth';
    return null;
  }
  
  return <Component />;
}

// Router component
function Router() {
  const [location] = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/jwt-auth" component={JwtAuthPage} />
        <Route path="/dashboard">
          <ProtectedRoute component={DashboardPage} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// App component
export default function App() {
  return (
    <JwtAuthProvider>
      <Router />
      <Toaster />
    </JwtAuthProvider>
  );
}