"use client"

import { useState, useEffect } from "react"

interface CCPairDescriptor {
  id: string
  name: string
}

export interface DocumentSet {
  id: string
  name: string
  description: string
  is_public: boolean
  is_up_to_date: boolean
  cc_pair_descriptors: CCPairDescriptor[]
  users: string[]
  groups: string[]
}

export function useDocumentSets(editableOnly: boolean = false) {
  const [data, setData] = useState<DocumentSet[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDocumentSets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = editableOnly
        ? "/api/admin/document-set?editable_only=true"
        : "/api/admin/document-set"

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch document sets: ${response.statusText}`)
      }

      const documentSets = await response.json()
      setData(documentSets)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentSets()
  }, [editableOnly, fetchDocumentSets])

  return {
    data,
    isLoading,
    error,
    refreshDocumentSets: fetchDocumentSets
  }
}

// Function to refresh document sets from outside the hook
let refreshFunction: (() => void) | null = null

export const refreshDocumentSets = () => {
  if (refreshFunction) {
    refreshFunction()
  }
}

// Register the refresh function when the hook is used
export function registerRefreshFunction(refresh: () => void) {
  refreshFunction = refresh
}
