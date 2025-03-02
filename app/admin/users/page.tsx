"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { UserEditModal } from "@/components/admin/user-edit-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  IconPencil,
  IconSearch,
  IconTrash,
  IconUser,
  IconUserPlus
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string
  role: string
  status: "active" | "inactive"
  created_at?: string
}

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
      // For demo, load mock data if API fails
      setUsers([
        {
          id: "1",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          status: "active",
          created_at: "2023-01-01T00:00:00Z"
        },
        {
          id: "2",
          email: "john@example.com",
          name: "John Doe",
          role: "user",
          status: "active",
          created_at: "2023-01-15T00:00:00Z"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    // In a real application, show a confirmation dialog first
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    )

    if (confirmed) {
      try {
        // For a real implementation, make an API call:
        // const response = await fetch(`/api/admin/users/${userId}`, {
        //   method: 'DELETE'
        // })

        // if (!response.ok) throw new Error('Failed to delete user')

        // Update the local state after successful API call
        setUsers(users.filter(user => user.id !== userId))
        toast.success("User deleted successfully")
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Failed to delete user")
      }
    }
  }

  const handleSaveUser = async (userData: User) => {
    try {
      // For a real implementation, make API calls:
      // const method = selectedUser ? 'PUT' : 'POST'
      // const url = selectedUser ? `/api/admin/users/${userData.id}` : '/api/admin/users'
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // })

      // if (!response.ok) throw new Error('Failed to save user')

      // const savedUser = await response.json();
      // Update local state after successful API call
      if (selectedUser) {
        // Edit existing user
        setUsers(users.map(user => (user.id === userData.id ? userData : user)))
      } else {
        // Add new user with mock ID
        setUsers([...users, { ...userData, id: `temp-${Date.now()}` }])
      }

      toast.success(`User ${selectedUser ? "updated" : "created"} successfully`)
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error(`Failed to ${selectedUser ? "update" : "create"} user`)
    }
  }

  // Search input as a far-right element for our title
  const searchInput = (
    <div className="relative w-64">
      <IconSearch className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        className="pl-8"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl">
      <AdminPageTitle
        icon={<IconUser size={28} />}
        title="User Management"
        farRightElement={
          <div className="flex items-center gap-4">
            {searchInput}
            <Button onClick={handleAddUser}>
              <IconUserPlus className="mr-2 size-4" />
              Add User
            </Button>
          </div>
        }
      />

      <CardSection>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : user.role === "editor"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <IconPencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardSection>

      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveUser}
      />
    </div>
  )
}
