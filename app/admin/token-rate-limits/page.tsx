"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconGauge } from "@tabler/icons-react"

export default function TokenRateLimitsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconGauge size={28} />}
        title="Token Rate Limits"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Configure Rate Limits</h2>
        <p className="text-muted-foreground">
          Set usage limits for AI models to control costs and prevent abuse.
        </p>
      </CardSection>
    </div>
  )
}
