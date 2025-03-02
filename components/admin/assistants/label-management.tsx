"use client"

import React, { useState } from "react"
import { useAssistantLabels } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { AssistantLabel } from "@/lib/assistants/interfaces"
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
import { HidableSection } from "./hidable-section"
import { CollapsibleSection } from "./collapsible-section"

export function LabelManagement() {
  const { labels, isLoading, createLabel, updateLabel, deleteLabel } =
    useAssistantLabels()
  const [newLabelName, setNewLabelName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingLabel, setEditingLabel] = useState<AssistantLabel | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<AssistantLabel | null>(
    null
  )

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newLabelName.trim()) {
      toast.error("Label name is required")
      return
    }

    try {
      setIsSubmitting(true)
      await createLabel(newLabelName.trim())
      setNewLabelName("")
      toast.success(`Label "${newLabelName}" created successfully`)
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateLabel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingLabel) return

    if (!editName.trim()) {
      toast.error("Label name is required")
      return
    }

    try {
      setIsSubmitting(true)
      await updateLabel(editingLabel.id, editName.trim())
      toast.success(`Label updated successfully`)
      setEditingLabel(null)
      setEditName("")
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = () => {
    if (!selectedLabel) return

    deleteLabel(selectedLabel.id)
      .then(() => {
        toast.success(`Label "${selectedLabel.name}" deleted successfully`)
        setDeleteConfirmOpen(false)
      })
      .catch(() => {
        // Error is already handled in the hook
      })
  }

  const handleStartEdit = (label: AssistantLabel) => {
    setEditingLabel(label)
    setEditName(label.name)
  }

  const handleCancelEdit = () => {
    setEditingLabel(null)
    setEditName("")
  }

  const showDeleteConfirm = (label: AssistantLabel) => {
    setSelectedLabel(label)
    setDeleteConfirmOpen(true)
  }

  return (
    <div className="space-y-8">
      <HidableSection sectionTitle="Create New Label">
        <div>
          <p className="text-muted-foreground mb-4">
            Labels are used to categorize assistants. You can create a new label
            by entering a name below.
          </p>
          <form onSubmit={handleCreateLabel} className="flex items-end gap-4">
            <div className="w-full max-w-xs">
              <label className="mb-2 block text-sm font-medium">
                Label Name
              </label>
              <Input
                value={newLabelName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewLabelName(e.target.value)
                }
                placeholder="Enter label name"
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </form>
        </div>
      </HidableSection>

      <Separator />

      <div className="mb-6">
        <CollapsibleSection prompt="Advanced Label Options" className="mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Label Usage Guidelines</h3>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5">
              <li>Choose clear, descriptive names for your labels</li>
              <li>Use labels consistently across similar assistants</li>
              <li>
                Consider creating a labeling system (e.g., by department,
                function, or skill level)
              </li>
              <li>
                Don&apos;t create too many labels - keep the system manageable
              </li>
            </ul>
          </div>
        </CollapsibleSection>
      </div>

      <HidableSection sectionTitle="Manage Existing Labels">
        <div>
          <p className="text-muted-foreground mb-4">
            You can edit or delete existing labels below.
          </p>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading labels...</p>
            </div>
          ) : labels.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No labels found. Create your first label above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {labels.map((label: AssistantLabel) => (
                <Card key={label.id}>
                  <CardHeader>
                    <CardTitle>
                      {editingLabel?.id === label.id ? (
                        <Input
                          value={editName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditName(e.target.value)
                          }
                          className="text-lg font-semibold"
                        />
                      ) : (
                        label.name
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-end space-x-2">
                    {editingLabel?.id === label.id ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleUpdateLabel}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleStartEdit(label)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => showDeleteConfirm(label)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </HidableSection>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedLabel?.name}&quot;?
              This action cannot be undone and may affect assistants that use
              this label.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
