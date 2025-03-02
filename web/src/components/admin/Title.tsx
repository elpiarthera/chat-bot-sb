import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageTitleProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  farRightElement?: ReactNode;
  className?: string;
}

export function AdminPageTitle({
  title,
  icon,
  description,
  farRightElement,
  className,
}: AdminPageTitleProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {farRightElement && <div>{farRightElement}</div>}
      </div>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );
} 