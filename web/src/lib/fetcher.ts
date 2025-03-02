/**
 * A fetcher function for SWR that handles errors
 * @param url The URL to fetch
 * @returns The response data
 * @throws Error if the response is not OK
 */
export async function errorHandlingFetcher<T = any>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * A fetcher function for SWR that handles errors and accepts options
 * @param url The URL to fetch
 * @param options The fetch options
 * @returns The response data
 * @throws Error if the response is not OK
 */
export async function fetchWithOptions<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}