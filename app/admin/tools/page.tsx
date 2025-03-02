"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconTools } from "@tabler/icons-react"

export default function ToolsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconTools size={28} />} title="AI Tools" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Tool Management</h2>
        <p className="text-muted-foreground">
          Configure tools that AI assistants can use to perform tasks and access
          external systems.
        </p>
      </CardSection>
    </div>
  )
}
