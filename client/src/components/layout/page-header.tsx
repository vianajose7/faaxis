import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-4 w-full bg-muted/30", className)}>
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground max-w-3xl">{description}</p>
            )}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}