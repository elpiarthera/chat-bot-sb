"use client"

import { useEffect, useState } from "react"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconRobot } from "@tabler/icons-react"
import { AssistantForm } from "@/components/admin/assistants/assistant-form"
import { AssistantLabel } from "@/lib/assistants/interfaces"

export default function NewAssistantPage() {
  const [labels, setLabels] = useState<AssistantLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch assistant labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/assistants/labels")

        if (response.ok) {
          const data = await response.json()
          setLabels(data)
        } else {
          console.error("Failed to fetch assistant labels")
        }
      } catch (error) {
        console.error("Error fetching assistant labels:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabels()
  }, [])

  return (
    <div className="container max-w-6xl space-y-6">
      <AdminPageTitle icon={<IconRobot size={28} />} title="Create Assistant" />

      <CardSection>
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <AssistantForm labels={labels} />
        )}
      </CardSection>
    </div>
  )
}
