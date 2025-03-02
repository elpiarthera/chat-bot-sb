"use client"

import { useState, useEffect } from "react"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import {
  IconBookmark,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconCheck,
  IconClock
} from "@tabler/icons-react"
import { useDocumentSets, registerRefreshFunction } from "./hooks"
import { deleteDocumentSet } from "./lib"
import { usePopup } from "@/components/admin/connectors/Popup"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

export default function DocumentSetsPage() {
  const { popup, setPopup } = usePopup()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const {
    data: documentSets,
    isLoading: isDocumentSetsLoading,
    error: documentSetsError,
    refreshDocumentSets
  } = useDocumentSets()

  const {
    data: editableDocumentSets,
    isLoading: isEditableDocumentSetsLoading,
    error: editableDocumentSetsError,
    refreshDocumentSets: refreshEditableDocumentSets
  } = useDocumentSets(true)

  // Register the refresh function for external use
  useEffect(() => {
    registerRefreshFunction(() => {
      refreshDocumentSets()
      refreshEditableDocumentSets()
    })
  }, [refreshDocumentSets, refreshEditableDocumentSets])

  if (isDocumentSetsLoading || isEditableDocumentSetsLoading) {
    return (
      <div className="max-w-6xl p-6">
        <AdminPageTitle
          icon={<IconBookmark size={28} />}
          title="Document Sets"
        />
        <CardSection>
          <div className="py-8 text-center">Loading document sets...</div>
        </CardSection>
      </div>
    )
  }

  if (
    documentSetsError ||
    !documentSets ||
    editableDocumentSetsError ||
    !editableDocumentSets
  ) {
    return (
      <div className="max-w-6xl p-6">
        <AdminPageTitle
          icon={<IconBookmark size={28} />}
          title="Document Sets"
        />
        <CardSection>
          <div className="py-8 text-center text-destructive">
            Error loading document sets. Please try again later.
          </div>
        </CardSection>
      </div>
    )
  }

  // Sort document sets by name
  const sortedDocumentSets = [...documentSets].sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedDocumentSets.length / itemsPerPage)
  const paginatedDocumentSets = sortedDocumentSets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <div className="max-w-6xl p-6">
      <AdminPageTitle icon={<IconBookmark size={28} />} title="Document Sets" />

      {popup}

      <CardSection>
        <p className="mb-6 text-muted-foreground">
          <strong>Document Sets</strong> allow you to group logically connected
          documents into a single bundle. These can then be used as a filter
          when performing searches to control the scope of information the
          system searches over.
        </p>
        <div className="flex mb-6">
          <Link href="/admin/documents/sets/new">
            <Button>New Document Set</Button>
          </Link>
        </div>

        {sortedDocumentSets.length > 0 ? (
          <>
            <Separator className="my-6" />

            <h2 className="text-xl font-semibold mb-4">
              Existing Document Sets
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Connectors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDocumentSets.map(documentSet => {
                  const isEditable = editableDocumentSets.some(
                    eds => eds.id === documentSet.id
                  )

                  return (
                    <TableRow key={documentSet.id}>
                      <TableCell>
                        {isEditable ? (
                          <div
                            className={`
                              flex items-center gap-2 
                              ${documentSet.is_up_to_date ? "cursor-pointer hover:text-primary" : "opacity-50 cursor-not-allowed"}
                            `}
                            onClick={() => {
                              if (documentSet.is_up_to_date) {
                                router.push(
                                  `/admin/documents/sets/${documentSet.id}`
                                )
                              }
                            }}
                            title={
                              !documentSet.is_up_to_date
                                ? "Cannot edit while syncing or deleting"
                                : ""
                            }
                          >
                            <IconEdit className="h-4 w-4" />
                            <span>{documentSet.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {documentSet.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {documentSet.cc_pair_descriptors.length > 0 ? (
                          <div className="space-y-1">
                            {documentSet.cc_pair_descriptors.map(descriptor => (
                              <div key={descriptor.id} className="text-sm">
                                {descriptor.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {documentSet.is_up_to_date ? (
                            <>
                              <IconCheck className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Up to Date</span>
                            </>
                          ) : documentSet.cc_pair_descriptors.length > 0 ? (
                            <>
                              <IconClock className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-500">Syncing</span>
                            </>
                          ) : (
                            <>
                              <IconAlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">Deleting</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {documentSet.is_public ? (
                            <>
                              <IconEye className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Public</span>
                            </>
                          ) : (
                            <>
                              <IconEyeOff className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500">Private</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditable ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              const response = await deleteDocumentSet(
                                documentSet.id as unknown as number
                              )
                              if (response.ok) {
                                setPopup({
                                  message: `Document set "${documentSet.name}" scheduled for deletion`,
                                  type: "success"
                                })
                              } else {
                                const errorData = await response.json()
                                setPopup({
                                  message: `Failed to delete document set: ${errorData.detail || "Unknown error"}`,
                                  type: "error"
                                })
                              }
                              refreshDocumentSets()
                              refreshEditableDocumentSets()
                            }}
                          >
                            Delete
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No document sets found. Create your first document set to get
            started.
          </div>
        )}
      </CardSection>
    </div>
  )
}
