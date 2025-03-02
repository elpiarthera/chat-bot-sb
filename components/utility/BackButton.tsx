import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  href?: string
  className?: string
}

export function BackButton({ href, className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`mb-4 gap-1 pl-0 hover:bg-transparent hover:pl-0 ${className}`}
      onClick={handleClick}
    >
      <IconArrowLeft size={16} className="mr-1" />
      Back
    </Button>
  )
}
