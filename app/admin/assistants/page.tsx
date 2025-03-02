"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconRobot } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Plus, Tags, LayoutTemplate } from "lucide-react"
import { AssistantsTable } from "@/components/admin/assistants/assistants-table"
import { Tables } from "@/supabase/types"
import { AssistantLabel } from "@/lib/assistants/interfaces"
import { toast } from "sonner"

// Type for combined assistant data
interface AssistantWithMeta extends Tables<"assistants"> {
  labels?: AssistantLabel[]
  starter_messages?: { message: string; name?: string }[]
}

export default function AssistantsAdminPage() {
  const router = useRouter()
  const [assistants, setAssistants] = useState<AssistantWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAssistants = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/assistants")

      if (!response.ok) {
        throw new Error("Failed to fetch assistants")
      }

      // Fetch assistants
      const data = await response.json()
      // Fetch related data for each assistant
      const detailedAssistants = await Promise.all(
        data.map(async (assistant: Tables<"assistants">) => {
          const detailResponse = await fetch(
            `/api/admin/assistants/${assistant.id}`
          )

          if (detailResponse.ok) {
            return await detailResponse.json()
          }

          return assistant
        })
      )

      setAssistants(detailedAssistants)
    } catch (error) {
      console.error("Error fetching assistants:", error)
      toast.error("Failed to load assistants")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssistants()
  }, [])

  return (
    <div className="container max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageTitle
          icon={<IconRobot size={28} />}
          title="Manage Assistants"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/assistants/ui-examples")}
          >
            <LayoutTemplate className="mr-2 size-4" />
            UI Examples
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/assistants/labels")}
          >
            <Tags className="mr-2 size-4" />
            Manage Labels
          </Button>
          <Button onClick={() => router.push("/admin/assistants/new")}>
            <Plus className="mr-2 size-4" />
            New Assistant
          </Button>
        </div>
      </div>

      <CardSection>
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading assistants...</p>
          </div>
        ) : assistants.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="mb-2 text-lg font-medium">No assistants found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first AI assistant.
            </p>
            <Button onClick={() => router.push("/admin/assistants/new")}>
              <Plus className="mr-2 size-4" />
              Create First Assistant
            </Button>
          </div>
        ) : (
          <AssistantsTable
            assistants={assistants}
            onRefresh={fetchAssistants}
          />
        )}
      </CardSection>
    </div>
  )
}
