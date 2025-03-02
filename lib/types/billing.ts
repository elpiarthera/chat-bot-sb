export enum BillingStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  UNPAID = "unpaid"
}

export interface BillingInformation {
  status: BillingStatus
  product_name: string
  price_amount: number
  price_interval: "month" | "year" | "one-time"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end: string | null
  trial_start: string | null
  payment_method_enabled: boolean
  subscription_id: string
  seats: number
  canceled_at: string | null
}

export interface SeatManagement {
  seats: number
  max_seats: number
  seats_used: number
  can_add_seats: boolean
}

export const statusToDisplayName = (status: BillingStatus): string => {
  switch (status) {
    case BillingStatus.ACTIVE:
      return "Active"
    case BillingStatus.TRIALING:
      return "Trial"
    case BillingStatus.PAST_DUE:
      return "Past Due"
    case BillingStatus.CANCELED:
      return "Canceled"
    case BillingStatus.INCOMPLETE:
      return "Incomplete"
    case BillingStatus.INCOMPLETE_EXPIRED:
      return "Expired"
    case BillingStatus.UNPAID:
      return "Unpaid"
    default:
      return "Unknown"
  }
}
