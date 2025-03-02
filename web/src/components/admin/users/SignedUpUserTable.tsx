"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons/icons";
import { ThreeDotsLoader } from "@/components/Loading";
import { ErrorCallout } from "@/components/ErrorCallout";
import { InvitedUserSnapshot } from "@/lib/types";
import { KeyedMutator } from "swr";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { formatDistanceToNow } from "date-fns";
import { deleteUser } from "@/lib/users/actions";
import useSWR from "swr";
import { errorHandlingFetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";

interface UserSnapshot {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

interface SignedUpUserTableProps {
  invitedUsers: InvitedUserSnapshot[];
  setPopup: (spec: PopupSpec) => void;
  q: string;
  invitedUsersMutate: KeyedMutator<InvitedUserSnapshot[]>;
}

export default function SignedUpUserTable({
  invitedUsers,
  setPopup,
  q,
  invitedUsersMutate,
}: SignedUpUserTableProps) {
  const {
    data: users,
    error,
    isLoading,
    mutate: usersMutate,
  } = useSWR<UserSnapshot[]>("/api/manage/users", errorHandlingFetcher);

  // Show loading animation only during the initial data fetch
  if (isLoading && !users) {
    return <ThreeDotsLoader />;
  }

  if (error) {
    return (
      <ErrorCallout
        errorTitle="Error loading users"
        errorMsg={error?.info?.detail}
      />
    );
  }

  // Filter users based on search query
  const filteredUsers = q
    ? users?.filter((user) =>
        user.email.toLowerCase().includes(q.toLowerCase())
      )
    : users;

  const handleDelete = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        usersMutate();
        invitedUsersMutate();
        setPopup({
          message: "User deleted successfully",
          type: "success",
        });
      } else {
        setPopup({
          message: `Failed to delete user: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      setPopup({
        message: "An error occurred while deleting the user",
        type: "error",
      });
    }
  };

  return (
    <div>
      {!filteredUsers || filteredUsers.length === 0 ? (
        <div className="text-center py-4">
          {q ? "No matching users found" : "No users yet"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
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
                    title="Delete user"
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