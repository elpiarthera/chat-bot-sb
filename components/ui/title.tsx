import React, { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const Title: React.FC<TitleProps> = ({
  children,
  className = "",
  level = 2,
  ...props
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
  const baseStyles = "font-bold text-foreground"
  const sizeStyles = {
    1: "text-4xl mb-6",
    2: "text-2xl mb-4",
    3: "text-xl mb-3",
    4: "text-lg mb-2",
    5: "text-base mb-2",
    6: "text-sm mb-1"
  }

  return React.createElement(
    HeadingTag,
    {
      className: cn(baseStyles, sizeStyles[level], className),
      ...props
    },
    children
  )
}

export default Title
