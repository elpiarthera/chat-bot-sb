import React from "react"

interface InfoItemProps {
  title: string
  value: React.ReactNode
  className?: string
}

export function InfoItem({ title, value, className = "" }: InfoItemProps) {
  return (
    <div className={`bg-muted rounded-lg p-4 ${className}`}>
      <p className="text-muted-foreground mb-1 text-sm font-medium">{title}</p>
      <p className="text-foreground text-lg font-semibold dark:text-white">
        {value}
      </p>
    </div>
  )
}
