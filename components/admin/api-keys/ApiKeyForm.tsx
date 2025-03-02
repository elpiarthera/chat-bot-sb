import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { APIKey, APIKeyArgs } from "@/lib/types/api-keys"
import { UserRole } from "@/lib/types"
import { createApiKey, updateApiKey } from "@/lib/api-keys/api"

type PopupSpec = {
  type: "success" | "error" | "info"
  message: string
}

interface ApiKeyFormProps {
  isOpen: boolean
  onClose: () => void
  onCreateApiKey?: (apiKey: APIKey) => void
  setPopup?: (popup: PopupSpec) => void
  apiKey?: APIKey
}

export function ApiKeyForm({
  isOpen,
  onClose,
  onCreateApiKey,
  setPopup,
  apiKey
}: ApiKeyFormProps) {
  const [name, setName] = useState(apiKey?.api_key_name || "")
  const [role, setRole] = useState<UserRole>(
    (apiKey?.api_key_role as UserRole) || UserRole.BASIC
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!apiKey

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const args: APIKeyArgs = {
        name: name || undefined,
        role
      }

      let response

      if (isEdit && apiKey) {
        response = await updateApiKey(apiKey.api_key_id, args)
      } else {
        response = await createApiKey(args)
      }

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to process API key")
      }

      const data = await response.json()

      if (setPopup) {
        setPopup({
          type: "success",
          message: isEdit
            ? "API key updated successfully"
            : "API key created successfully"
        })
      }

      if (!isEdit && onCreateApiKey) {
        onCreateApiKey(data)
      }

      onClose()
    } catch (error) {
      if (setPopup) {
        setPopup({
          type: "error",
          message: `Error: ${error instanceof Error ? error.message : String(error)}`
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit API Key" : "Create New API Key"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My API Key"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3 space-y-2">
              <Select
                value={role}
                onValueChange={value => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.BASIC}>User</SelectItem>
                  <SelectItem value={UserRole.LIMITED}>Limited</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {role === UserRole.ADMIN &&
                  "Admin has access to admin level APIs."}
                {role === UserRole.BASIC &&
                  "User has access to regular user APIs."}
                {role === UserRole.LIMITED &&
                  "Limited has access to simple public APIs."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
