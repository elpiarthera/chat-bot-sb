"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconCpu } from "@tabler/icons-react"

export default function LLMConfigurationPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconCpu size={28} />} title="LLM Configuration" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Language Model Settings</h2>
        <p className="text-muted-foreground">
          Configure language model providers and default settings.
        </p>
      </CardSection>
    </div>
  )
}
