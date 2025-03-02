import { useState, useEffect } from "react";

/**
 * Hook to get the current authentication type
 * @returns The authentication type (e.g., "oidc", "google_oauth", "basic")
 */
export function useAuthType(): string {
  const [authType, setAuthType] = useState<string>("basic");

  useEffect(() => {
    async function fetchAuthType() {
      try {
        const response = await fetch("/api/auth/type");
        if (response.ok) {
          const data = await response.json();
          setAuthType(data.type);
        }
      } catch (error) {
        console.error("Failed to fetch auth type:", error);
      }
    }

    fetchAuthType();
  }, []);

  return authType;
}