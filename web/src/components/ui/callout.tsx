import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

type CalloutType = "info" | "warning" | "danger" | "success";

interface CalloutProps {
  children: ReactNode;
  title?: string;
  type?: CalloutType;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  children,
  title,
  type = "info",
  className,
}) => {
  const icons = {
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    danger: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
  };

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border p-4",
        styles[type],
        className
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div>
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}; 