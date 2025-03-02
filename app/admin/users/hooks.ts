"use client"

import { useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
}

export function useUsers() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const users = await response.json()
      setData(users)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    data,
    isLoading,
    error,
    refreshUsers: fetchUsers
  }
}
