"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconBookmark } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { usePopup } from "@/components/admin/connectors/Popup"
import { useConnectorPairs } from "@/app/admin/connectors/hooks"
import { useUsers } from "@/app/admin/users/hooks"
import { useGroups } from "@/app/admin/groups/hooks"
import { DocumentSet, refreshDocumentSets, useDocumentSets } from "../hooks"
import { DocumentSetCreationForm } from "../DocumentSetCreationForm"

interface DocumentSetWithId extends DocumentSet {
  id: string
}

function Main({ documentSetId }: { documentSetId: string }) {
  const router = useRouter()
  const { popup, setPopup } = usePopup()

  const documentSetsResult = useDocumentSets()
  const {
    data: documentSets,
    isLoading: isDocumentSetsLoading,
    error: documentSetsError
  } = documentSetsResult

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

  const isLoading =
    isDocumentSetsLoading ||
    isConnectorPairsLoading ||
    isUsersLoading ||
    isGroupsLoading

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

  if (documentSetsError || !documentSets) {
    return (
      <div className="py-8 text-center text-destructive">
        <h3 className="text-lg font-medium mb-2">
          Failed to fetch document sets
        </h3>
        <p>{documentSetsError?.toString() || "Unknown error"}</p>
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

  const documentSet = documentSets.find(
    (set: DocumentSetWithId) => set.id === documentSetId
  )

  if (!documentSet) {
    return (
      <div className="py-8 text-center text-destructive">
        <h3 className="text-lg font-medium mb-2">Document set not found</h3>
        <p>Document set with ID {documentSetId} was not found</p>
      </div>
    )
  }

  return (
    <div>
      {popup}

      <AdminPageTitle
        icon={<IconBookmark size={28} />}
        title={`Edit Document Set: ${documentSet.name}`}
      />

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
          existingDocumentSet={documentSet}
        />
      </CardSection>
    </div>
  )
}

export default function EditDocumentSetPage({
  params
}: {
  params: { id: string }
}) {
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

      <Main documentSetId={params.id} />
    </div>
  )
}
