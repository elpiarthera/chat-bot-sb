"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconInfoCircle } from "@tabler/icons-react"

export default function SystemInfoPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconInfoCircle size={28} />}
        title="System Information"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">System Status</h2>
        <p className="text-muted-foreground">
          View detailed information about your system configuration and server
          status.
        </p>
      </CardSection>
    </div>
  )
}
