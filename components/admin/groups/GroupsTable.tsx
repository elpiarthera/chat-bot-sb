import { useState } from "react"
import { useRouter } from "next/router"
import { PopupSpec } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"
import { formatDistanceToNow } from "date-fns"
import { Edit, Trash2, Users, Database } from "lucide-react"

interface User {
  id: string
  email: string
}

interface Resource {
  id: string
  name: string
  type: string
}

interface Group {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  users: User[]
  resources: Resource[]
}

interface GroupsTableProps {
  groups: Group[]
  setPopup: (popup: PopupSpec) => void
  mutate: () => void
}

export function GroupsTable({ groups, setPopup, mutate }: GroupsTableProps) {
  const router = useRouter()
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const groupToDelete = deleteGroupId
    ? groups.find(group => group.id === deleteGroupId)
    : null

  const handleEdit = (groupId: string) => {
    router.push(`/admin/groups/${groupId}`)
  }

  const handleDelete = async () => {
    if (!deleteGroupId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/groups/${deleteGroupId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete group")
      }

      setPopup({
        message: "Group deleted successfully",
        type: "success"
      })

      mutate()
    } catch (error) {
      setPopup({
        message: `Failed to delete group: ${error instanceof Error ? error.message : String(error)}`,
        type: "error"
      })
    } finally {
      setIsDeleting(false)
      setDeleteGroupId(null)
    }
  }

  return (
    <>
      {groupToDelete && (
        <GenericConfirmModal
          title="Delete Group"
          message={`Are you sure you want to delete the group "${groupToDelete.name}"? This will remove access to all associated resources for ${groupToDelete.users.length} user(s).`}
          confirmText="Delete Group"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onClose={() => setDeleteGroupId(null)}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Resources</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-muted-foreground"
                >
                  No groups found
                </TableCell>
              </TableRow>
            ) : (
              groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{group.users.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{group.resources.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {group.created_at ? (
                      <span title={new Date(group.created_at).toLocaleString()}>
                        {formatDistanceToNow(new Date(group.created_at), {
                          addSuffix: true
                        })}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(group.id)}
                      className="mr-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteGroupId(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
