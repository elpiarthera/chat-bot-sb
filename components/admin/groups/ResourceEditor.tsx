import { useState, useEffect } from "react"
import { PopupSpec } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, X } from "lucide-react"

interface Resource {
  id: string
  name: string
  type: string
}

interface ResourceEditorProps {
  resources: Resource[]
  selectedResources: Resource[]
  onAddResource: (resource: Resource) => void
  onRemoveResource: (resource: Resource) => void
  setPopup?: (popup: PopupSpec) => void
  readOnly?: boolean
  title?: string
  resourceType?: string
}

export function ResourceEditor({
  resources,
  selectedResources,
  onAddResource,
  onRemoveResource,
  setPopup,
  readOnly = false,
  title = "Resources",
  resourceType
}: ResourceEditorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])

  // Filter resources based on search term, type, and exclude already selected resources
  useEffect(() => {
    const filtered = resources.filter(
      resource =>
        !selectedResources.some(
          selectedResource => selectedResource.id === resource.id
        ) &&
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!resourceType || resource.type === resourceType)
    )
    setFilteredResources(filtered)
  }, [resources, selectedResources, searchTerm, resourceType])

  const handleAddResource = (resource: Resource) => {
    try {
      onAddResource(resource)
      setSearchTerm("")
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to add resource: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  const handleRemoveResource = (resource: Resource) => {
    try {
      onRemoveResource(resource)
    } catch (error) {
      if (setPopup) {
        setPopup({
          message: `Failed to remove resource: ${error instanceof Error ? error.message : String(error)}`,
          type: "error"
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="resource-search">{title}</Label>
        {!readOnly && (
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="resource-search"
              placeholder="Search resources..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Selected resources */}
      <div className="space-y-2">
        {selectedResources.length > 0 ? (
          <div className="space-y-2">
            {selectedResources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center">
                  <span className="font-medium">{resource.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({resource.type})
                  </span>
                </div>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveResource(resource)}
                    aria-label={`Remove ${resource.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resources selected</p>
        )}
      </div>

      {/* Resource search results */}
      {!readOnly && searchTerm && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-md border">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center justify-between border-b p-2 last:border-0 hover:bg-muted"
              >
                <div className="flex items-center">
                  <span className="font-medium">{resource.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({resource.type})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddResource(resource)}
                  aria-label={`Add ${resource.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              No matching resources found
            </p>
          )}
        </div>
      )}
    </div>
  )
}
