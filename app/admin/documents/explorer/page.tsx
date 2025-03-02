"use client"

import { useEffect, useState } from "react"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconFileSearch, IconEye, IconEyeOff } from "@tabler/icons-react"
import { getDocuments, updateHiddenStatus } from "../lib"
import { ScoreSection } from "../ScoreEditor"
import {
  usePopup,
  PopupSpec,
  PopupType
} from "@/components/admin/connectors/Popup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

interface Document {
  id: string
  name: string
  boost: number
  hidden: boolean
  created_at: string
  updated_at: string
  type: string
  size: number
}

export default function DocumentExplorerPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { popup, setPopup } = usePopup()

  // Create a wrapper function for setPopup that matches the expected type in ScoreSection
  const handleSetPopup = (popupSpec: PopupSpec | null) => {
    if (popupSpec) {
      setPopup(popupSpec)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await getDocuments(currentPage, 10, {
        search: searchQuery || undefined
      })
      setDocuments(response.data)
      setTotalPages(Math.ceil(response.total / 10))
    } catch (error) {
      console.error("Error fetching documents:", error)
      setPopup({
        message: "Failed to fetch documents",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleToggleHidden = async (
    documentId: string,
    currentHiddenStatus: boolean
  ) => {
    try {
      const response = await updateHiddenStatus(
        documentId,
        !currentHiddenStatus
      )
      if (response.ok) {
        setPopup({
          message: `Document ${!currentHiddenStatus ? "hidden" : "unhidden"} successfully`,
          type: "success"
        })
        fetchDocuments()
      } else {
        const errorData = await response.json()
        setPopup({
          message: errorData.message || "Failed to update document visibility",
          type: "error"
        })
      }
    } catch (error) {
      console.error("Error updating document visibility:", error)
      setPopup({
        message: "An error occurred while updating document visibility",
        type: "error"
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-6xl p-6">
      <AdminPageTitle
        icon={<IconFileSearch size={28} />}
        title="Document Explorer"
      />

      {popup}

      <CardSection>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Browse Documents</h2>
          <div className="w-1/3">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No documents found. Try adjusting your search criteria.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      <ScoreSection
                        documentId={doc.id}
                        initialScore={doc.boost}
                        setPopup={handleSetPopup}
                        refresh={fetchDocuments}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleHidden(doc.id, doc.hidden)}
                        title={doc.hidden ? "Unhide document" : "Hide document"}
                      >
                        {doc.hidden ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardSection>
    </div>
  )
}
