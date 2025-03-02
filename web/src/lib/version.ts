/**
 * Gets the current web version from the environment or package.json
 */
export async function getWebVersion(): Promise<string | null> {
  try {
    // First try to get from environment variable
    if (process.env.NEXT_PUBLIC_WEB_VERSION) {
      return process.env.NEXT_PUBLIC_WEB_VERSION;
    }
    
    // If not available, try to fetch from package.json
    const response = await fetch('/package.json');
    if (response.ok) {
      const packageJson = await response.json();
      return packageJson.version || null;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get web version:', error);
    return null;
  }
}

/**
 * Gets the backend version by making an API call
 */
export async function getBackendVersion(): Promise<string | null> {
  try {
    const response = await fetch('/api/version');
    if (response.ok) {
      const data = await response.json();
      return data.version || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to get backend version:', error);
    return null;
  }
}