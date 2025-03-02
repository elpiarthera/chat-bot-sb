"use client"

import { useState, useEffect } from "react"

export interface Group {
  id: string
  name: string
}

export function useGroups() {
  const [data, setData] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroups = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/groups")

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`)
      }

      const groups = await response.json()
      setData(groups)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return {
    data,
    isLoading,
    error,
    refreshGroups: fetchGroups
  }
}
