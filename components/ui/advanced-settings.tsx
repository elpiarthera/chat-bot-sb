"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

interface AdvancedSettingsProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  children,
  defaultOpen = false
}) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center text-xs text-muted-foreground hover:text-foreground">
          Advanced Settings
          <ChevronDown className="ml-1 h-3 w-3" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  )
}
