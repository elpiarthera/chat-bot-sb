import React, { ReactNode } from "react"

interface CardSectionProps {
  children: ReactNode
  className?: string
}

const CardSection: React.FC<CardSectionProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}

export default CardSection
