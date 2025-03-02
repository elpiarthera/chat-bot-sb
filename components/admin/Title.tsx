import React, { ReactNode } from "react"
import Title from "../ui/title"
import Text from "../ui/text"

interface AdminPageTitleProps {
  title: string
  description?: string
  icon?: ReactNode
}

export const AdminPageTitle: React.FC<AdminPageTitleProps> = ({
  title,
  description,
  icon
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-primary">{icon}</div>}
        <Title className="!text-3xl !m-0">{title}</Title>
      </div>
      {description && (
        <Text className="text-muted-foreground max-w-2xl">{description}</Text>
      )}
    </div>
  )
}
