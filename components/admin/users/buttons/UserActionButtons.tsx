import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, PopupSpec } from "@/lib/types"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"

// Enhanced InviteUserButton with confirmation modal
export const InviteUserButton = ({
  user,
  invited,
  setPopup,
  mutate
}: {
  user: User
  invited: boolean
  setPopup: (spec: PopupSpec) => void
  mutate: (() => void)[] | (() => void)
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleInvite = async () => {
    setIsLoading(true)
    try {
      // API endpoint depends on whether we're inviting or uninviting
      const endpoint = invited
        ? "/api/admin/users/uninvite"
        : "/api/admin/users/invite"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: user.email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process invitation")
      }

      setPopup({
        message: `User ${invited ? "uninvited" : "invited"} successfully`,
        type: "success"
      })

      // Update the UI
      if (Array.isArray(mutate)) {
        mutate.forEach(fn => fn())
      } else {
        mutate()
      }
    } catch (error) {
      setPopup({
        message: `Failed to ${invited ? "uninvite" : "invite"} user: ${error}`,
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
          title={`${invited ? "Uninvite" : "Invite"} User`}
          message={`Are you sure you want to ${invited ? "uninvite" : "invite"} ${user.email}?`}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleInvite}
        />
      )}

      <Button
        variant="outline"
        onClick={() => setShowConfirmModal(true)}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : invited ? "Uninvite" : "Invite"}
      </Button>
    </>
  )
}

// Delete User Button
export const DeleteUserButton = ({
  user,
  setPopup,
  mutate,
  className,
  children
}: {
  user: User
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  className?: string
  children?: React.ReactNode
}) => {
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

// Deactivate User Button
export const DeactivateUserButton = ({
  user,
  deactivate,
  setPopup,
  mutate,
  className,
  children
}: {
  user: User
  deactivate: boolean
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  className?: string
  children?: React.ReactNode
}) => {
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

// Leave Organization Button
export const LeaveOrganizationButton = ({
  user,
  setPopup,
  mutate,
  className,
  children
}: {
  user: User
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  className?: string
  children?: React.ReactNode
}) => {
  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this organization?")) {
      try {
        // Implement API call to leave organization
        setPopup({
          message: "You have left the organization",
          type: "success"
        })
        mutate()
        // Redirect to logout or home page
        window.location.href = "/"
      } catch (error) {
        setPopup({
          message: `Failed to leave organization: ${error}`,
          type: "error"
        })
      }
    }
  }

  return (
    <Button variant="ghost" onClick={handleLeave} className={className}>
      {children || "Leave Organization"}
    </Button>
  )
}
