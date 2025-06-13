import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

// Simplified to just light and dark
type Theme = "light" | "dark" | "system";
type ActualTheme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  actualTheme: ActualTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isUsingSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Track if user has manually set preference
  const [userHasManualPreference, setUserHasManualPreference] = useState<boolean>(false);
  
  // Theme state (light, dark, or system)
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme-preference") as Theme;
    
    // If valid preference exists, use it
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      // Mark as manual preference if it's explicitly set to light or dark
      if (savedTheme === "light" || savedTheme === "dark") {
        setUserHasManualPreference(true);
      }
      return savedTheme;
    }
    
    // Always default to system preference
    return "system";
  });
  
  // Separate state for the actual applied theme (light or dark)
  const [actualTheme, setActualTheme] = useState<ActualTheme>("dark");
  
  // Detect system preference
  const detectSystemTheme = (): ActualTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
  };
  
  // Set theme with tracking of manual preferences
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Track if user is manually setting a specific theme
    if (newTheme === "light" || newTheme === "dark") {
      setUserHasManualPreference(true);
    } else {
      setUserHasManualPreference(false);
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    if (actualTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // Save theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem("theme-preference", theme);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial check
    if (theme === "system") {
      setActualTheme(detectSystemTheme());
    } else {
      setActualTheme(theme as ActualTheme);
    }
    
    // Setup listener for changes
    const handleChange = () => {
      if (theme === "system") {
        setActualTheme(detectSystemTheme());
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply the actual theme classes to the document
  useEffect(() => {
    document.documentElement.classList.remove('light-mode', 'dark-mode', 'dark');
    
    if (actualTheme === "dark") {
      document.documentElement.classList.add('dark', 'dark-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [actualTheme]);

  return (
    <ThemeContext.Provider value={{ 
      theme,
      actualTheme,
      setTheme,
      toggleTheme,
      isDark: actualTheme === "dark",
      isUsingSystemTheme: theme === "system"
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}