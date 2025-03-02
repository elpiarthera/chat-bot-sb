import { useState, useEffect } from "react"
import { User, PopupSpec } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimpleUserDisplay } from "./SimpleUserDisplay"
import { Search, Plus, X } from "lucide-react"

interface UserEditorProps {
  users: User[]
  selectedUsers: User[]
  onAddUser: (user: User) => void
  onRemoveUser: (user: User) => void
  setPopup?: (popup: PopupSpec) => void
  readOnly?: boolean
  title?: string
}

export function UserEditor({
  users,
  selectedUsers,
  onAddUser,
  onRemoveUser,
  setPopup,
  readOnly = false,
  title = "Users"
}: UserEditorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Filter users based on search term and exclude already selected users
  useEffect(() => {
    const filtered = users.filter(
      user =>
        !selectedUsers.some(selectedUser => selectedUser.id === user.id) &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, selectedUsers, searchTerm])

  const handleAddUser = (user: User) => {
    try {
      onAddUser(user)
      setSearchTerm("")
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to add user: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  const handleRemoveUser = (user: User) => {
    try {
      onRemoveUser(user)
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to remove user: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user-search">{title}</Label>
        {!readOnly && (
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="user-search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Selected users */}
      <div className="space-y-2">
        {selectedUsers.length > 0 ? (
          <div className="space-y-2">
            {selectedUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <SimpleUserDisplay user={user} />
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user)}
                    aria-label={`Remove ${user.email}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No users selected</p>
        )}
      </div>

      {/* User search results */}
      {!readOnly && searchTerm && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-md border">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b p-2 last:border-0 hover:bg-muted"
              >
                <SimpleUserDisplay user={user} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddUser(user)}
                  aria-label={`Add ${user.email}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              No matching users found
            </p>
          )}
        </div>
      )}
    </div>
  )
}
