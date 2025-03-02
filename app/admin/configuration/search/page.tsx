"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconSearch } from "@tabler/icons-react"

export default function SearchConfigurationPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconSearch size={28} />} title="Search Settings" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Search Configuration</h2>
        <p className="text-muted-foreground">
          Configure search behavior, indexing, and retrieval settings.
        </p>
      </CardSection>
    </div>
  )
}
