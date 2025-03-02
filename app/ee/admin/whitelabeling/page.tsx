"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconPalette } from "@tabler/icons-react"

export default function WhitelabelingPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconPalette size={28} />} title="Whitelabeling" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Customize Appearance</h2>
        <p className="text-muted-foreground">
          Configure custom branding, colors, logos, and domain settings for your
          deployment.
        </p>
      </CardSection>
    </div>
  )
}
