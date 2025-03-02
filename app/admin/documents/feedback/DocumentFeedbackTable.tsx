"use client"

import { useState } from "react"
import { usePopup } from "@/components/admin/connectors/Popup"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { numToDisplay } from "./constants"
import { FiEye, FiEyeOff, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { updateHiddenStatus } from "../lib"
import { DocumentBoostStatus } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { ScoreEditor } from "../ScoreEditor"

interface IsVisibleSectionProps {
  document: DocumentBoostStatus
  onUpdate: (response: Response) => void
}

const IsVisibleSection = ({ document, onUpdate }: IsVisibleSectionProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {document.hidden ? (
          <div
            onClick={async () => {
              const response = await updateHiddenStatus(
                document.document_id,
                false
              )
              onUpdate(response)
            }}
            className="flex text-destructive cursor-pointer hover:bg-accent py-1 px-2 w-fit rounded-full"
          >
            <div className="select-none">Hidden</div>
            <div className="ml-1 my-auto">
              <Checkbox checked={false} />
            </div>
          </div>
        ) : (
          <div
            onClick={async () => {
              const response = await updateHiddenStatus(
                document.document_id,
                true
              )
              onUpdate(response)
            }}
            className="flex cursor-pointer hover:bg-accent py-1 px-2 w-fit rounded-full"
          >
            <div className="my-auto select-none">Visible</div>
            <div className="ml-1 my-auto">
              <Checkbox checked={true} />
            </div>
          </div>
        )}
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-auto p-2">
        <div className="text-xs">
          {document.hidden ? (
            <div className="flex">
              <FiEye className="my-auto mr-1" /> Unhide
            </div>
          ) : (
            <div className="flex">
              <FiEyeOff className="my-auto mr-1" />
              Hide
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

interface DocumentFeedbackTableProps {
  documents: DocumentBoostStatus[]
  refresh: () => void
}

export const DocumentFeedbackTable = ({
  documents,
  refresh
}: DocumentFeedbackTableProps) => {
  const [page, setPage] = useState(1)
  const { popup, setPopup } = usePopup()

  const totalPages = Math.ceil(documents.length / numToDisplay)
  const startIndex = (page - 1) * numToDisplay
  const endIndex = Math.min(startIndex + numToDisplay, documents.length)
  const displayedDocuments = documents.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div>
      {popup}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedDocuments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            displayedDocuments.map(document => (
              <TableRow key={document.document_id}>
                <TableCell className="font-medium">{document.name}</TableCell>
                <TableCell>
                  <IsVisibleSection
                    document={document}
                    onUpdate={async response => {
                      if (response.ok) {
                        refresh()
                      } else {
                        const errorData = await response.json()
                        setPopup({
                          message: `Error updating hidden status: ${errorData.detail || "Unknown error"}`,
                          type: "error"
                        })
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ScoreEditor
                    documentId={document.document_id}
                    initialScore={document.boost || 0}
                    onScoreUpdate={refresh}
                    setPopup={setPopup}
                    consistentWidth={true}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
