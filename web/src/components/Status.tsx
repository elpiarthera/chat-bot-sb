import React from "react";
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/tooltip/CustomTooltip";

interface IndexAttemptStatusProps {
  status: string | null;
  errorMsg?: string | null;
}

export function IndexAttemptStatus({ status, errorMsg }: IndexAttemptStatusProps) {
  if (!status) {
    return <span className="text-muted-foreground">Not indexed yet</span>;
  }

  switch (status) {
    case "success":
      return <Badge variant="success">Success</Badge>;
    case "failed":
      return (
        <CustomTooltip content={errorMsg || "Unknown error"}>
          <Badge variant="destructive">Failed</Badge>
        </CustomTooltip>
      );
    case "in_progress":
      return <Badge variant="outline">In Progress</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
} 