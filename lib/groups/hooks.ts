import useSWR from "swr"
import { UserGroup } from "@/lib/types/groups"

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  return response.json()
}

export const useUserGroups = () => {
  const { data, error, isLoading, mutate } = useSWR<UserGroup[]>(
    "/api/admin/groups",
    fetcher
  )

  return {
    data,
    isLoading,
    error,
    refreshUserGroups: mutate
  }
}

export const useUsers = () => {
  const { data, error, isLoading } = useSWR("/api/admin/users", fetcher)

  return {
    data,
    isLoading,
    error
  }
}

export const useResources = () => {
  const { data, error, isLoading } = useSWR("/api/admin/resources", fetcher)

  return {
    data,
    isLoading,
    error
  }
}
