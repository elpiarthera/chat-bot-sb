import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";
import { errorHandlingFetcher } from "@/lib/fetcher";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  message?: string;
  details?: Record<string, any>;
}

export const HealthCheckBanner: React.FC = () => {
  const { data, error } = useSWR<HealthStatus>(
    "/api/health",
    errorHandlingFetcher,
    { refreshInterval: 30000 } // Check every 30 seconds
  );

  if (!data || error) {
    return null; // Don't show anything if we can't determine health
  }

  if (data.status === "healthy") {
    return null; // Don't show banner when everything is healthy
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>System Health Warning</AlertTitle>
      <AlertDescription>
        {data.message || "Some system components are not functioning properly."}
        {data.details && (
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(data.details).map(([key, value]) => (
              <li key={key}>
                {key}: {typeof value === "object" ? JSON.stringify(value) : value.toString()}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}; 