import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import lightLogo from "@/assets/logo-light.svg";
import darkLogo from "@/assets/logo-dark.svg";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

// Simple Navbar that doesn't require authentication
export function SimpleNavbar() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <header className="mb-10 py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <Link href="/" className="flex items-center cursor-pointer">
              <img 
                src={theme === 'dark' ? darkLogo : lightLogo} 
                alt="FinancialAXIS" 
                className="h-10" 
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-12 space-x-8 text-base font-bold">
              <Link href="/calculator" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Deal Calculator tools">Deal Calculator</span>
              </Link>
              <Link href="/marketplace" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Practice Listings marketplace">Practice Listings</span>
              </Link>
              <Link href="/marketing" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Marketing resources">Growth Marketing</span>
              </Link>
            </div>
          </div>

          {/* Desktop Menu Right Side */}
          <div className="hidden md:flex items-center">
            <div className="mr-4">
              <ThemeToggle />
            </div>
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground hover:bg-primary/5 opacity-80 hover:opacity-100 text-sm"
              >
                <LogIn className="mr-1 h-3.5 w-3.5" />
                Login
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] overflow-y-auto">
                <div className="flex flex-col px-2 py-6 space-y-4">
                  <Link href="/calculator" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Deal Calculator</span>
                    </div>
                  </Link>
                  <Link href="/marketplace" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Practice Listings</span>
                    </div>
                  </Link>
                  <Link href="/marketing" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Growth Marketing</span>
                    </div>
                  </Link>
                  
                  <div className="pt-4 border-t">
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="default" 
                        className="w-full"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  </div>

                  {/* Footer Links */}
                  <div className="pt-6 mt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Resources</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href="/firm-profiles" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Firm Profiles</span>
                        </div>
                      </Link>
                      <Link href="/about" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">About Us</span>
                        </div>
                      </Link>
                      <Link href="/careers" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Careers</span>
                        </div>
                      </Link>
                      <Link href="/feedback" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Feedback</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Legal</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href="/privacy" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Privacy Policy</span>
                        </div>
                      </Link>
                      <Link href="/terms" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Terms of Service</span>
                        </div>
                      </Link>
                      <Link href="/faq" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">FAQ</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AuthNavbar() {
  const { user, logoutMutation } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="mb-10 py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <Link href="/" className="flex items-center cursor-pointer">
              <img 
                src={theme === 'dark' ? darkLogo : lightLogo} 
                alt="FinancialAXIS" 
                className="h-10" 
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-12 space-x-8 text-base font-bold">
              <Link href="/calculator" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Deal Calculator tools">Deal Calculator</span>
              </Link>
              <Link href="/marketplace" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Practice Listings marketplace">Practice Listings</span>
              </Link>
              <Link href="/marketing" className="cursor-pointer">
                <span className="text-foreground hover:text-primary transition-colors" aria-label="Marketing resources">Growth Marketing</span>
              </Link>
            </div>
          </div>

          {/* Desktop Menu Right Side */}
          <div className="hidden md:flex items-center">
            <Link href="/" className="cursor-pointer">
              <span className="text-foreground hover:text-primary transition-colors mr-4" aria-label="Home">Home</span>
            </Link>
            <div className="mr-4">
              <ThemeToggle />
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="ml-2 text-foreground hover:text-foreground hover:bg-primary/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] overflow-y-auto">
                <div className="flex flex-col px-2 py-6 space-y-4">
                  <Link href="/calculator" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Deal Calculator</span>
                    </div>
                  </Link>
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Home</span>
                    </div>
                  </Link>
                  <Link href="/marketplace" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Practice Listings</span>
                    </div>
                  </Link>
                  <Link href="/marketing" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center py-2 text-base font-medium cursor-pointer">
                      <span className="ml-2">Growth Marketing</span>
                    </div>
                  </Link>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsOpen(false);
                        logoutMutation.mutate();
                      }}
                      disabled={logoutMutation.isPending}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </div>

                  {/* Footer Links */}
                  <div className="pt-6 mt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Resources</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href="/firm-profiles" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Firm Profiles</span>
                        </div>
                      </Link>
                      <Link href="/about" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">About Us</span>
                        </div>
                      </Link>
                      <Link href="/careers" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Careers</span>
                        </div>
                      </Link>
                      <Link href="/feedback" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Feedback</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Legal</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href="/privacy" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Privacy Policy</span>
                        </div>
                      </Link>
                      <Link href="/terms" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">Terms of Service</span>
                        </div>
                      </Link>
                      <Link href="/faq" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center py-1 text-sm">
                          <span className="ml-2">FAQ</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

// Dynamic Navbar that checks authentication status
export function Navbar() {
  try {
    // Try to get authentication status
    const { user } = useAuth();
    
    // If user is logged in, show AuthNavbar
    if (user) {
      return <AuthNavbar />;
    }
  } catch (error) {
    // If there's an error (like when auth context isn't available), fallback to SimpleNavbar
    console.log("Auth context not available, using SimpleNavbar");
  }
  
  // Default to SimpleNavbar
  return <SimpleNavbar />;
}