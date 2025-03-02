import { useState, useEffect } from "react";

/**
 * Hook to check if paid enterprise features are enabled
 * Useful for conditionally rendering UI elements
 */
export function usePaidEnterpriseFeaturesEnabled() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEnterpriseStatus = async () => {
      try {
        const response = await fetch("/api/admin/enterprise-status");
        const data = await response.json();
        setIsEnabled(data.enterprise_enabled);
      } catch (error) {
        console.error("Failed to check enterprise status:", error);
        setIsEnabled(false);
      }
    };

    checkEnterpriseStatus();
  }, []);

  return isEnabled;
}