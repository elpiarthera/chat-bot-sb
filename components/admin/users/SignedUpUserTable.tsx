import { useState } from "react"
import { User, PopupSpec, UserRole } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { DeleteUserButton } from "./buttons/DeleteUserButton"
import { DeactivateUserButton } from "./buttons/DeactivateUserButton"
import { InviteUserButton } from "./buttons/InviteUserButton"
import UserRoleDropdown from "./buttons/UserRoleDropdown"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

// Extend the User type to include additional properties needed for this component
interface ExtendedUser extends User {
  has_signed_up: boolean
  created_at?: string
  last_login_at?: string
}

interface SignedUpUserTableProps {
  users: ExtendedUser[]
  setPopup: (spec: PopupSpec) => void
  mutate: () => void
  currentUserEmail?: string
}

export const SignedUpUserTable = ({
  users,
  setPopup,
  mutate,
  currentUserEmail
}: SignedUpUserTableProps) => {
  const handleRoleSuccess = () => {
    setPopup({
      message: "User role updated successfully",
      type: "success"
    })
    mutate()
  }

  const handleRoleError = (message: string) => {
    setPopup({
      message: `Failed to update user role: ${message}`,
      type: "error"
    })
  }

  // Filter out users who have signed up
  const signedUpUsers = users.filter(user => user.has_signed_up)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signedUpUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No users have signed up yet
              </TableCell>
            </TableRow>
          ) : (
            signedUpUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.email}
                  {user.email === currentUserEmail && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <UserRoleDropdown
                    user={user}
                    onSuccess={handleRoleSuccess}
                    onError={handleRoleError}
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at ? (
                    <span title={new Date(user.created_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true
                      })}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {user.last_login_at ? (
                    <span title={new Date(user.last_login_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(user.last_login_at), {
                        addSuffix: true
                      })}
                    </span>
                  ) : (
                    "Never"
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {user.email !== currentUserEmail && (
                    <>
                      <DeactivateUserButton
                        user={user}
                        deactivate={user.is_active}
                        setPopup={setPopup}
                        mutate={mutate}
                        className="h-8 w-8 p-0"
                      />
                      <DeleteUserButton
                        user={user}
                        setPopup={setPopup}
                        mutate={mutate}
                        className="h-8 w-8 p-0"
                      />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
