"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Tables } from "@/supabase/types"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Edit,
  Trash2,
  EyeOff,
  Eye,
  Star,
  Copy,
  GripVertical
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { AssistantLabel } from "@/lib/assistants/interfaces"
import { getAssistantDisplayName } from "@/lib/assistants/utils"

// Type for combined assistant data including labels
interface AssistantWithMeta extends Tables<"assistants"> {
  labels?: AssistantLabel[]
  starter_messages?: { message: string; name?: string }[]
  display_order?: number
  // Note: id, name, description, created_at, is_default, and is_visible are already in Tables<"assistants">
}

export function AssistantsTable({
  assistants,
  onRefresh
}: {
  assistants: AssistantWithMeta[]
  onRefresh: () => void
}) {
  const router = useRouter()
  const [sortedAssistants, setSortedAssistants] = useState<AssistantWithMeta[]>(
    []
  )
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [defaultConfirmOpen, setDefaultConfirmOpen] = useState(false)
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantWithMeta | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Initialize sorted assistants
  useEffect(() => {
    setSortedAssistants(
      [...assistants].sort((a, b) => {
        // Default assistants first
        if (a.is_default && !b.is_default) return -1
        if (!a.is_default && b.is_default) return 1

        // Then visible assistants
        if (a.is_visible && !b.is_visible) return -1
        if (!a.is_visible && b.is_visible) return 1

        // Then by display_order if it exists
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order
        }

        // Finally by creation date (newest first)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })
    )
  }, [assistants])

  // Handler for toggling visibility
  const handleToggleVisibility = async (assistant: AssistantWithMeta) => {
    try {
      const response = await fetch(
        `/api/admin/assistants/${assistant.id}/toggle-visibility`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            is_visible: !assistant.is_visible
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update visibility")
      }

      toast.success(
        `Assistant is now ${assistant.is_visible ? "hidden" : "visible"}`
      )
      onRefresh()
    } catch (error) {
      console.error("Error toggling visibility:", error)
      toast.error("Failed to update visibility status")
    }
  }

  // Handler for showing default confirmation dialog
  const showDefaultConfirm = (assistant: AssistantWithMeta) => {
    setSelectedAssistant(assistant)
    setDefaultConfirmOpen(true)
  }

  // Handler for actually toggling default status
  const handleToggleDefault = async () => {
    if (!selectedAssistant) return

    try {
      const response = await fetch(
        `/api/admin/assistants/${selectedAssistant.id}/toggle-default`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            is_default: !selectedAssistant.is_default
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update default status")
      }

      toast.success(
        `${selectedAssistant.name} is ${selectedAssistant.is_default ? "no longer" : "now"} the default assistant`
      )
      setDefaultConfirmOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Error toggling default status:", error)
      toast.error("Failed to update default status")
    }
  }

  // Handler for showing delete confirmation dialog
  const showDeleteConfirm = (assistant: AssistantWithMeta) => {
    setSelectedAssistant(assistant)
    setDeleteConfirmOpen(true)
  }

  // Handler for actually deleting assistant
  const handleDeleteAssistant = async () => {
    if (!selectedAssistant) return

    try {
      const response = await fetch(
        `/api/admin/assistants/${selectedAssistant.id}`,
        {
          method: "DELETE"
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete assistant")
      }

      toast.success(`"${selectedAssistant.name}" has been deleted`)
      setDeleteConfirmOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Error deleting assistant:", error)
      toast.error("Failed to delete assistant")
    }
  }

  // Handler for duplicating an assistant
  const handleDuplicateAssistant = async (assistant: AssistantWithMeta) => {
    try {
      const response = await fetch(
        `/api/admin/assistants/${assistant.id}/duplicate`,
        {
          method: "POST"
        }
      )

      if (!response.ok) {
        throw new Error("Failed to duplicate assistant")
      }

      toast.success(`"${assistant.name}" has been duplicated`)
      onRefresh()
    } catch (error) {
      console.error("Error duplicating assistant:", error)
      toast.error("Failed to duplicate assistant")
    }
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setIsDragging(true)
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newOrder = [...sortedAssistants]
    const draggedItem = newOrder[draggedIndex]
    if (draggedIndex !== index) {
      // Remove item from old position
      newOrder.splice(draggedIndex, 1)
      // Insert at new position
      newOrder.splice(index, 0, draggedItem)

      setSortedAssistants(newOrder)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = async () => {
    setIsDragging(false)
    setDraggedIndex(null)

    // Update display order on the server
    try {
      const displayOrders = sortedAssistants.map((assistant, index) => ({
        id: assistant.id,
        display_order: index
      }))

      const response = await fetch("/api/admin/assistants/update-order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ assistants: displayOrders })
      })

      if (!response.ok) {
        throw new Error("Failed to update assistant order")
      }

      toast.success("Assistant order updated")
      onRefresh()
    } catch (error) {
      console.error("Error updating assistant order:", error)
      toast.error("Failed to update assistant order")
    }
  }

  return (
    <>
      <div className="w-full">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead className="text-center">Default</TableHead>
              <TableHead className="text-center">Visible</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssistants.map((assistant, index) => (
              <TableRow
                key={assistant.id}
                className={
                  isDragging && draggedIndex === index
                    ? "opacity-50 bg-accent"
                    : ""
                }
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <TableCell className="cursor-move">
                  <GripVertical className="text-muted-foreground" size={20} />
                </TableCell>
                <TableCell className="font-medium">
                  {getAssistantDisplayName(assistant)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {assistant.description}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {assistant.labels &&
                      assistant.labels.map(label => (
                        <Badge key={label.id} variant="outline">
                          {label.name}
                        </Badge>
                      ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    onClick={() => showDefaultConfirm(assistant)}
                    className="flex justify-center cursor-pointer"
                  >
                    <Checkbox
                      checked={assistant.is_default}
                      className="cursor-pointer"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    onClick={() => handleToggleVisibility(assistant)}
                    className="flex justify-center cursor-pointer"
                  >
                    <Checkbox
                      checked={assistant.is_visible}
                      className="cursor-pointer"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/admin/assistants/${assistant.id}`)
                      }
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicateAssistant(assistant)}
                      title="Duplicate"
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => showDeleteConfirm(assistant)}
                      title="Delete"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedAssistant?.name}
              &quot;? This action cannot be undone, and all related
              conversations will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssistant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Default Status Confirmation Dialog */}
      <AlertDialog
        open={defaultConfirmOpen}
        onOpenChange={setDefaultConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAssistant?.is_default
                ? "Remove Default Status"
                : "Set as Default Assistant"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAssistant?.is_default
                ? `"${selectedAssistant?.name}" will no longer be the default assistant for new conversations.`
                : `Setting "${selectedAssistant?.name}" as the default assistant will make it the initial selection for all new conversations. The current default assistant will be unset.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleDefault}>
              {selectedAssistant?.is_default
                ? "Remove Default"
                : "Set as Default"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
