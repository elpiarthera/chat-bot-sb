"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconCreditCard } from "@tabler/icons-react"

export default function BillingPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconCreditCard size={28} />}
        title="Billing & Subscription"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Manage Subscription</h2>
        <p className="text-muted-foreground">
          View billing information, update payment methods, and manage your
          subscription plan.
        </p>
      </CardSection>
    </div>
  )
}
