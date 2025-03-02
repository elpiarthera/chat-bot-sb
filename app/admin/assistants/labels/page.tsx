"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { LabelManagement } from "@/components/admin/assistants/label-management"
import { IconTags } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function AssistantLabelsPage() {
  const router = useRouter()

  return (
    <div className="container max-w-6xl space-y-6">
      <div className="flex flex-col space-y-4">
        <Button
          variant="ghost"
          className="mb-2 w-fit pl-0"
          onClick={() => router.push("/admin/assistants")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Assistants
        </Button>
        <AdminPageTitle
          icon={<IconTags size={28} />}
          title="Manage Assistant Labels"
        />
      </div>

      <CardSection>
        <LabelManagement />
      </CardSection>
    </div>
  )
}
