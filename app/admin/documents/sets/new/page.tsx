"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconBookmark } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { usePopup } from "@/components/admin/connectors/Popup"
import { useConnectorPairs } from "@/app/admin/connectors/hooks"
import { useUsers } from "@/app/admin/users/hooks"
import { useGroups } from "@/app/admin/groups/hooks"
import { DocumentSetCreationForm } from "../DocumentSetCreationForm"
import { refreshDocumentSets } from "../hooks"
import { Button } from "@/components/ui/button"

function Main() {
  const router = useRouter()
  const { popup, setPopup } = usePopup()

  const connectorPairsResult = useConnectorPairs()
  const {
    data: connectorPairs,
    isLoading: isConnectorPairsLoading,
    error: connectorPairsError
  } = connectorPairsResult

  const usersResult = useUsers()
  const { data: users, isLoading: isUsersLoading } = usersResult

  const groupsResult = useGroups()
  const { data: groups, isLoading: isGroupsLoading } = groupsResult

  const isLoading = isConnectorPairsLoading || isUsersLoading || isGroupsLoading

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary animation-delay-200"></div>
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary animation-delay-400"></div>
        </div>
      </div>
    )
  }

  if (connectorPairsError || !connectorPairs) {
    return (
      <div className="py-8 text-center text-destructive">
        <h3 className="text-lg font-medium mb-2">Failed to fetch connectors</h3>
        <p>{connectorPairsError?.toString() || "Unknown error"}</p>
      </div>
    )
  }

  return (
    <>
      {popup}

      <CardSection>
        <DocumentSetCreationForm
          connectorPairs={connectorPairs}
          users={users || []}
          groups={groups || []}
          onClose={() => {
            refreshDocumentSets()
            router.push("/admin/documents/sets")
          }}
          setPopup={setPopup}
        />
      </CardSection>
    </>
  )
}

export default function NewDocumentSetPage() {
  const router = useRouter()

  return (
    <div className="max-w-6xl p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/documents/sets")}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <IconBookmark className="mr-2 h-4 w-4" />
          Back to Document Sets
        </Button>
      </div>

      <AdminPageTitle
        icon={<IconBookmark size={28} />}
        title="New Document Set"
      />

      <Main />
    </div>
  )
}
