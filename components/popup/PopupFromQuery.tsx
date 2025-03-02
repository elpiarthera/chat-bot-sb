import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

type PopupType = "success" | "error" | "warning" | "info"

interface PopupConfig {
  message: string
  type: PopupType
  title?: string
}

interface PopupFromQueryProps {
  [key: string]: PopupConfig
}

export function usePopupFromQuery(popupConfigs: PopupFromQueryProps) {
  const searchParams = useSearchParams()
  const [popup, setPopup] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    if (!searchParams) return

    for (const [key, config] of Object.entries(popupConfigs)) {
      if (searchParams.has(key)) {
        const PopupComponent = (
          <Alert
            variant={config.type === "error" ? "destructive" : "default"}
            className="max-w-3xl mb-6"
          >
            {config.type === "success" && <CheckCircle className="size-5" />}
            {config.type === "error" && <XCircle className="size-5" />}
            {config.type === "warning" && <AlertCircle className="size-5" />}
            {config.type === "info" && <AlertCircle className="size-5" />}

            {config.title && <AlertTitle>{config.title}</AlertTitle>}
            <AlertDescription>{config.message}</AlertDescription>
          </Alert>
        )

        setPopup(PopupComponent)
        break
      }
    }
  }, [searchParams, popupConfigs])

  return { popup }
}
