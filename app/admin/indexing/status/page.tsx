"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react"
import { ConnectorStatus } from "@/lib/types/connectors"
import { SourceIcon } from "@/components/admin/connectors/SourceIcon"

// Mock function to fetch connectors - replace with actual API call
const fetchConnectors = async (): Promise<ConnectorStatus[]> => {
  // Simulate API call
  return [
    {
      id: 1,
      name: "Company Google Drive",
      source_type: "google_drive",
      last_synced: "2023-06-15T10:30:00Z",
      last_sync_status: "success",
      document_count: 1250,
      is_up_to_date: true
    },
    {
      id: 2,
      name: "Engineering Slack",
      source_type: "slack",
      last_synced: "2023-06-14T22:15:00Z",
      last_sync_status: "success",
      document_count: 8750,
      is_up_to_date: true
    },
    {
      id: 3,
      name: "Product Notion",
      source_type: "notion",
      last_synced: "2023-06-10T13:45:00Z",
      last_sync_status: "error",
      document_count: 350,
      is_up_to_date: false
    },
    {
      id: 4,
      name: "Development GitHub",
      source_type: "github",
      last_sync_status: "in_progress",
      document_count: 0,
      is_up_to_date: false
    }
  ]
}

export default function ConnectorStatusPage() {
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadConnectors = async () => {
      setIsLoading(true)
      try {
        const data = await fetchConnectors()
        setConnectors(data)
      } catch (error) {
        console.error("Failed to load connectors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConnectors()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="size-3.5 mr-1" />
            Success
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="size-3.5 mr-1" />
            Failed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Loader2 className="size-3.5 mr-1 animate-spin" />
            Syncing
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="size-3.5 mr-1" />
            Not Started
          </Badge>
        )
    }
  }

  return (
    <div className="container max-w-6xl space-y-6">
      <AdminPageTitle
        title="Connector Status"
        icon={<Database className="size-8" />}
      />

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center"
        >
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
        <Button
          onClick={() => router.push("/admin/add-connector")}
          className="flex items-center"
        >
          <Plus className="size-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : connectors.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Documents</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectors.map(connector => (
              <TableRow key={connector.id}>
                <TableCell className="font-medium">{connector.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <SourceIcon
                      sourceType={connector.source_type}
                      iconSize={20}
                      className="mr-2"
                    />
                    <span className="capitalize">
                      {connector.source_type.replace("_", " ")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(connector.last_synced)}</TableCell>
                <TableCell>
                  {getStatusBadge(connector.last_sync_status)}
                </TableCell>
                <TableCell className="text-right">
                  {connector.document_count.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/admin/connectors/${connector.source_type}/${connector.id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No Connectors Yet</h3>
          <p className="text-muted-foreground mb-6">
            Connect your data sources to make them searchable
          </p>
          <Button
            onClick={() => router.push("/admin/add-connector")}
            className="flex items-center mx-auto"
          >
            <Plus className="size-4 mr-2" />
            Add Your First Connector
          </Button>
        </div>
      )}
    </div>
  )
}
