"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

interface DeleteToolButtonProps {
  toolId: number
}

export function DeleteToolButton({ toolId }: DeleteToolButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this tool? This action cannot be undone."
      )
    ) {
      return
    }

    setIsDeleting(true)

    try {
      // In a real implementation, you would call your API to delete the tool
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to tools page after successful deletion
      router.push("/admin/tools")
    } catch (err) {
      alert("Failed to delete tool. Please try again.")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <IconTrash size={16} className="mr-2" />
      {isDeleting ? "Deleting..." : "Delete Tool"}
    </Button>
  )
}
