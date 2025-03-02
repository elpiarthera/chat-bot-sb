"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconBrandSlack } from "@tabler/icons-react"

export default function BotsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconBrandSlack size={28} />} title="Slack Bots" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">
          Manage Slack Integrations
        </h2>
        <p className="text-muted-foreground">
          Configure and deploy AI assistants as Slack bots for team access.
        </p>
      </CardSection>
    </div>
  )
}
