import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, LogOut, Settings, BookOpen, ShoppingBag, Store, Users, FileText, Globe, Layout } from "lucide-react";

// Admin dashboard links
const adminLinks = [
  { title: 'Content Management', href: '/cms-dashboard', icon: BookOpen, description: 'Manage blog posts and website content' },
  { title: 'Practice Listings', href: '/practice-listings-admin', icon: ShoppingBag, description: 'Manage practice listings on marketplace' },
  { title: 'Marketplace', href: '/marketplace-admin', icon: Store, description: 'Configure marketplace settings and categories' },
  { title: 'Firm Profiles', href: '/firm-profiles-admin', icon: Globe, description: 'Manage firm profiles and information' },
  { title: 'Website Pages', href: '/pages-admin', icon: FileText, description: 'Manage static pages and content blocks' },
  { title: 'User Management', href: '/user-management', icon: Users, description: 'Manage users, permissions and accounts' },
  { title: 'Landing Pages', href: '/landing-pages-admin', icon: Layout, description: 'Manage landing pages and campaigns' },
  { title: 'Admin Settings', href: '/admin-settings', icon: Settings, description: 'Configure global settings and preferences' },
];

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Administrator');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check admin authentication status when component mounts
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Call a protected admin endpoint to verify admin auth
        const response = await fetch('/api/admin-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAdmin(true);
          // Try to get user info if available
          const userResponse = await fetch('/api/user', {
            credentials: 'include',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.username) {
              setUserName(userData.username);
            }
          }
        } else {
          // Not authenticated as admin, redirect to login
          navigate('/admin-login');
        }
      } catch (error) {
        console.error('Error checking admin authentication:', error);
        navigate('/admin-login');
      }
    };
    
    checkAdminAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/admin-login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything until auth check completes
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="bg-muted/50">
          <CardTitle>Welcome, {userName}</CardTitle>
          <CardDescription>
            You have administrative access to manage the FinancialAdvisorAxis platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Admin Control Center</h3>
              <p className="text-muted-foreground text-sm">
                Tuesday, May 6, 2025 - System Status: Operational
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="access">Quick Access</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="p-0 border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminLinks.map((link, index) => (
                  <Card key={index} className="overflow-hidden border border-muted hover:border-primary/20 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                        <link.icon className="h-5 w-5 text-primary opacity-80" />
                      </div>
                      <CardDescription className="text-xs">{link.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end p-4 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary-foreground hover:bg-primary"
                        onClick={() => navigate(link.href)}
                      >
                        Access
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="access" className="p-0 border-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {adminLinks.map((link, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="h-auto py-4 justify-start"
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="h-5 w-5 mr-2" />
                    <span>{link.title}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="p-0 border-0">
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="text-sm font-medium">Recent Activity Log</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recent administrative actions and system events
                  </p>
                </div>
                <Separator />
                <div className="p-4">
                  <p className="text-sm text-muted-foreground italic">
                    No recent activity to display
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system performance and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Status</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full px-2 py-1">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Status</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full px-2 py-1">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stripe Integration</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full px-2 py-1">
                  Connected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Tasks</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-left" size="sm">
              View New User Registrations
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="sm">
              Review Payment Transactions
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="sm">
              Check System Logs
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="sm">
              Manage Content Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}