"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconUsersGroup } from "@tabler/icons-react"

export default function GroupsPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle icon={<IconUsersGroup size={28} />} title="User Groups" />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Group Management</h2>
        <p className="text-muted-foreground">
          Create and manage user groups to organize users and control access
          permissions.
        </p>
      </CardSection>
    </div>
  )
}
