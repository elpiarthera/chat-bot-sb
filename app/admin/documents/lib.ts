/**
 * Utility functions for document management in the admin panel
 */

/**
 * Updates the boost score for a document
 * @param documentId - The ID of the document to update
 * @param boost - The new boost score
 * @returns null if successful, error message if failed
 */
export const updateBoost = async (documentId: string, boost: number) => {
  const response = await fetch("/api/admin/doc-boosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      document_id: documentId,
      boost
    })
  })
  if (response.ok) {
    return null
  }
  const responseJson = await response.json()
  return responseJson.message || responseJson.detail || "Unknown error"
}

/**
 * Updates the hidden status for a document
 * @param documentId - The ID of the document to update
 * @param hidden - Whether the document should be hidden
 * @returns The response from the API
 */
export const updateHiddenStatus = async (
  documentId: string,
  hidden: boolean
) => {
  return fetch(`/api/admin/documents/${documentId}/hidden`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hidden })
  })
}

/**
 * Fetches a document by ID
 * @param documentId - The ID of the document to fetch
 * @returns The document data
 */
export const getDocument = async (documentId: string) => {
  const response = await fetch(`/api/admin/documents/${documentId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch document")
  }
  return await response.json()
}

/**
 * Fetches a list of documents with pagination
 * @param page - The page number to fetch
 * @param limit - The number of documents per page
 * @param filters - Optional filters to apply
 * @returns The paginated document list
 */
export const getDocuments = async (
  page: number = 1,
  limit: number = 10,
  filters: Record<string, any> = {}
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  })

  const response = await fetch(`/api/admin/documents?${queryParams.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return await response.json()
}

/**
 * Updates the boost score of a document
 * @param documentId - The ID of the document to update
 * @param boost - The new boost score
 * @returns The response from the API
 */
export const updateDocumentBoost = async (
  documentId: string,
  boost: number
) => {
  return fetch(`/api/admin/documents/${documentId}/boost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ boost })
  })
}

/**
 * Fetches documents with sorting options
 * @param options - Options for fetching documents
 * @returns The documents data
 */
export const fetchDocuments = async (options: {
  sort_by?: string
  sort_order?: "asc" | "desc"
  limit?: number
  offset?: number
}) => {
  const queryParams = new URLSearchParams()

  if (options.sort_by) {
    queryParams.append("sort_by", options.sort_by)
  }

  if (options.sort_order) {
    queryParams.append("sort_order", options.sort_order)
  }

  if (options.limit) {
    queryParams.append("limit", options.limit.toString())
  }

  if (options.offset) {
    queryParams.append("offset", options.offset.toString())
  }

  const response = await fetch(`/api/admin/documents?${queryParams.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return await response.json()
}
