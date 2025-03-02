/**
 * User utility functions
 */

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

/**
 * Get the current authenticated user
 * @returns The authenticated user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Error fetching user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Failed to get current user:", error)
    return null
  }
}

/**
 * Get user settings by user ID
 * @param userId The user's ID
 * @returns User settings or null if not found
 */
export const getUserSettings = async (userId: string) => {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user settings:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to get user settings:", error)
    return null
  }
}
