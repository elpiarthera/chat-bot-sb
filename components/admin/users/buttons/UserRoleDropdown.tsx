import { useState } from "react"
import { User, UserRole, USER_ROLE_LABELS } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { GenericConfirmModal } from "@/components/modals/GenericConfirmModal"
import useSWRMutation from "swr/mutation"
import userMutationFetcher from "@/lib/admin/users/userMutationFetcher"

// Define roles that require confirmation when changed from
const ROLES_REQUIRING_CONFIRMATION = [UserRole.ADMIN]

// Skip showing these roles unless user already has them
const HIDDEN_ROLES = [UserRole.SLACK_USER, UserRole.EXT_PERM_USER]

// Add hover text information for roles (optional)
const ROLE_HOVER_TEXT: Partial<Record<UserRole, string>> = {
  [UserRole.ADMIN]: "Full access to all admin features",
  [UserRole.BASIC]: "Basic access to the application",
  [UserRole.POWER_USER]: "Enhanced permissions for power users",
  [UserRole.SLACK_USER]: "Used for Slack integration",
  [UserRole.EXT_PERM_USER]: "Reserved for external permissioned users"
}

interface UserRoleDropdownProps {
  user: User
  onSuccess: () => void
  onError: (msg: string) => void
}

const UserRoleDropdown: React.FC<UserRoleDropdownProps> = ({
  user,
  onSuccess,
  onError
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)

  const { trigger: setUserRole, isMutating: isSettingRole } = useSWRMutation(
    "/api/admin/users/role",
    userMutationFetcher,
    {
      onSuccess: () => {
        setShowConfirmModal(false)
        onSuccess()
      },
      onError: error => {
        setShowConfirmModal(false)
        onError(error.message)
      }
    }
  )

  const handleRoleChange = (value: UserRole) => {
    if (value === user.role) return

    // If changing from a role that requires confirmation, show modal
    if (ROLES_REQUIRING_CONFIRMATION.includes(user.role)) {
      setShowConfirmModal(true)
      setPendingRole(value)
    } else {
      setUserRole({
        user_email: user.email,
        new_role: value
      })
    }
  }

  const handleConfirm = () => {
    if (pendingRole) {
      setUserRole({
        user_email: user.email,
        new_role: pendingRole
      })
    }
  }

  return (
    <>
      <Select
        value={user.role}
        onValueChange={value => handleRoleChange(value as UserRole)}
        disabled={isSettingRole}
      >
        <SelectTrigger
          className="w-[160px]"
          data-testid={`user-role-dropdown-trigger-${user.email}`}
        >
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(USER_ROLE_LABELS)
            .filter(([roleKey]) => {
              const roleEnum = roleKey as UserRole
              // Always show current role + don't show hidden roles
              return roleEnum === user.role || !HIDDEN_ROLES.includes(roleEnum)
            })
            .map(([roleKey, label]) => (
              <SelectItem
                key={roleKey}
                value={roleKey}
                data-testid={`user-role-dropdown-${roleKey}`}
                title={ROLE_HOVER_TEXT[roleKey as UserRole] || ""}
              >
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {showConfirmModal && (
        <GenericConfirmModal
          title="Change User Role"
          message={`Warning: Changing this user's role from ${USER_ROLE_LABELS[user.role]} to ${USER_ROLE_LABELS[pendingRole as UserRole]} may affect their permissions and access. Do you want to continue?`}
          confirmText={`Change to ${USER_ROLE_LABELS[pendingRole as UserRole]}`}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

export default UserRoleDropdown
