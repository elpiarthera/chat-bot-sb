import React from "react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorCalloutProps {
  errorTitle: string
  errorMessage: string
  className?: string
}

export const ErrorCallout: React.FC<ErrorCalloutProps> = ({
  errorTitle,
  errorMessage,
  className
}) => {
  return (
    <Alert variant="destructive" className={cn("max-w-3xl", className)}>
      <AlertCircle className="size-5" />
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
