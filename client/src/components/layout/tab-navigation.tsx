import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-10">
      <div className="border-b border-muted flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "px-4 py-3 transition-colors",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
