import useSWR, { mutate } from "swr"
import { BillingInformation } from "@/lib/types/billing"

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch billing information")
  }
  return response.json()
}

export const useBillingInformation = () => {
  const url = "/api/admin/billing/information"
  const swrResponse = useSWR<BillingInformation>(url, fetcher)

  return {
    ...swrResponse,
    refreshBillingInformation: () => mutate(url)
  }
}

export const fetchCustomerPortal = async () => {
  return fetch("/api/admin/billing/customer-portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export const updateSubscriptionQuantity = async (seats: number) => {
  return fetch("/api/admin/billing/update-seats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ quantity: seats })
  })
}
