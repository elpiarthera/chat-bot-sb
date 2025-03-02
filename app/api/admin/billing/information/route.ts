import { NextResponse } from "next/server"
import { BillingInformation, BillingStatus } from "@/lib/types/billing"
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"

export async function GET() {
  try {
    // In a real implementation, you would fetch this from your payment provider API
    // (Stripe, Paddle, etc.)

    // For development, return mock data based on feature flag
    const mockBillingInfo: BillingInformation = {
      status: SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED
        ? BillingStatus.ACTIVE
        : BillingStatus.CANCELED,
      product_name: "Enterprise Plan",
      price_amount: 49.99,
      price_interval: "month",
      current_period_start: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      cancel_at_period_end: false,
      trial_end: null,
      trial_start: null,
      payment_method_enabled: true,
      subscription_id: "sub_mock123456",
      seats: 5,
      canceled_at: null
    }

    return NextResponse.json(mockBillingInfo)
  } catch (error) {
    console.error("Error fetching billing information:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    )
  }
}
