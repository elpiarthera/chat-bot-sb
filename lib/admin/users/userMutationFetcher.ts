/**
 * Generic fetcher function for user-related mutations
 */
const userMutationFetcher = async (
  url: string,
  { arg }: { arg: { user_email?: string; method?: string; [key: string]: any } }
) => {
  const { method = "POST", user_email, ...data } = arg

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_email, ...data })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error: ${response.status}`)
  }

  return response.json()
}

export default userMutationFetcher
