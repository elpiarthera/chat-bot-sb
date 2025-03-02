import React from "react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { AlertCircle } from "lucide-react"
import { formatDate } from "../../lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion"
import { PopupSpec } from "../admin/connectors/Popup"

interface FailedConnectorIndexingStatus {
  connector_id: string
  failed_at: string
  error_message: string
}

interface FailedReIndexAttemptsProps {
  failedIndexingStatuses: FailedConnectorIndexingStatus[]
  setPopup: (
    popupSpec:
      | PopupSpec
      | { message: string; type?: "success" | "error" | "warning" | "info" }
  ) => void
}

export const FailedReIndexAttempts: React.FC<FailedReIndexAttemptsProps> = ({
  failedIndexingStatuses,
  setPopup
}) => {
  if (failedIndexingStatuses.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="size-5" />
        <AlertTitle>Failed Indexing Attempts</AlertTitle>
        <AlertDescription>
          Some connectors failed to reindex. Expand below to see details.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        {failedIndexingStatuses.map((attempt, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              <div className="flex flex-col items-start">
                <span className="font-medium">{attempt.connector_id}</span>
                <span className="text-sm text-muted-foreground">
                  Failed at {formatDate(attempt.failed_at)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted p-3 rounded-md overflow-auto max-h-40">
                <pre className="text-sm whitespace-pre-wrap">
                  {attempt.error_message}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
