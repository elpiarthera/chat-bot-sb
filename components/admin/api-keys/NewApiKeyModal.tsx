import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy } from "lucide-react"

interface NewApiKeyModalProps {
  apiKey: string
  isOpen: boolean
  onClose: () => void
}

export function NewApiKeyModal({
  apiKey,
  isOpen,
  onClose
}: NewApiKeyModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New API Key Generated</DialogTitle>
          <DialogDescription>
            Make sure to copy your new API key now. You won&apos;t be able to
            see it again.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label className="sr-only" htmlFor="apiKey">
              API Key
            </Label>
            <Input id="apiKey" value={apiKey} readOnly className="font-mono" />
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>

        <DialogFooter>
          <p className="text-muted-foreground text-xs">
            {copied && "Copied to clipboard!"}
          </p>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
