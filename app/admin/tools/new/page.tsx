"use client"

import { ToolEditor } from "@/app/admin/tools/ToolEditor"
import { BackButton } from "@/components/utility/BackButton"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { ToolIcon } from "@/components/icons/icons"
import { CardSection } from "@/components/admin/card-section"

export default function NewToolPage() {
  return (
    <div className="max-w-4xl p-6">
      <BackButton href="/admin/tools" />

      <AdminPageTitle icon={<ToolIcon size={28} />} title="Create Tool" />

      <CardSection>
        <ToolEditor />
      </CardSection>
    </div>
  )
}
