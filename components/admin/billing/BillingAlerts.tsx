import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { BillingInformation, BillingStatus } from "@/lib/types/billing"

export function BillingAlerts({
  billingInformation
}: {
  billingInformation: BillingInformation
}) {
  const isTrialing = billingInformation.status === BillingStatus.TRIALING
  const isCancelled = billingInformation.cancel_at_period_end
  const isExpired = new Date(billingInformation.current_period_end) < new Date()
  const noPaymentMethod = !billingInformation.payment_method_enabled
  const isPastDue = billingInformation.status === BillingStatus.PAST_DUE

  const messages: string[] = []

  if (isExpired) {
    messages.push(
      "Your subscription has expired. Please resubscribe to continue using enterprise features."
    )
  }

  if (isPastDue) {
    messages.push(
      "Your payment is past due. Please update your payment information to avoid service interruption."
    )
  }

  if (isCancelled && !isExpired) {
    messages.push(
      `Your subscription will cancel on ${new Date(
        billingInformation.current_period_end
      ).toLocaleDateString()}. You can resubscribe before this date to maintain access.`
    )
  }

  if (isTrialing) {
    messages.push(
      `You're currently on a trial. Your trial ends on ${
        billingInformation.trial_end
          ? new Date(billingInformation.trial_end).toLocaleDateString()
          : "N/A"
      }.`
    )
  }

  if (noPaymentMethod) {
    messages.push(
      "You currently have no payment method on file. Please add one to avoid service interruption."
    )
  }

  // Determine alert severity based on status
  const variant =
    isExpired || isPastDue || noPaymentMethod ? "destructive" : "default"
  if (messages.length === 0) return null

  return (
    <Alert variant={variant}>
      <AlertTitle className="flex items-center gap-2">
        {variant === "destructive" ? (
          <AlertCircle className="size-4" />
        ) : (
          <Info className="size-4" />
        )}
        <span>
          {variant === "destructive"
            ? "Important Subscription Notice"
            : "Subscription Notice"}
        </span>
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
