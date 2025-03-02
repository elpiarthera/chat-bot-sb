"use client"

import React, { useState, useEffect } from "react"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { Button } from "@/components/ui/button"
import { IconFileText, IconLock } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

function Main() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    async function checkApiKey() {
      try {
        setIsLoading(true)
        const response = await fetch(
          "/api/search-settings/unstructured-api-key-set"
        )
        if (response.ok) {
          const data = await response.json()
          setIsApiKeySet(!!data.unstructured_api_key)
        } else {
          console.error("Failed to check API key status")
          toast({
            title: "Error",
            description: "Failed to check API key status",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error checking API key:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [toast])

  const validateApiKey = async (key: string) => {
    try {
      setIsValidating(true)
      const response = await fetch(
        "/api/search-settings/check-unstructured-api-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ apiKey: key })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.valid
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to validate API key")
      }
    } catch (error) {
      console.error("Error validating API key:", error)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)

      // Validate the API key first
      const isValid = await validateApiKey(apiKey)
      if (!isValid) {
        toast({
          title: "Error",
          description: "Invalid API key. Please check and try again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(
        `/api/search-settings/upsert-unstructured-api-key?unstructured_api_key=${encodeURIComponent(apiKey)}`,
        {
          method: "PUT"
        }
      )

      if (response.ok) {
        setIsApiKeySet(true)
        setApiKey("")
        toast({
          title: "Success",
          description: "API key saved successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to save API key")
      }
    } catch (error) {
      console.error("Failed to save API key:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save API key",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(
        "/api/search-settings/delete-unstructured-api-key",
        {
          method: "DELETE"
        }
      )

      if (response.ok) {
        setIsApiKeySet(false)
        setApiKey("")
        toast({
          title: "Success",
          description: "API key deleted successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete API key")
      }
    } catch (error) {
      console.error("Failed to delete API key:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete API key",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <CardSection className="mb-8 max-w-2xl">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
        Process with Unstructured API
      </h3>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Unstructured extracts and transforms complex data from formats like
          .pdf, .docx, .png, .pptx, etc. into clean text for your application to
          ingest. Provide an API key to enable Unstructured document processing.
        </p>
        <p className="text-muted-foreground">
          <strong>Note:</strong> This will send documents to Unstructured
          servers for processing.
        </p>
        <p className="text-muted-foreground">
          Learn more about Unstructured{" "}
          <a
            href="https://unstructured.io/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            here
          </a>
          .
        </p>
        <div className="mt-4">
          {isApiKeySet ? (
            <div className="w-full p-3 border rounded-md bg-muted flex items-center">
              <span className="grow">••••••••••••••••</span>
              <IconLock className="size-5 text-muted-foreground" />
            </div>
          ) : (
            <Input
              type="text"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setApiKey(e.target.value)
              }
              className="w-full"
            />
          )}
        </div>
        <div className="flex space-x-4 mt-6">
          {isApiKeySet ? (
            <>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Deleting...
                  </>
                ) : (
                  "Delete API Key"
                )}
              </Button>
              <p className="text-muted-foreground my-auto">
                Delete the current API key before updating.
              </p>
            </>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving || isValidating || !apiKey}
            >
              {isSaving || isValidating ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {isValidating ? "Validating..." : "Saving..."}
                </>
              ) : (
                "Save API Key"
              )}
            </Button>
          )}
        </div>
      </div>
    </CardSection>
  )
}

export default function DocumentProcessingPage() {
  return (
    <div className="container mx-auto py-6">
      <AdminPageTitle title="Document Processing" icon={<IconFileText />} />
      <Main />
    </div>
  )
}
