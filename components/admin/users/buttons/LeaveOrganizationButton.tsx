import { useState } from "react"
import { User, PopupSpec } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"
import { LogOut } from "lucide-react"
import useSWRMutation from "swr/mutation"
import userMutationFetcher from "@/lib/admin/users/userMutationFetcher"

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { trigger, isMutating } = useSWRMutation(
    "/api/admin/organization/leave",
    userMutationFetcher,
    {
      onSuccess: () => {
        setShowConfirmModal(false)
        mutate()
        setPopup({
          message: "You have successfully left the organization",
          type: "success"
        })
        // Redirect to logout or home page
        window.location.href = "/"
      },
      onError: error => {
        setShowConfirmModal(false)
        setPopup({
          message: `Failed to leave organization: ${error.message}`,
          type: "error"
        })
      }
    }
  )

  return (
    <>
      {showConfirmModal && (
        <GenericConfirmModal
          title="Leave Organization"
          message="Are you sure you want to leave this organization? You will lose access to all organization data and resources."
          confirmText="Leave Organization"
          cancelText="Cancel"
          onConfirm={() => trigger({ user_id: user.id })}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      <Button
        variant="ghost"
        onClick={() => setShowConfirmModal(true)}
        className={className}
        disabled={isMutating}
        data-testid={`leave-org-button-${user.id}`}
        size="sm"
      >
        {isMutating
          ? "Processing..."
          : children || (
              <>
                <LogOut className="mr-2 size-4" />
                <span>Leave Organization</span>
              </>
            )}
      </Button>
    </>
  )
}
