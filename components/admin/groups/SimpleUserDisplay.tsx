import { User, UserRole } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { UserCircle } from "lucide-react"

interface SimpleUserProps {
  user: User
  showRole?: boolean
  showStatus?: boolean
}

export const SimpleUserDisplay = ({
  user,
  showRole = true,
  showStatus = true
}: SimpleUserProps) => {
  // Map user roles to display names
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Admin"
      case UserRole.POWER_USER:
        return "Power User"
      case UserRole.BASIC:
        return "Basic User"
      case UserRole.SLACK_USER:
        return "Slack User"
      case UserRole.EXT_PERM_USER:
        return "External User"
      default:
        return role
    }
  }

  // Get badge variant based on role
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive"
      case UserRole.POWER_USER:
        return "default"
      case UserRole.BASIC:
        return "secondary"
      case UserRole.SLACK_USER:
        return "outline"
      case UserRole.EXT_PERM_USER:
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <UserCircle className="h-5 w-5 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="font-medium">{user.email}</span>
        {(showRole || showStatus) && (
          <div className="flex space-x-2 mt-1">
            {showRole && (
              <Badge
                variant={getRoleBadgeVariant(user.role)}
                className="text-xs"
              >
                {getRoleDisplayName(user.role)}
              </Badge>
            )}
            {showStatus && (
              <Badge
                variant={user.is_active ? "outline" : "destructive"}
                className="text-xs"
              >
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
