import { useEffect, useState } from "react";
import useSWR from "swr";
import { errorHandlingFetcher } from "@/lib/fetcher";

export function usePaidEnterpriseFeaturesEnabled() {
  const { data, error } = useSWR<{ paid_enterprise_features_enabled: boolean }>(
    "/api/admin/settings/enterprise-features",
    errorHandlingFetcher
  );

  // Default to false until we know for sure
  return data?.paid_enterprise_features_enabled || false;
}