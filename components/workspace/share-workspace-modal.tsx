import { FC, useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { supabase } from "@/lib/supabase/browser-client"
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
      // Validate Supabase client
      console.log("Checking Supabase client connection by loading users...")
      loadSharedUsers()
    }
  }, [isOpen, workspace.id])

  const loadSharedUsers = async () => {
    try {
      const users = await getWorkspaceUsers(workspace.id)
      console.log("Workspace users:", users)

      // For each user ID, get their auth information directly
      const userProfiles = await Promise.all(
        users.map(async user => {
          // Try to get email from auth
          let userEmail = "Unknown"
          let displayName = "Unknown User"
          let username = "unknown"

          try {
            // This might fail due to permissions, which is expected
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(user.user_id)
            if (userError) {
              console.error(
                "Error fetching auth user (expected if using server route):",
                userError
              )
            }

            if (userData?.user?.email) {
              userEmail = userData.user.email
              // Use the email's local part as display name if no profile
              displayName = userEmail.split("@")[0]
              username = displayName
            }
          } catch (emailError) {
            console.error("Error fetching user email:", emailError)
          }

          // Try to get profile info as a fallback
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, display_name")
              .eq("user_id", user.user_id)
              .single()

            if (profile) {
              username = profile.username || username
              displayName = profile.display_name || displayName
            }
          } catch (profileError) {
            // This is expected if profiles don't exist
            console.log("No profile found for user (expected):", user.user_id)
          }

          return {
            ...user,
            email: userEmail,
            display_name: displayName,
            username: username
          }
        })
      )

      console.log("User information:", userProfiles)
      setSharedUsers(userProfiles)
    } catch (error) {
      console.error("Error loading shared users:", error)
      toast.error("Failed to load shared users")
    }
  }

  const handleShareWorkspace = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      console.log("Attempting to find user with email:", email)

      // Try to find the user via admin API first (requires service role key)
      try {
        const { data: authUsers, error: authError } =
          await supabase.auth.admin.listUsers()

        if (authError) {
          console.error("Error fetching auth users:", authError)
          throw new Error(`Admin API not available: ${authError.message}`)
        }

        // Find the user with the matching email
        const authUser = authUsers?.users?.find(user => user.email === email)

        if (!authUser) {
          toast.error("User not found with that email address")
          setIsLoading(false)
          return
        }

        console.log("Found auth user with ID:", authUser.id)

        // Now get or verify the profile record exists
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", authUser.id)
          .single()

        if (profileError || !userProfile) {
          console.error("Error finding user profile:", profileError)
          toast.error("User profile not found")
          setIsLoading(false)
          return
        }

        console.log("Found user profile with ID:", userProfile.id)

        // Check if already shared
        const existingShares = sharedUsers.filter(
          user => user.user_id === userProfile.id
        )

        if (existingShares.length > 0) {
          toast.error("Workspace already shared with this user")
          setIsLoading(false)
          return
        }

        console.log("Sharing workspace with user ID:", userProfile.id)

        // Share the workspace with correct typing
        const workspaceShareData = {
          workspace_id: workspace.id,
          user_id: userProfile.id,
          role
        }

        await shareWorkspaceWithUser(workspaceShareData)

        toast.success("Workspace shared successfully")
        setEmail("")
        loadSharedUsers()
      } catch (adminApiError) {
        // Fallback: use server API to share instead
        console.error(
          "Admin API error, using server API instead:",
          adminApiError
        )

        // Make a server request to handle the sharing
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
          throw new Error(`Server API failed: ${errorText}`)
        }

        toast.success("Workspace shared successfully")
        setEmail("")
        loadSharedUsers()
      }
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
                onChange={e => setEmail(e.target.value)}
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
                          onValueChange={value =>
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
      </DialogContent>
    </Dialog>
  )
}
