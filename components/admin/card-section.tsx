import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CardSectionProps {
  children: ReactNode
  className?: string
}

export const CardSection = ({ children, className }: CardSectionProps) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  )
}
