"use client"

import React, { useState } from "react"
import { Settings } from "lucide-react"

interface CollapsibleSectionProps {
  children: React.ReactNode
  prompt?: string
  className?: string
}

export function CollapsibleSection({
  children,
  prompt,
  className = ""
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  const toggleCollapse = (e?: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle if the click is on the border or settings icon
    if (
      !e ||
      e.currentTarget === e.target ||
      (e.target as HTMLElement).classList.contains("collapse-toggle")
    ) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div
      className={`relative ${isCollapsed ? "h-8" : ""} ${className}`}
      style={{ transition: "height 0.3s ease-out" }}
    >
      <div
        className={`
          cursor-pointer
          ${isCollapsed ? "h-8" : "border-muted border-l-2 pl-6"}
        `}
        onClick={toggleCollapse}
      >
        {isCollapsed ? (
          <span className="collapse-toggle absolute left-0 top-0 flex cursor-pointer items-center gap-x-3 text-sm">
            <Settings className="collapse-toggle pointer-events-none size-4" />
            <span className="collapse-toggle">{prompt}</span>
          </span>
        ) : (
          <>{children}</>
        )}
      </div>
    </div>
  )
}
