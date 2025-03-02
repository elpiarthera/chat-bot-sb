"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import { IconCreditCard } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export default function BillingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Add error handling to detect potential auth issues
    const checkAuth = async () => {
      try {
        setLoading(true)
        // Optional: Add an API call here to verify authentication specifically for enterprise features
        // const response = await fetch('/api/admin/enterprise/check-access')
        // if (!response.ok) throw new Error('Enterprise access check failed')

        setLoading(false)
      } catch (err) {
        console.error("Enterprise feature access error:", err)
        setError(
          "Error accessing enterprise features. Please check your permissions."
        )
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Empty dependency array since checkAuth is defined inside the effect

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">
            Loading enterprise features...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl p-6">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="font-medium text-red-800 dark:text-red-400">
            Authentication Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <a href="/admin" className="mt-2 inline-block text-sm underline">
            Return to admin dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl p-6">
      <AdminPageTitle
        icon={<IconCreditCard size={28} />}
        title="Billing & Subscription"
      />

      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">Manage Subscription</h2>
        <p className="text-muted-foreground">
          View billing information, update payment methods, and manage your
          subscription plan.
        </p>
      </CardSection>
    </div>
  )
}
