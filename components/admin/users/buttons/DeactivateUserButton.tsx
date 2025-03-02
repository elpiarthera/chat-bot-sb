import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, PopupSpec } from "@/lib/types"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"

interface DeactivateUserButtonProps {
  user: User
  deactivate: boolean
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  className?: string
  children?: React.ReactNode
}

export const DeactivateUserButton = ({
  user,
  deactivate,
  setPopup,
  mutate,
  className,
  children
}: DeactivateUserButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleDeactivate = async () => {
    setIsLoading(true)
    try {
      // Implement API call to activate/deactivate user
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !deactivate })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            `Failed to ${deactivate ? "deactivate" : "activate"} user`
        )
      }

      setPopup({
        message: `User ${deactivate ? "deactivated" : "activated"} successfully`,
        type: "success"
      })
      mutate()
    } catch (error) {
      setPopup({
        message: `Failed to ${deactivate ? "deactivate" : "activate"} user: ${error}`,
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
          title={`${deactivate ? "Deactivate" : "Activate"} User`}
          message={`Are you sure you want to ${deactivate ? "deactivate" : "activate"} ${user.email}?${
            deactivate ? " This will revoke their access to the system." : ""
          }`}
          confirmText={`${deactivate ? "Deactivate" : "Activate"} User`}
          cancelText="Cancel"
          onConfirm={handleDeactivate}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      <Button
        variant="ghost"
        onClick={() => setShowConfirmModal(true)}
        className={className}
        disabled={isLoading}
        data-testid={`${deactivate ? "deactivate" : "activate"}-user-button-${user.id}`}
      >
        {isLoading
          ? "Processing..."
          : children || (deactivate ? "Deactivate User" : "Activate User")}
      </Button>
    </>
  )
}
