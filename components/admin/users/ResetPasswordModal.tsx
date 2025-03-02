import { useState } from "react"
import { User, PopupSpec } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy } from "lucide-react"

interface ResetPasswordModalProps {
  user: User
  onClose: () => void
  setPopup: (spec: PopupSpec) => void
}

const ResetPasswordModal = ({
  user,
  onClose,
  setPopup
}: ResetPasswordModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [generateRandom, setGenerateRandom] = useState(true)

  const handleGeneratePassword = () => {
    // Generate a random password with letters, numbers, and special characters
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    const length = 12
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(result)
  }

  const handleResetPassword = async () => {
    if (generateRandom && !newPassword) {
      handleGeneratePassword()
      return
    }

    if (!newPassword) {
      setPopup({
        message: "Please enter a new password or generate a random one",
        type: "error"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/users/${user.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ new_password: newPassword })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reset password")
      }

      setPopup({
        message: `Password reset successfully for ${user.email}`,
        type: "success"
      })
      onClose()
    } catch (error) {
      setPopup({
        message: `Failed to reset password: ${error}`,
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword)
    setPopup({
      message: "Password copied to clipboard",
      type: "success"
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for user: {user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-random"
              checked={generateRandom}
              onCheckedChange={checked => {
                setGenerateRandom(!!checked)
                if (checked && !newPassword) {
                  handleGeneratePassword()
                }
              }}
            />
            <Label htmlFor="generate-random">Generate random password</Label>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              New Password
            </Label>
            <div className="col-span-3 flex">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
              />
              {newPassword && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <Checkbox
              id="show-password"
              checked={showPassword}
              onCheckedChange={checked => setShowPassword(!!checked)}
            />
            <Label htmlFor="show-password">Show password</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword} disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ResetPasswordModal
