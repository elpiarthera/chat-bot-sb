import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"

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

interface Group {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  users: User[]
  resources: Resource[]
  connector_ids: string[]
}

interface GroupEditFormProps {
  groupId: string
  allUsers: User[]
  allResources: Resource[]
  allConnectors: Connector[]
  setPopup: (popup: PopupSpec) => void
  onSuccess?: () => void
}

export function GroupEditForm({
  groupId,
  allUsers,
  allResources,
  allConnectors,
  setPopup,
  onSuccess
}: GroupEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [selectedResources, setSelectedResources] = useState<Resource[]>([])
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([])

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/admin/groups/${groupId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch group data")
        }

        const group: Group = await response.json()

        // Set form values
        setName(group.name)
        setDescription(group.description || "")
        setSelectedUsers(group.users)
        setSelectedResources(group.resources)
        setSelectedConnectorIds(group.connector_ids || [])
      } catch (error) {
        setPopup({
          message: `Failed to load group: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
        router.push("/admin/groups")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroup()
  }, [groupId, router, setPopup])

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
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: "PUT",
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
        throw new Error(errorData.message || "Failed to update group")
      }

      setPopup({
        message: "Group updated successfully",
        type: "success"
      })

      if (onSuccess) {
        onSuccess()
      }

      // Redirect to groups list
      router.push("/admin/groups")
    } catch (error) {
      setPopup({
        message: `Failed to update group: ${error instanceof Error ? error.message : String(error)}`,
        type: "error"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24 ml-auto" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Group</CardTitle>
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
              users={allUsers}
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
              resources={allResources}
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
              availableConnectors={allConnectors}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
