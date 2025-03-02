"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentFeedbackTable } from "./DocumentFeedbackTable"
import { numToDisplay } from "./constants"
import { fetchDocuments } from "../lib"
import { DocumentBoostStatus } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Document Feedback page component
 * Displays the most liked and disliked documents
 */
export default function DocumentFeedbackPage() {
  const [mostLikedDocuments, setMostLikedDocuments] = useState<
    DocumentBoostStatus[]
  >([])
  const [mostDislikedDocuments, setMostDislikedDocuments] = useState<
    DocumentBoostStatus[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch most liked documents
      const likedResponse = await fetchDocuments({
        sort_by: "boost",
        sort_order: "desc",
        limit: numToDisplay
      })
      setMostLikedDocuments(likedResponse.documents || [])

      // Fetch most disliked documents
      const dislikedResponse = await fetchDocuments({
        sort_by: "boost",
        sort_order: "asc",
        limit: numToDisplay
      })
      setMostDislikedDocuments(dislikedResponse.documents || [])
    } catch (err) {
      console.error("Error fetching document feedback:", err)
      setError("Failed to load document feedback. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbackData()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Feedback</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Document Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="most-liked">
              <TabsList className="mb-4">
                <TabsTrigger value="most-liked">Most Liked</TabsTrigger>
                <TabsTrigger value="most-disliked">Most Disliked</TabsTrigger>
              </TabsList>

              <TabsContent value="most-liked">
                <DocumentFeedbackTable
                  documents={mostLikedDocuments}
                  refresh={fetchFeedbackData}
                />
              </TabsContent>

              <TabsContent value="most-disliked">
                <DocumentFeedbackTable
                  documents={mostDislikedDocuments}
                  refresh={fetchFeedbackData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
