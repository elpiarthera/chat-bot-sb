import { useState, useEffect } from "react"
import { PopupSpec } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Database } from "lucide-react"

interface Connector {
  id: string
  name: string
  type: string
  status: "active" | "inactive" | "pending"
}

interface ConnectorSelectorProps {
  availableConnectors: Connector[]
  selectedConnectorIds: string[]
  onSelectConnector: (connectorId: string) => void
  onRemoveConnector: (connectorId: string) => void
  setPopup?: (popup: PopupSpec) => void
  readOnly?: boolean
  title?: string
}

export function ConnectorSelector({
  availableConnectors,
  selectedConnectorIds,
  onSelectConnector,
  onRemoveConnector,
  setPopup,
  readOnly = false,
  title = "Data Connectors"
}: ConnectorSelectorProps) {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("")
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([])

  // Get selected connectors
  const selectedConnectors = availableConnectors.filter(connector =>
    selectedConnectorIds.includes(connector.id)
  )

  // Update filtered connectors when available or selected connectors change
  useEffect(() => {
    const filtered = availableConnectors.filter(
      connector => !selectedConnectorIds.includes(connector.id)
    )
    setFilteredConnectors(filtered)

    // Reset selected connector if it's no longer in the filtered list
    if (
      selectedConnectorId &&
      !filtered.some(c => c.id === selectedConnectorId)
    ) {
      setSelectedConnectorId("")
    }
  }, [availableConnectors, selectedConnectorIds, selectedConnectorId])

  const handleAddConnector = () => {
    if (!selectedConnectorId) {
      if (setPopup) {
        setPopup({
          message: "Please select a connector to add",
          type: "error"
        })
      }
      return
    }

    try {
      onSelectConnector(selectedConnectorId)
      setSelectedConnectorId("")
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to add connector: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  const handleRemoveConnector = (connectorId: string) => {
    try {
      onRemoveConnector(connectorId)
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to remove connector: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  const getConnectorStatusBadge = (status: Connector["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="ml-2">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="ml-2">
            Inactive
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="ml-2">
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>{title}</Label>
        {!readOnly && (
          <div className="flex space-x-2 mt-1">
            <Select
              value={selectedConnectorId}
              onValueChange={setSelectedConnectorId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a connector" />
              </SelectTrigger>
              <SelectContent>
                {filteredConnectors.length === 0 ? (
                  <SelectItem value="no-results" disabled>
                    No connectors available
                  </SelectItem>
                ) : (
                  filteredConnectors.map(connector => (
                    <SelectItem key={connector.id} value={connector.id}>
                      <div className="flex items-center">
                        <Database className="mr-2 h-4 w-4" />
                        <span>{connector.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({connector.type})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddConnector}
              disabled={!selectedConnectorId || filteredConnectors.length === 0}
            >
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Selected connectors */}
      <div className="space-y-2">
        {selectedConnectors.length > 0 ? (
          <div className="space-y-2">
            {selectedConnectors.map(connector => (
              <div
                key={connector.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  <span className="font-medium">{connector.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({connector.type})
                  </span>
                  {getConnectorStatusBadge(connector.status)}
                </div>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveConnector(connector.id)}
                    aria-label={`Remove ${connector.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No connectors selected
          </p>
        )}
      </div>
    </div>
  )
}
