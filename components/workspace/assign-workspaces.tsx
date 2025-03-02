import { IconChevronDown, IconCircleCheckFilled } from "@tabler/icons-react"
import {
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
  createContext
} from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { toast } from "sonner"

// Define a simple interface for workspaces
interface Workspace {
  id: string
  name: string
  [key: string]: any
}

// Create a mock context to avoid TypeScript errors
const MockContext = createContext<any>(null)

interface AssignWorkspacesProps {
  selectedWorkspaces: Workspace[]
  onSelectWorkspace: (workspace: Workspace) => void
}

export const AssignWorkspaces: FC<AssignWorkspacesProps> = ({
  selectedWorkspaces,
  onSelectWorkspace
}) => {
  // Use the mock context
  const context = useContext(MockContext)
  const workspaces = context?.workspaces || []
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // Small delay to ensure the input is rendered
    }
  }, [isOpen, inputRef])

  const handleWorkspaceSelect = (workspace: Workspace) => {
    onSelectWorkspace(workspace)
  }

  if (!workspaces) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open: boolean) => {
        setIsOpen(open)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-background w-full justify-start border-2 px-3 py-5"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center">
            <div className="ml-2 flex items-center">
              {selectedWorkspaces.length} workspaces selected
            </div>
          </div>

          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="space-y-2 overflow-auto p-2"
        align="start"
      >
        <Input
          ref={inputRef}
          placeholder="Search workspaces..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.stopPropagation()
          }
        />

        {selectedWorkspaces
          .filter((workspace: Workspace) =>
            workspace.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((workspace: Workspace) => (
            <WorkspaceItem
              key={workspace.id}
              selectedWorkspaces={selectedWorkspaces}
              workspace={workspace}
              selected={true}
              onSelect={handleWorkspaceSelect}
            />
          ))}

        {workspaces
          .filter(
            (workspace: Workspace) =>
              !selectedWorkspaces.some(
                selectedWorkspace => selectedWorkspace.id === workspace.id
              ) && workspace.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((workspace: Workspace) => (
            <WorkspaceItem
              key={workspace.id}
              selectedWorkspaces={selectedWorkspaces}
              workspace={workspace}
              selected={false}
              onSelect={handleWorkspaceSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface WorkspaceItemProps {
  selectedWorkspaces: Workspace[]
  workspace: Workspace
  selected: boolean
  onSelect: (workspace: Workspace) => void
}

const WorkspaceItem: FC<WorkspaceItemProps> = ({
  selectedWorkspaces,
  workspace,
  selected,
  onSelect
}) => {
  const handleSelect = () => {
    if (selected && selectedWorkspaces.length === 1) {
      toast.info("You must select at least one workspace")
      return
    }

    onSelect(workspace)
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-between py-0.5 hover:opacity-50"
      onClick={handleSelect}
    >
      <div className="flex grow items-center truncate">
        <div className="truncate">{workspace.name}</div>
      </div>

      {selected && (
        <IconCircleCheckFilled size={20} className="min-w-[30px] flex-none" />
      )}
    </div>
  )
}
