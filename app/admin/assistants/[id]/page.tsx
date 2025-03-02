"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconRobot } from "@tabler/icons-react"
import { AssistantForm } from "@/components/admin/assistants/assistant-form"
import { AssistantLabel } from "@/lib/assistants/interfaces"
import { Tables } from "@/supabase/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditAssistantPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()

  const [assistant, setAssistant] = useState<
    | (Tables<"assistants"> & {
        starter_messages?: { message: string; name?: string }[]
        labels?: AssistantLabel[]
      })
    | undefined
  >(undefined)
  const [labels, setLabels] = useState<AssistantLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch assistant and labels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch the assistant
        const assistantResponse = await fetch(
          `/api/admin/assistants/${params.id}`
        )

        if (!assistantResponse.ok) {
          throw new Error("Failed to fetch assistant")
        }

        const assistantData = await assistantResponse.json()
        setAssistant(assistantData)

        // Fetch all labels
        const labelsResponse = await fetch("/api/admin/assistants/labels")

        if (labelsResponse.ok) {
          const labelsData = await labelsResponse.json()
          setLabels(labelsData)
        } else {
          console.error("Failed to fetch assistant labels")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error loading assistant. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSuccess = (data: Tables<"assistants">) => {
    toast.success("Assistant updated successfully")
    router.push("/admin/assistants")
  }

  return (
    <div className="container max-w-6xl space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/assistants")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <AdminPageTitle
          icon={<IconRobot size={28} />}
          title={assistant?.name ? `Edit ${assistant.name}` : "Edit Assistant"}
        />
      </div>

      <CardSection>
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading assistant...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              onClick={() => router.push("/admin/assistants")}
              className="mt-4"
            >
              Back to Assistants
            </Button>
          </div>
        ) : assistant ? (
          <AssistantForm
            initialData={assistant}
            labels={labels}
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Assistant not found</p>
            <Button
              onClick={() => router.push("/admin/assistants")}
              className="mt-4"
            >
              Back to Assistants
            </Button>
          </div>
        )}
      </CardSection>
    </div>
  )
}
