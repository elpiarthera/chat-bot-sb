import { FC, useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog"
import { Tables } from "@/supabase/types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import {
  shareWorkspaceWithUser,
  getWorkspaceUsers,
  removeUserFromWorkspace,
  updateWorkspaceUserRole
} from "@/db/workspace_users"
import { customSupabase } from "@/lib/supabase/custom-client"
import { toast } from "sonner"
import { IconTrash, IconEdit } from "@tabler/icons-react"

interface ShareWorkspaceModalProps {
  workspace: Tables<"workspaces">
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ROLES = [
  { id: "viewer", name: "Viewer" },
  { id: "editor", name: "Editor" },
  { id: "admin", name: "Admin" }
]

const loadSharedUsers = async () => {
  // The existing implementation...
  // ...
}

export const ShareWorkspaceModal: FC<ShareWorkspaceModalProps> = ({
  workspace,
  isOpen,
  onOpenChange
}) => {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")
  const [isLoading, setIsLoading] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<any[]>([])
  const [editingUser, setEditingUser] = useState<any | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Load shared users when the modal opens
      loadSharedUsers()
    }
  }, [isOpen, workspace.id, loadSharedUsers])

  const handleShareWorkspace = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      console.log("Attempting to share workspace with email:", email)

      // Always use the server API for sharing - don't try client-side admin API
      const response = await fetch("/api/workspace/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspaceId: workspace.id,
          email,
          role
        })
      })

      // Log the response status for debugging
      console.log("Server API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server API error details:", errorText)
        throw new Error(errorText || "Failed to share workspace")
      }

      toast.success("Workspace shared successfully")
      setEmail("")
      loadSharedUsers()
    } catch (error) {
      console.error("Error sharing workspace:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to share workspace"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromWorkspace(workspace.id, userId)
      toast.success("User removed from workspace")
      loadSharedUsers()
    } catch (error) {
      console.error("Error removing user:", error)
      toast.error("Failed to remove user")
    }
  }

  const handleUpdateRole = async () => {
    if (!editingUser) return

    try {
      await updateWorkspaceUserRole(
        workspace.id,
        editingUser.user_id,
        editingUser.role
      )
      toast.success("User role updated")
      setEditingUser(null)
      loadSharedUsers()
    } catch (error) {
      console.error("Error updating role:", error)
      toast.error("Failed to update role")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Workspace</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleShareWorkspace}
              disabled={isLoading || !email}
              className="mt-2"
            >
              Share
            </Button>
          </div>

          {sharedUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium">Shared with</h3>
              <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                {sharedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2"
                  >
                    {editingUser && editingUser.id === user.id ? (
                      <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        <Select
                          value={editingUser.role}
                          onValueChange={(value: string) =>
                            setEditingUser({ ...editingUser, role: value })
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleUpdateRole}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span>{user.email}</span>
                          <span className="bg-secondary rounded-full px-2 py-0.5 text-xs">
                            {ROLES.find(r => r.id === user.role)?.name ||
                              user.role}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingUser(user)}
                          >
                            <IconEdit size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveUser(user.user_id)}
                          >
                            <IconTrash size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
