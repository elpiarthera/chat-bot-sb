import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { customSupabase } from "@/lib/supabase/custom-client"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      )
    }

    // Create a server-side supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Verify authentication
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get workspace users
    const { data: workspaceUsers, error: usersError } = await customSupabase
      .from("workspace_users")
      .select("*")
      .eq("workspace_id", workspaceId)

    if (usersError) {
      console.error("Error fetching workspace users:", usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Check if user has access to this workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .eq("user_id", session.user.id)
      .single()

    const isOwner = !!workspace

    if (!isOwner) {
      // If not owner, check if shared with the user
      const { data: sharedWorkspace } = await customSupabase
        .from("workspace_users")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", session.user.id)
        .single()

      if (!sharedWorkspace) {
        return NextResponse.json(
          { error: "You don't have access to this workspace" },
          { status: 403 }
        )
      }
    }

    // Use server-side admin client if available
    const adminClient = createClient(cookieStore, {
      admin: true
    })

    // Enhanced user information
    const userDetails = await Promise.all(
      workspaceUsers.map(async user => {
        // Default user display information
        let userInfo = {
          ...user,
          email: `user-${user.user_id.substring(0, 8)}`,
          display_name: `User ${user.user_id.substring(0, 8)}`,
          username: `user-${user.user_id.substring(0, 8)}`
        }

        try {
          // Try to get info from auth system if admin access is available
          const { data: userData, error: userError } =
            await adminClient.auth.admin.getUserById(user.user_id)

          if (!userError && userData?.user) {
            userInfo.email = userData.user.email || userInfo.email

            if (userData.user.email) {
              // Use email username as display name if available
              const emailUsername = userData.user.email.split("@")[0]
              userInfo.display_name = emailUsername
              userInfo.username = emailUsername
            }
          }
        } catch (adminError) {
          // Silent fail - admin API might not be available
          console.log("Admin API not available (expected in some environments)")
        }

        return userInfo
      })
    )

    return NextResponse.json(userDetails)
  } catch (error: any) {
    console.error("Error in workspace users API:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
