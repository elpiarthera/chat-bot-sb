"use client"

import { BillingInformation, BillingStatus } from "@/lib/types/billing"
import { Badge } from "@/components/ui/badge"

export function SubscriptionSummary({
  billingInformation
}: {
  billingInformation: BillingInformation
}) {
  // Add formatCurrency function inside the component
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  // Helper function to get status badge color
  const getStatusColor = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.ACTIVE:
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case BillingStatus.TRIALING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case BillingStatus.PAST_DUE:
      case BillingStatus.UNPAID:
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      case BillingStatus.CANCELED:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
    }
  }

  // Format the interval for display
  const formatInterval = (interval: string) => {
    switch (interval) {
      case "month":
        return "Monthly"
      case "year":
        return "Annually"
      case "one-time":
        return "One-time payment"
      default:
        return interval
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            {billingInformation.product_name}
          </h3>
          <p className="text-sm text-gray-500">
            {formatCurrency(billingInformation.price_amount)} /{" "}
            {formatInterval(billingInformation.price_interval)}
          </p>
        </div>
        <Badge className={getStatusColor(billingInformation.status)}>
          {billingInformation.status.charAt(0).toUpperCase() +
            billingInformation.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Current Period</p>
          <p>
            {new Date(
              billingInformation.current_period_start
            ).toLocaleDateString()}{" "}
            -{" "}
            {new Date(
              billingInformation.current_period_end
            ).toLocaleDateString()}
          </p>
        </div>

        {billingInformation.trial_end && (
          <div>
            <p className="text-gray-500">Trial Ends</p>
            <p>{new Date(billingInformation.trial_end).toLocaleDateString()}</p>
          </div>
        )}

        <div>
          <p className="text-gray-500">Auto Renewal</p>
          <p>{billingInformation.cancel_at_period_end ? "No" : "Yes"}</p>
        </div>

        <div>
          <p className="text-gray-500">Payment Method</p>
          <p>
            {billingInformation.payment_method_enabled ? "Added" : "Not added"}
          </p>
        </div>
      </div>
    </div>
  )
}
