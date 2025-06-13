import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Import critical pages normally to avoid lazy loading issues
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";

// Lazy load other pages to improve initial load time
const AuthTestPage = lazy(() => import("@/pages/auth-test-page"));
const AuthTokenTestPage = lazy(() => import("@/pages/auth-token-test"));
const AuthResetPage = lazy(() => import("@/pages/auth-reset"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));
const AdminResetPage = lazy(() => import("@/pages/admin-reset"));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard"));
const AdminBypassPage = lazy(() => import("@/pages/admin-bypass"));
const AdminAuthTogglePage = lazy(() => import("@/pages/admin-auth-toggle"));
const DirectAdminPage = lazy(() => import("@/pages/direct-admin"));
const ResetAdminPasswordPage = lazy(() => import("@/pages/reset-admin-password"));
const AdminDevBypassDashboard = lazy(() => import("@/pages/admin-dev-bypass-dashboard"));
const DevAdminShowcase = lazy(() => import("@/pages/admin-dev-showcase"));
// Dev Dashboard removed as requested
// Test pages removed as they're no longer needed
const CalculatorPage = lazy(() => import("@/pages/calculator-page"));
const SubmitFirmPage = lazy(() => import("@/pages/submit-firm-page"));
const SubmitFirmPaymentPage = lazy(() => import("@/pages/submit-firm-payment"));
const CheckoutPage = lazy(() => import("@/pages/checkout-page"));
const CheckoutPageNew = lazy(() => import("@/pages/checkout-page-new"));
// Stripe payment handling components
const PaymentSuccessPage = lazy(() => import("@/pages/payment-success"));
// Now that Stripe keys are updated, we can use the real version
const TestPaymentPage = lazy(() => import("@/pages/test-payment"));
const DetailedCalculatorPage = lazy(() => import("@/pages/detailed-calculator-page"));
const NotFound = lazy(() => import("@/pages/not-found"));
const VerifyEmailPage = lazy(() => import("@/pages/verify-email-page"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const BlogPage = lazy(() => import("@/pages/blog-page"));
const BlogArticlePage = lazy(() => import("@/pages/blog-article-page"));
const NewsPage = lazy(() => import("@/pages/news-page"));
const NewsArticlePage = lazy(() => import("@/pages/news-article-page"));
const MarketplacePage = lazy(() => import("@/pages/marketplace-page"));
const MarketingPage = lazy(() => import("@/pages/marketing-page-new"));
const ReviewsPage = lazy(() => import("@/pages/reviews-page"));
const FAQPage = lazy(() => import("@/pages/faq-page"));
const PrivacyPage = lazy(() => import("@/pages/privacy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const AdminPage = lazy(() => import("@/pages/admin-page"));
const SimpleEnhancedCalculator = lazy(() => import("@/pages/simple-enhanced-calculator"));
const CMSDashboard = lazy(() => import("@/pages/cms-dashboard"));
const CareersPage = lazy(() => import("@/pages/careers-page"));
const FeedbackPage = lazy(() => import("@/pages/feedback-page"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const FirmProfilesPage = lazy(() => import("@/pages/firm-profiles-page"));
const FirmProfileDetailPage = lazy(() => import("@/pages/firm-profile-detail-page"));
const FirmProfileEditPage = lazy(() => import("@/pages/firm-profile-edit-page"));
const FirmLandingPage = lazy(() => import("@/pages/firm-landing-page"));
const CommonwealthLPLLanding = lazy(() => import("@/pages/commonwealth-lpl-landing"));
const DynamicLandingPage = lazy(() => import("@/pages/dynamic-landing-page"));
const SecureManagementPortal = lazy(() => import("@/pages/secure-management-portal"));
const BlogPostsAdmin = lazy(() => import("@/pages/blog-posts-admin"));
const PracticeListingsAdmin = lazy(() => import("@/pages/practice-listings-admin"));
const MarketplaceAdmin = lazy(() => import("@/pages/marketplace-admin"));
const FirmProfilesAdmin = lazy(() => import("@/pages/firm-profiles-admin"));
const WebsitePagesAdmin = lazy(() => import("@/pages/website-pages-admin"));
const UserManagementAdmin = lazy(() => import("@/pages/user-management-admin"));
const LandingPagesAdmin = lazy(() => import("@/pages/landing-pages-admin"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));

// Import protected route components
import { ProtectedRoute } from "./lib/protected-route";
import { JwtProtectedRoute } from "./lib/jwt-protected-route";
import { UnifiedProtectedRoute } from "./lib/unified-protected-route";
import { AdvisorInfoProvider } from "./hooks/use-advisor-info";
import { AuthProvider } from "./hooks/use-auth";
import { JwtAuthProvider } from "./hooks/use-jwt-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

// Create wrapper components for protected routes
const ProtectedDashboardPage = () => (
  <UnifiedProtectedRoute 
    path="/dashboard" 
    component={() => <DashboardPage />} 
  />
);

const ProtectedDetailedCalculatorPage = () => (
  <UnifiedProtectedRoute 
    path="/detailed-calculator" 
    component={() => <DetailedCalculatorPage />} 
  />
);

// Admin page removed as requested by user

const ProtectedCMSDashboard = () => (
  <ProtectedRoute 
    path="/secure-cms-dashboard" 
    component={() => <CMSDashboard />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

// Protected admin routes
const ProtectedBlogPostsAdmin = () => (
  <ProtectedRoute 
    path="/cms-dashboard" 
    component={() => <BlogPostsAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedPracticeListingsAdmin = () => (
  <ProtectedRoute 
    path="/practice-listings-admin" 
    component={() => <PracticeListingsAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedMarketplaceAdmin = () => (
  <ProtectedRoute 
    path="/marketplace-admin" 
    component={() => <MarketplaceAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedFirmProfilesAdmin = () => (
  <ProtectedRoute 
    path="/firm-profiles-admin" 
    component={() => <FirmProfilesAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedWebsitePagesAdmin = () => (
  <ProtectedRoute 
    path="/pages-admin" 
    component={() => <WebsitePagesAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedUserManagementAdmin = () => (
  <ProtectedRoute 
    path="/user-management" 
    component={() => <UserManagementAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedLandingPagesAdmin = () => (
  <ProtectedRoute 
    path="/landing-pages-admin" 
    component={() => <LandingPagesAdmin />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

const ProtectedAdminSettings = () => (
  <ProtectedRoute 
    path="/admin-settings" 
    component={() => <AdminSettings />} 
    requireAdmin={true}
    requireVerified={true}
  />
);

// Create a unified protected route component that supports both auth systems
const UnifiedSubmitFirmPage = () => (
  <UnifiedProtectedRoute
    path="/submit-firm-protected"
    component={() => <SubmitFirmPage />}
  />
);

// Add protected auth test page
const ProtectedAuthTestPage = () => (
  <JwtProtectedRoute
    path="/auth-test-protected"
    component={() => <AuthTestPage />}
  />
);

// Separate route configuration for better maintainability
const PROTECTED_ROUTES = [
  { path: '/dashboard', component: ProtectedDashboardPage },
  { path: '/detailed-calculator', component: ProtectedDetailedCalculatorPage },
  // Admin route removed as requested by user
  { path: '/submit-firm-protected', component: UnifiedSubmitFirmPage }
];

function Router() {
  const [location] = useLocation();
  
  // Enhanced scroll behavior with smooth scrolling
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  // Performance optimization for route changes
  useEffect(() => {
    const preloadRouteComponents = () => {
      // Preload components for frequently accessed routes
      const criticalRoutes = ['/calculator', '/dashboard', '/marketplace'];
      criticalRoutes.forEach(route => {
        if (location !== route) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          document.head.appendChild(link);
        }
      });
    };
    
    preloadRouteComponents();
  }, [location]);

  // Loading fallback component for lazy-loaded routes
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );

  // Add console logs to debug route matching
  console.log("DEV?", import.meta.env.DEV);
  console.log("HOST:", window.location.hostname);
  console.log("PATH:", window.location.pathname);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Dev admin dashboard access removed for security */}
        
        {/* Your real login and password reset routes */}
        <Route path="/admin-login" component={() => <AdminLoginPage />} />
        <Route path="/admin-reset" component={() => <AdminResetPage />} />
        <Route path="/admin-dashboard" component={SecureManagementPortal} />

        {/* Admin route removed as requested - show 404 instead */}
        <Route path="/admin">
          {() => {
            console.log("Admin page is no longer available - showing 404");
            return <NotFound />;
          }}
        </Route>
        
        {/* Critical routes - Auth route placed before other routes for priority */}
        <Route path="/auth">
          {() => {
            console.log("Auth route matched");
            return <AuthPage />;
          }}
        </Route>
        
        {/* Regular routes */}
        <Route path="/" component={HomePage} />
        <Route path="/calculator" component={CalculatorPage} />
        {/* Redirect /cal to /calculator to prevent crashes */}
        <Route path="/cal">
          {() => {
            window.location.replace("/calculator");
            return <LoadingFallback />;
          }}
        </Route>
        <Route path="/checkout" component={() => {
          const CheckoutPageComponent = lazy(() => import("@/pages/checkout-page"));
          return (
            <Suspense fallback={<div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>}>
              <CheckoutPageComponent />
            </Suspense>
          );
        }} />
        {/* Direct admin access routes removed for security */}
        <Route path="/reset-admin-password" component={() => <ResetAdminPasswordPage />} />
        <Route path="/admin-auth-toggle" component={() => <AdminAuthTogglePage />} />
        <Route path="/auth-test" component={AuthTestPage} />
        <Route path="/auth-token-test" component={AuthTokenTestPage} />
        <Route path="/auth-reset" component={AuthResetPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password">
          {() => {
            // Use direct component rendering instead of potential redirect
            return <ResetPasswordPage />;
          }}
        </Route>
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogArticlePage} />
        <Route path="/news" component={NewsPage} />
        <Route path="/news/:slug" component={NewsArticlePage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/marketplace/listing/:id" component={MarketplacePage} />
        <Route path="/marketing" component={MarketingPage} />
        <Route path="/reviews" component={ReviewsPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/feedback" component={FeedbackPage} />
        <Route path="/firm-profiles" component={FirmProfilesPage} />
        <Route path="/firm-profiles/edit/:id" component={FirmProfileEditPage} />
        <Route path="/firm-profiles/:id" component={FirmProfileDetailPage} />
        
        {/* Protected routes - These need to be BEFORE the /:firmSlug route to take priority */}
        <Route path="/dashboard">
          {() => {
            console.log("Dashboard route matched with priority");
            return <ProtectedDashboardPage />;
          }}
        </Route>
        <Route path="/detailed-calculator" component={ProtectedDetailedCalculatorPage} />
        <Route 
          path="/secure-management-portal" 
          component={SecureManagementPortal} 
        />
        
        {/* Secure firm profile management routes */}
        <Route path="/secure-management-portal/firm-profiles/edit/:id" component={FirmProfileEditPage} />
        <Route path="/secure-management-portal/firm-profiles/new" component={FirmProfileEditPage} />
        
        <Route path="/secure-cms-dashboard" component={ProtectedCMSDashboard} />
        
        {/* Other standard routes */}
        <Route path="/simple-enhanced" component={SimpleEnhancedCalculator} />
        <Route path="/commonwealth-lpl" component={CommonwealthLPLLanding} />
        <Route path="/landing/:slug" component={DynamicLandingPage} />
        <Route path="/payment-success" component={PaymentSuccessPage} />
        <Route path="/test-payment" component={TestPaymentPage} />
        <Route path="/submit-firm" component={SubmitFirmPage} />
        <Route path="/submit-firm-payment" component={SubmitFirmPaymentPage} />
        
        {/* 404 route to specifically handle /404 URL */}
        <Route path="/404" component={NotFound} />

        {/* Admin routes - MUST come before any wildcard routes */}
        
        {/* Support both old and new URL patterns - These should be last since they're dynamic */}
        <Route path="/firms/:firmName" component={FirmLandingPage} />
        
        {/* Match specific known firm slugs only - not any arbitrary path */}
        <Route path="/:firmSlug">
          {({firmSlug}) => {
            // Block reserved paths from being treated as firm slugs
            const reservedPaths = [
              "auth", "dashboard", "calculator", "marketplace", "blog", "news", "about", 
              "checkout", "payment-success", "admin", "login", "register", "profile", 
              "submit-firm", "verify-email", "reset-password", "forgot-password",
              "pricing", "contact", "faq", "privacy", "terms", "careers", "feedback",
              "settings", "api", "secure-management-portal"
            ];
            
            // List of known valid firm slugs (lowercase)
            const knownFirmSlugs = [
              "lplfinancial", "raymondjames", "merrilllynch", "morganstanley",
              "wellsfargoadvisors", "edwardjones", "ameriprise", "ubs", "commonwealthfinancial"
            ];
            
            // If it's a reserved path, redirect to the proper route
            if (reservedPaths.includes(firmSlug)) {
              console.log(`Redirecting from /:firmSlug (${firmSlug}) to /${firmSlug} route`);
              window.location.pathname = `/${firmSlug}`;
              return <LoadingFallback />;
            }
            
            // If it's a known firm slug, show the firm landing page
            if (knownFirmSlugs.includes(firmSlug.toLowerCase())) {
              return <FirmLandingPage />;
            }
            
            // Otherwise, it's a 404 - show the NotFound component
            console.log(`Unknown path: /${firmSlug} - showing 404 page`);
            return <NotFound />;
          }}
        </Route>
        <Route path="/cms-dashboard" component={ProtectedBlogPostsAdmin} />
        <Route path="/practice-listings-admin" component={ProtectedPracticeListingsAdmin} />
        <Route path="/marketplace-admin" component={ProtectedMarketplaceAdmin} />
        <Route path="/firm-profiles-admin" component={ProtectedFirmProfilesAdmin} />
        <Route path="/pages-admin" component={ProtectedWebsitePagesAdmin} />
        <Route path="/user-management" component={ProtectedUserManagementAdmin} />
        <Route path="/landing-pages-admin" component={ProtectedLandingPagesAdmin} />
        <Route path="/admin-settings" component={ProtectedAdminSettings} />
        <Route path="/admin/firm-profiles/edit/:id" component={FirmProfileEditPage} />
        
        {/* Test routes that use different auth systems */}
        <Route path="/submit-firm-protected" component={UnifiedSubmitFirmPage} />
        <Route path="/auth-test-protected" component={ProtectedAuthTestPage} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <JwtAuthProvider>
          <ThemeProvider>
            <AdvisorInfoProvider>
              <Router />
              <ScrollToTop />
              <Toaster />
            </AdvisorInfoProvider>
          </ThemeProvider>
        </JwtAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;