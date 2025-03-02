import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, PopupSpec } from "@/lib/types"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"

interface DeleteUserButtonProps {
  user: User
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  className?: string
  children?: React.ReactNode
}

export const DeleteUserButton = ({
  user,
  setPopup,
  mutate,
  className,
  children
}: DeleteUserButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      // Implement API call to delete user
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      setPopup({
        message: `User ${user.email} deleted successfully`,
        type: "success"
      })
      mutate()
    } catch (error) {
      setPopup({
        message: `Failed to delete user: ${error}`,
        type: "error"
      })
    } finally {
      setIsLoading(false)
      setShowConfirmModal(false)
    }
  }

  return (
    <>
      {showConfirmModal && (
        <GenericConfirmModal
          title="Delete User"
          message={`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`}
          confirmText="Delete User"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
      <Button
        variant="ghost"
        onClick={() => setShowConfirmModal(true)}
        className={className}
        disabled={isLoading}
        data-testid={`delete-user-button-${user.id}`}
      >
        {isLoading ? "Processing..." : children || "Delete User"}
      </Button>
    </>
  )
}
