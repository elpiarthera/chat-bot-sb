"use client"

import { useEffect, useState } from "react"
import { BackButton } from "@/components/utility/BackButton"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { ToolIcon } from "@/components/icons/icons"
import { CardSection } from "@/components/admin/card-section"
import { ToolEditor } from "@/app/admin/tools/ToolEditor"
import { ErrorCallout } from "@/components/ErrorCallout"
import { DeleteToolButton } from "./DeleteToolButton"

// Loading component
const Loading = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

interface Tool {
  id: number
  name: string
  description: string
  apiUrl: string
  isEnabled: boolean
  apiKey?: string
  parameters?: any[]
}

export default function EditToolPage({
  params
}: {
  params: { toolId: string }
}) {
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTool = async () => {
      try {
        // In a real implementation, you would fetch the tool from your API
        // For now, we'll simulate a successful API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data for demonstration
        setTool({
          id: parseInt(params.toolId),
          name: "Example Tool",
          description: "This is an example tool for demonstration purposes.",
          apiUrl: "https://api.example.com/tool",
          isEnabled: true,
          apiKey: "secret-api-key",
          parameters: []
        })
      } catch (err) {
        setError("Failed to load tool. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [params.toolId])

  if (loading) {
    return (
      <div className="max-w-4xl p-6">
        <BackButton href="/admin/tools" />
        <AdminPageTitle icon={<ToolIcon size={28} />} title="Edit Tool" />
        <Loading />
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="max-w-4xl p-6">
        <BackButton href="/admin/tools" />
        <AdminPageTitle icon={<ToolIcon size={28} />} title="Edit Tool" />
        <ErrorCallout
          errorTitle="Error"
          errorMessage={error || "Tool not found"}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl p-6">
      <BackButton href="/admin/tools" />

      <AdminPageTitle icon={<ToolIcon size={28} />} title="Edit Tool" />

      <CardSection className="mb-8">
        <ToolEditor tool={tool} />
      </CardSection>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Delete Tool</h2>
        <p className="text-muted-foreground mb-6">
          Click the button below to permanently delete this tool. This action
          cannot be undone.
        </p>
        <DeleteToolButton toolId={tool.id} />
      </div>
    </div>
  )
}
