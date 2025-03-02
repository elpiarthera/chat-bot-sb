import { useEffect } from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { PopupSpec as BasePopupSpec } from "@/lib/types"

// Extend the PopupSpec type to include details property
interface ExtendedPopupSpec extends BasePopupSpec {
  details?: string
}

const popupVariants = cva(
  "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md p-4 shadow-md transition-all duration-300",
  {
    variants: {
      type: {
        success: "bg-green-50 text-green-800 border border-green-200",
        error: "bg-red-50 text-red-800 border border-red-200",
        warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
        info: "bg-blue-50 text-blue-800 border border-blue-200"
      }
    },
    defaultVariants: {
      type: "info"
    }
  }
)

export interface PopupProps extends VariantProps<typeof popupVariants> {
  popup: ExtendedPopupSpec | null
  onClose: () => void
  autoCloseDelay?: number
}

export function Popup({
  popup,
  onClose,
  type,
  autoCloseDelay = 5000
}: PopupProps) {
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [popup, onClose, autoCloseDelay])

  if (!popup) return null

  return (
    <div
      className={cn(
        popupVariants({
          type: popup.type as "success" | "error" | "warning" | "info"
        }),
        "animate-in fade-in slide-in-from-top-5"
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="font-medium">{popup.message}</p>
        {popup.details && (
          <p className="mt-1 text-sm opacity-80">{popup.details}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-black/5"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
