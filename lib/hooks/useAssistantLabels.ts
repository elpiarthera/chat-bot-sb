"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { AssistantLabel } from "@/lib/assistants/interfaces"

export function useAssistantLabels() {
  const [labels, setLabels] = useState<AssistantLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/assistants/labels")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch labels")
      }

      const data = await response.json()
      setLabels(data)
    } catch (error) {
      console.error("Error fetching labels:", error)
      setError(
        error instanceof Error ? error.message : "Failed to fetch labels"
      )
      toast.error("Failed to load labels")
    } finally {
      setIsLoading(false)
    }
  }

  const createLabel = async (name: string) => {
    try {
      const response = await fetch("/api/admin/assistants/labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        throw new Error("Failed to create label")
      }

      await fetchLabels() // Refresh labels after creation
      return response
    } catch (error) {
      console.error("Error creating label:", error)
      toast.error("Failed to create label")
      throw error
    }
  }

  const updateLabel = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/assistants/labels/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        throw new Error("Failed to update label")
      }

      await fetchLabels() // Refresh labels after update
      return response
    } catch (error) {
      console.error("Error updating label:", error)
      toast.error("Failed to update label")
      throw error
    }
  }

  const deleteLabel = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/assistants/labels/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete label")
      }

      await fetchLabels() // Refresh labels after deletion
      return response
    } catch (error) {
      console.error("Error deleting label:", error)
      toast.error("Failed to delete label")
      throw error
    }
  }

  // Fetch labels on hook initialization
  useEffect(() => {
    fetchLabels()
  }, [])

  return {
    labels,
    isLoading,
    error,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel
  }
}
