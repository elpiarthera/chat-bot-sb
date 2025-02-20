import { FC, useState } from "react"
import { Tables } from "@/supabase/types"
import { Input } from "../ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react"
import { Button } from "../ui/button"

interface PresetSelectProps {
  presets: Tables<"presets">[]
  selectedPreset: Tables<"presets"> | null
  onPresetSelect: (preset: Tables<"presets"> | null) => void
}

export const PresetSelect: FC<PresetSelectProps> = ({
  presets,
  selectedPreset,
  onPresetSelect
}) => {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selectedPreset ? (
            <div className="flex items-center gap-2">
              <span>{selectedPreset.name}</span>
              <IconX
                size={16}
                className="cursor-pointer hover:opacity-50"
                onClick={e => {
                  e.stopPropagation()
                  onPresetSelect(null)
                }}
              />
            </div>
          ) : (
            "Select Preset"
          )}
          <IconChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[200px] p-2">
        <Input
          placeholder="Search presets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-[300px] overflow-auto">
          {filteredPresets.map(preset => (
            <div
              key={preset.id}
              className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                onPresetSelect(preset)
                setIsOpen(false)
              }}
            >
              <span>{preset.name}</span>
              {selectedPreset?.id === preset.id && <IconCheck size={16} />}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
