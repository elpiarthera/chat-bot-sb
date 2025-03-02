"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { AssistantSectionsExample } from "@/components/admin/assistants/assistant-sections-example"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { IconLayout2 } from "@tabler/icons-react"

export default function UIExamplesPage() {
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
          icon={<IconLayout2 size={28} />}
          title="UI Component Examples"
        />
      </div>

      <CardSection>
        <AssistantSectionsExample />
      </CardSection>
    </div>
  )
}
