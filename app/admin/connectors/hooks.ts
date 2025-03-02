"use client"

import { useState, useEffect } from "react"

interface Connector {
  id: string
  name: string
  source: string
  input_type: string
}

interface Credential {
  id: string
}

export interface ConnectorPair {
  cc_pair_id: string
  name: string
  connector: Connector
  credential: Credential
  access_type: "public" | "private"
  groups: string[]
}

export function useConnectorPairs() {
  const [data, setData] = useState<ConnectorPair[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchConnectorPairs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/connector-pairs")

      if (!response.ok) {
        throw new Error(
          `Failed to fetch connector pairs: ${response.statusText}`
        )
      }

      const connectorPairs = await response.json()
      setData(connectorPairs)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConnectorPairs()
  }, [])

  return {
    data,
    isLoading,
    error,
    refreshConnectorPairs: fetchConnectorPairs
  }
}
