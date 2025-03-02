"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconKey } from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Copy, Key, Loader2, RefreshCw } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ApiKeyForm } from "@/components/admin/api-keys/ApiKeyForm"
import { NewApiKeyModal } from "@/components/admin/api-keys/NewApiKeyModal"
import { APIKey } from "@/lib/types/api-keys"
import { deleteApiKey, regenerateApiKey } from "@/lib/api-keys/api"
import { toast } from "sonner"
import { USER_ROLE_LABELS, UserRole } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("Failed to fetch data")
    throw error
  }
  return res.json()
}

export default function ApiKeyPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | undefined>()
  const [newApiKey, setNewApiKey] = useState<string | null>(null)

  const {
    data: apiKeys,
    error,
    isLoading
  } = useSWR<APIKey[]>("/api/admin/api-key", fetcher)

  const handleCreateKey = () => {
    setSelectedApiKey(undefined)
    setIsCreating(true)
  }

  const handleEditKey = (key: APIKey) => {
    setSelectedApiKey(key)
    setIsCreating(true)
  }

  const handleDeleteKey = async (keyId: number, keyName: string | null) => {
    const displayName = keyName || `Key ${keyId}`

    if (
      !confirm(
        `Are you sure you want to delete the API key "${displayName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      const response = await deleteApiKey(keyId)
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to delete API key")
      }

      toast.success(`API key "${displayName}" deleted successfully`)
      mutate("/api/admin/api-key")
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const handleRegenerateKey = async (key: APIKey) => {
    setIsRegenerating(true)

    try {
      const response = await regenerateApiKey(key)
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to regenerate API key")
      }

      const data = await response.json()
      setNewApiKey(data.api_key)
      mutate("/api/admin/api-key")
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="container max-w-6xl space-y-6">
      <AdminPageTitle icon={<IconKey size={28} />} title="API Keys" />

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            API keys allow secure programmatic access to the API. Keep your API
            keys secure; anyone with your API key can access your account.
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Admin:</strong> Full access to all admin-level APIs
              </li>
              <li>
                <strong>User:</strong> Access to regular user APIs
              </li>
              <li>
                <strong>Limited:</strong> Access to basic public APIs only
              </li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button onClick={handleCreateKey}>Create New API Key</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive flex items-center rounded-md p-4">
              <AlertCircle className="mr-2 size-5" />
              <p>Failed to load API keys</p>
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map(key => (
                  <TableRow key={key.api_key_id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-left font-normal"
                        onClick={() => handleEditKey(key)}
                      >
                        {key.api_key_name || <em>Unnamed</em>}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono">
                      {key.api_key_display}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          key.api_key_role === "admin"
                            ? "bg-red-100 text-red-800"
                            : key.api_key_role === "limited"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {USER_ROLE_LABELS[key.api_key_role as UserRole] ||
                          key.api_key_role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateKey(key)}
                          disabled={isRegenerating}
                        >
                          <RefreshCw className="mr-1 size-4" />
                          Regenerate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteKey(key.api_key_id, key.api_key_name)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No API keys found. Create your first API key to get started.
              </p>
              <Button onClick={handleCreateKey}>Create New API Key</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Form Modal */}
      {isCreating && (
        <ApiKeyForm
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreateApiKey={key => {
            setNewApiKey(key.api_key)
            mutate("/api/admin/api-key")
          }}
          setPopup={popup => {
            if (popup.type === "success") {
              toast.success(popup.message)
            } else if (popup.type === "error") {
              toast.error(popup.message)
            } else {
              toast.info(popup.message)
            }
          }}
          apiKey={selectedApiKey}
        />
      )}

      {/* New API Key Display Modal */}
      {newApiKey && (
        <NewApiKeyModal
          apiKey={newApiKey}
          isOpen={!!newApiKey}
          onClose={() => setNewApiKey(null)}
        />
      )}
    </div>
  )
}
