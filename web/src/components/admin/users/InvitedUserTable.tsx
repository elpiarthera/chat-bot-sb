"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvitedUserSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons/icons";
import { ThreeDotsLoader } from "@/components/Loading";
import { ErrorCallout } from "@/components/ErrorCallout";
import { deleteInvitedUser } from "@/lib/users/actions";
import { KeyedMutator } from "swr";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { formatDistanceToNow } from "date-fns";

interface InvitedUserTableProps {
  users: InvitedUserSnapshot[];
  setPopup: (spec: PopupSpec) => void;
  mutate: KeyedMutator<InvitedUserSnapshot[]>;
  error: any;
  isLoading: boolean;
  q: string;
}

export default function InvitedUserTable({
  users,
  setPopup,
  mutate,
  error,
  isLoading,
  q,
}: InvitedUserTableProps) {
  // Filter users based on search query
  const filteredUsers = q
    ? users.filter((user) =>
        user.email.toLowerCase().includes(q.toLowerCase())
      )
    : users;

  // Show loading animation only during the initial data fetch
  if (isLoading && !users.length) {
    return <ThreeDotsLoader />;
  }

  if (error) {
    return (
      <ErrorCallout
        errorTitle="Error loading invited users"
        errorMsg={error?.info?.detail}
      />
    );
  }

  const handleDelete = async (userId: number) => {
    try {
      const response = await deleteInvitedUser(userId);
      if (response.success) {
        mutate();
        setPopup({
          message: "User invitation deleted successfully",
          type: "success",
        });
      } else {
        setPopup({
          message: `Failed to delete user invitation: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      setPopup({
        message: "An error occurred while deleting the user invitation",
        type: "error",
      });
    }
  };

  return (
    <div>
      {filteredUsers.length === 0 ? (
        <div className="text-center py-4">
          {q ? "No matching invited users found" : "No invited users yet"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                    title="Delete invitation"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}