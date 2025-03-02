/**
 * Server-side fetch utility
 * @param path API path to fetch
 * @param options Fetch options
 * @returns Response object
 */
export async function fetchSS(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  };
  
  return fetch(url, mergedOptions);
}