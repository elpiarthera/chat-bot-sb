import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, PopupSpec } from "@/lib/types"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"
import useSWRMutation from "swr/mutation"
import userMutationFetcher from "@/lib/admin/users/userMutationFetcher"

// Enhanced InviteUserButton with SWR mutation handling
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Define invite mutation
  const { trigger: inviteTrigger, isMutating: isInviting } = useSWRMutation(
    "/api/admin/users/invite",
    userMutationFetcher,
    {
      onSuccess: () => {
        setShowConfirmModal(false)
        if (Array.isArray(mutate)) {
          mutate.forEach(fn => fn())
        } else {
          mutate()
        }
        setPopup({
          message: "User invited successfully!",
          type: "success"
        })
      },
      onError: error => {
        setShowConfirmModal(false)
        setPopup({
          message: `Failed to invite user: ${error.message}`,
          type: "error"
        })
      }
    }
  )

  // Define uninvite mutation
  const { trigger: uninviteTrigger, isMutating: isUninviting } = useSWRMutation(
    "/api/admin/users/uninvite",
    userMutationFetcher,
    {
      onSuccess: () => {
        setShowConfirmModal(false)
        if (Array.isArray(mutate)) {
          mutate.forEach(fn => fn())
        } else {
          mutate()
        }
        setPopup({
          message: "User uninvited successfully!",
          type: "success"
        })
      },
      onError: error => {
        setShowConfirmModal(false)
        setPopup({
          message: `Failed to uninvite user: ${error.message}`,
          type: "error"
        })
      }
    }
  )

  const handleConfirm = () => {
    if (invited) {
      uninviteTrigger({ user_email: user.email })
    } else {
      inviteTrigger({ emails: [user.email] })
    }
  }

  const isLoading = isInviting || isUninviting

  return (
    <>
      {showConfirmModal && (
        <GenericConfirmModal
          title={`${invited ? "Uninvite" : "Invite"} User`}
          message={`Are you sure you want to ${invited ? "uninvite" : "invite"} ${user.email}?`}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />
      )}

      <Button
        variant="outline"
        onClick={() => setShowConfirmModal(true)}
        disabled={isLoading}
        size="sm"
        data-testid={`invite-user-button-${user.id}`}
        className="w-min"
      >
        {isLoading ? "Processing..." : invited ? "Uninvite" : "Invite"}
      </Button>
    </>
  )
}
