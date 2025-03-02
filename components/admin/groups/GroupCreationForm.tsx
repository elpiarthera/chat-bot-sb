import { useState } from "react"
import { useRouter } from "next/router"
import { PopupSpec } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { UserEditor } from "./UserEditor"
import { ResourceEditor } from "./ResourceEditor"
import { ConnectorSelector } from "./ConnectorSelector"
import { User } from "@/lib/types"

interface Resource {
  id: string
  name: string
  type: string
}

interface Connector {
  id: string
  name: string
  type: string
  status: "active" | "inactive" | "pending"
}

interface GroupCreationFormProps {
  users: User[]
  resources: Resource[]
  connectors: Connector[]
  setPopup: (popup: PopupSpec) => void
  onSuccess?: () => void
}

export function GroupCreationForm({
  users,
  resources,
  connectors,
  setPopup,
  onSuccess
}: GroupCreationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [selectedResources, setSelectedResources] = useState<Resource[]>([])
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([])

  const handleAddUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user])
  }

  const handleRemoveUser = (user: User) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
  }

  const handleAddResource = (resource: Resource) => {
    setSelectedResources([...selectedResources, resource])
  }

  const handleRemoveResource = (resource: Resource) => {
    setSelectedResources(selectedResources.filter(r => r.id !== resource.id))
  }

  const handleAddConnector = (connectorId: string) => {
    setSelectedConnectorIds([...selectedConnectorIds, connectorId])
  }

  const handleRemoveConnector = (connectorId: string) => {
    setSelectedConnectorIds(
      selectedConnectorIds.filter(id => id !== connectorId)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setPopup({
        message: "Group name is required",
        type: "error"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,
          user_ids: selectedUsers.map(user => user.id),
          resource_ids: selectedResources.map(resource => resource.id),
          connector_ids: selectedConnectorIds
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create group")
      }

      setPopup({
        message: "Group created successfully",
        type: "success"
      })

      // Reset form
      setName("")
      setDescription("")
      setSelectedUsers([])
      setSelectedResources([])
      setSelectedConnectorIds([])

      if (onSuccess) {
        onSuccess()
      }

      // Redirect to groups list
      router.push("/admin/groups")
    } catch (error) {
      setPopup({
        message: `Failed to create group: ${error instanceof Error ? error.message : String(error)}`,
        type: "error"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
          </div>

          {/* Users */}
          <div className="border rounded-md p-4">
            <UserEditor
              users={users}
              selectedUsers={selectedUsers}
              onAddUser={handleAddUser}
              onRemoveUser={handleRemoveUser}
              setPopup={setPopup}
              title="Group Members"
            />
          </div>

          {/* Resources */}
          <div className="border rounded-md p-4">
            <ResourceEditor
              resources={resources}
              selectedResources={selectedResources}
              onAddResource={handleAddResource}
              onRemoveResource={handleRemoveResource}
              setPopup={setPopup}
              title="Resources"
            />
          </div>

          {/* Connectors */}
          <div className="border rounded-md p-4">
            <ConnectorSelector
              availableConnectors={connectors}
              selectedConnectorIds={selectedConnectorIds}
              onSelectConnector={handleAddConnector}
              onRemoveConnector={handleRemoveConnector}
              setPopup={setPopup}
              title="Data Connectors"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/groups")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
