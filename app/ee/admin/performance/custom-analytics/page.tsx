"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconChartLine } from "@tabler/icons-react"

export default function CustomAnalyticsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconChartLine size={28} />}
        title="Custom Analytics"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Custom Reports</h2>
        <p className="text-muted-foreground">
          Create and configure custom analytics dashboards and reports.
        </p>
      </CardSection>
    </div>
  )
}
