"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconChartBar } from "@tabler/icons-react"

export default function UsageAnalyticsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconChartBar size={28} />}
        title="Usage Analytics"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Usage Statistics</h2>
        <p className="text-muted-foreground">
          View detailed analytics on system usage, token consumption, and user
          activity.
        </p>
      </CardSection>
    </div>
  )
}
