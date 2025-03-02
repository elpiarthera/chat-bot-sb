"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconTemplate } from "@tabler/icons-react"

export default function StandardAnswerPage() {
  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconTemplate size={28} />}
        title="Standard Answers"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Manage Standard Answers</h2>
        <p className="text-muted-foreground">
          Create and manage pre-approved responses that can be used for common
          questions.
        </p>
      </CardSection>
    </div>
  )
}
