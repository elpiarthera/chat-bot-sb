import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function EnterpriseLayout({
  children
}: {
  children: React.ReactNode
}) {
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-2xl font-bold text-red-500">
          Enterprise Feature
        </div>
        <p className="mb-6 max-w-md text-neutral-600 dark:text-neutral-400">
          This functionality is only available in the Enterprise Edition.
          Contact sales to upgrade your plan.
        </p>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link href="/admin">Return to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/contact-sales">Contact Sales</Link>
          </Button>
        </div>
      </div>
    )
  }

  return children
}
