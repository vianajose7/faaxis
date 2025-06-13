import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, Moon, Monitor } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, actualTheme, setTheme, isDark, isUsingSystemTheme } = useTheme();

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border-border/40 hover:bg-background/80"
                aria-label={`Toggle theme: currently ${actualTheme} mode ${isUsingSystemTheme ? '(system)' : ''}`}
              >
                {isUsingSystemTheme ? (
                  isDark ? (
                    <div className="relative">
                      <Monitor className="h-[1.2rem] w-[1.2rem] text-foreground" />
                      <Moon className="h-[0.8rem] w-[0.8rem] text-yellow-300 absolute -bottom-1 -right-1" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Monitor className="h-[1.2rem] w-[1.2rem] text-foreground" />
                      <Sun className="h-[0.8rem] w-[0.8rem] text-orange-400 absolute -bottom-1 -right-1" />
                    </div>
                  )
                ) : isDark ? (
                  <Moon className="h-[1.2rem] w-[1.2rem] text-yellow-300" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem] text-orange-400" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="flex items-center gap-1">
              Theme Settings
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4 mr-2" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}