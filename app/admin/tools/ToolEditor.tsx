"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ErrorCallout } from "@/components/ErrorCallout"

interface Tool {
  id?: number
  name: string
  description: string
  apiUrl: string
  isEnabled: boolean
  apiKey?: string
  parameters?: ToolParameter[]
}

interface ToolParameter {
  name: string
  description: string
  required: boolean
  type: string
}

interface ToolEditorProps {
  tool?: Tool
}

export function ToolEditor({ tool }: ToolEditorProps) {
  const router = useRouter()
  const isEditing = !!tool
  const [formData, setFormData] = useState<Tool>(
    tool || {
      name: "",
      description: "",
      apiUrl: "",
      isEnabled: true,
      parameters: []
    }
  )

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isEnabled: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Tool name is required")
      }

      if (!formData.apiUrl.trim()) {
        throw new Error("API URL is required")
      }

      // Here you would typically call your API to save the tool
      // For now, we'll just simulate a successful save

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to tools page after successful save
      router.push("/admin/tools")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <ErrorCallout
          errorTitle="Error"
          errorMessage={error}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Tool Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tool name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter tool description"
              className="mt-1 h-24"
            />
          </div>

          <div>
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              name="apiUrl"
              value={formData.apiUrl}
              onChange={handleChange}
              placeholder="https://api.example.com/endpoint"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key (Optional)</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey || ""}
              onChange={handleChange}
              placeholder="Enter API key if required"
              className="mt-1"
              type="password"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isEnabled"
              checked={formData.isEnabled}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isEnabled">Enabled</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/tools")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update Tool"
                : "Create Tool"}
          </Button>
        </div>
      </form>
    </div>
  )
}
