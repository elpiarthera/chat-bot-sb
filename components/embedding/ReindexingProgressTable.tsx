import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table"
import { Badge } from "../ui/badge"
import { formatDate } from "../../lib/utils"

interface ConnectorIndexingStatus<T, U> {
  connector_id: string
  connector?: {
    name: string
    id: string
  }
  latest_index_attempt?: {
    status: string
    started_at?: string
    completed_at?: string
    num_docs_indexed?: number
  }
}

interface ReindexingProgressTableProps {
  reindexingProgress: ConnectorIndexingStatus<any, any>[]
}

export const ReindexingProgressTable: React.FC<
  ReindexingProgressTableProps
> = ({ reindexingProgress }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Success
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            In Progress
          </Badge>
        )
      case "not_started":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Not Started
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Failed
          </Badge>
        )
      case "canceled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Canceled
          </Badge>
        )
      case "completed_with_errors":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            Completed with Errors
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Connector</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Documents Indexed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reindexingProgress.map(item => (
            <TableRow key={item.connector_id}>
              <TableCell className="font-medium">
                {item.connector?.name || item.connector_id}
              </TableCell>
              <TableCell>
                {getStatusBadge(
                  item.latest_index_attempt?.status || "not_started"
                )}
              </TableCell>
              <TableCell>
                {item.latest_index_attempt?.started_at
                  ? formatDate(item.latest_index_attempt.started_at)
                  : "Not started"}
              </TableCell>
              <TableCell>
                {item.latest_index_attempt?.completed_at
                  ? formatDate(item.latest_index_attempt.completed_at)
                  : "-"}
              </TableCell>
              <TableCell>
                {item.latest_index_attempt?.num_docs_indexed !== undefined
                  ? item.latest_index_attempt.num_docs_indexed
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
