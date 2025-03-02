"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export function SectionHeader({
  children,
  includeMargin = true
}: {
  children: React.ReactNode
  includeMargin?: boolean
}) {
  return (
    <div className={`text-xl font-semibold ${includeMargin ? "mb-4" : ""}`}>
      {children}
    </div>
  )
}

export function HidableSection({
  children,
  sectionTitle,
  defaultHidden = false,
  className = ""
}: {
  children: React.ReactNode
  sectionTitle: React.ReactNode
  defaultHidden?: boolean
  className?: string
}) {
  const [isHidden, setIsHidden] = useState(defaultHidden)

  return (
    <div className={className}>
      <div
        className="hover:bg-accent/20 flex cursor-pointer items-center rounded p-2"
        onClick={() => setIsHidden(!isHidden)}
      >
        <SectionHeader includeMargin={false}>{sectionTitle}</SectionHeader>
        <div className="my-auto ml-auto p-1">
          {isHidden ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </div>
      </div>

      {!isHidden && <div className="mx-2 mt-4 space-y-4">{children}</div>}
    </div>
  )
}
