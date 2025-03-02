import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
  children: React.ReactNode
  onOutsideClick?: () => void
  width?: string
  className?: string
  title?: string
}

export const Modal: React.FC<ModalProps> = ({
  children,
  onOutsideClick,
  width = "w-full max-w-md",
  className,
  title
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        onOutsideClick
      ) {
        onOutsideClick()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onOutsideClick])

  // Prevent scroll on mount
  useEffect(() => {
    if (document.body) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "auto"
      }
    }
    return undefined
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" />
      <div
        ref={modalRef}
        className={cn(
          `rounded-lg bg-white shadow-lg dark:bg-neutral-800 ${width}`,
          className
        )}
      >
        {title && (
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
