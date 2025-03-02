"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconHistory } from "@tabler/icons-react"

export default function QueryHistoryPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconHistory size={28} />} title="Query History" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Historical Queries</h2>
        <p className="text-muted-foreground">
          Browse and analyze historical user queries and AI responses for
          quality assurance and improvement.
        </p>
      </CardSection>
    </div>
  )
}
