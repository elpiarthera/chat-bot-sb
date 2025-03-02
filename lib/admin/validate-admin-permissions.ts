import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function validateAdminPermissions() {
  try {
    // Create a Supabase client for server-side operations
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Get the current authenticated user
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        isAdmin: false,
        redirectPath: "/login"
      }
    }

    // Get user profile to check if they have admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    // Check if user has admin role
    const isAdmin = profile?.role === "admin"
    return {
      isAdmin,
      redirectPath: isAdmin ? "" : "/"
    }
  } catch (error) {
    console.error("Error validating admin permissions:", error)

    return {
      isAdmin: false,
      redirectPath: "/"
    }
  }
}
