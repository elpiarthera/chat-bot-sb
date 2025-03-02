/**
 * Fetcher function with error handling for use with SWR
 */
export const errorHandlingFetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      errorText || `Error ${response.status}: ${response.statusText}`
    )
  }

  return response.json()
}
;``
