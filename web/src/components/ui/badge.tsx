import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BadgeProps {
  children: ReactNode;
  variant?: 
    | "default" 
    | "success" 
    | "destructive" 
    | "outline" 
    | "paused" 
    | "invalid" 
    | "private" 
    | "auto-sync" 
    | "not_started";
  className?: string;
  icon?: IconType;
  tooltip?: string;
  circle?: boolean;
}

export function Badge({ 
  children, 
  variant = "default", 
  className,
  icon: Icon,
  tooltip,
  circle
}: BadgeProps) {
  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-red-100 text-red-800": variant === "destructive",
          "border border-current bg-transparent": variant === "outline",
          "bg-amber-100 text-amber-800": variant === "paused",
          "bg-red-50 text-red-800": variant === "invalid",
          "bg-blue-100 text-blue-800": variant === "private",
          "bg-purple-100 text-purple-800": variant === "auto-sync",
          "bg-gray-100 text-gray-600": variant === "not_started",
        },
        className
      )}
    >
      {circle && (
        <span className={cn(
          "mr-1 h-1.5 w-1.5 rounded-full",
          {
            "bg-gray-500": variant === "default",
            "bg-green-500": variant === "success",
            "bg-red-500": variant === "destructive",
            "bg-current": variant === "outline",
            "bg-amber-500": variant === "paused",
            "bg-rose-500": variant === "invalid",
            "bg-blue-500": variant === "private",
            "bg-purple-500": variant === "auto-sync",
            "bg-slate-400": variant === "not_started",
          }
        )} />
      )}
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </span>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
} 