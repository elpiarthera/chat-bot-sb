"use client"

import { Separator } from "@/components/ui/separator"
import { FC, ReactNode } from "react"

interface AdminPageTitleProps {
  icon: ReactNode
  title: string | ReactNode
  farRightElement?: ReactNode
  includeDivider?: boolean
}

export const AdminPageTitle: FC<AdminPageTitleProps> = ({
  icon,
  title,
  farRightElement,
  includeDivider = true
}) => {
  return (
    <>
      <div className="mb-6 w-full">
        <div className="flex w-full items-center py-2">
          <h1 className="flex items-center gap-x-2 text-3xl font-bold">
            {icon} {title}
          </h1>
          {farRightElement && <div className="ml-auto">{farRightElement}</div>}
        </div>
      </div>
      {includeDivider ? (
        <Separator className="my-4" />
      ) : (
        <div className="mb-4" />
      )}
    </>
  )
}
