import React, { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string
  small?: boolean
  subtext?: string
}

const Text: React.FC<TextProps> = ({
  children,
  className = "",
  small = false,
  subtext,
  ...props
}) => {
  return (
    <div>
      <p
        className={cn(
          "text-foreground",
          small ? "text-sm" : "text-base",
          className
        )}
        {...props}
      >
        {children}
      </p>
      {subtext && (
        <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  )
}

export default Text
