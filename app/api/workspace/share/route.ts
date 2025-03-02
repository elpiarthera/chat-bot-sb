import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { customSupabase } from "@/lib/supabase/custom-client"

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { workspaceId, email, role } = json

    if (!workspaceId || !email) {
      return new NextResponse("Missing workspaceId or email", { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Get current session to verify ownership
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse("You must be logged in to share workspaces", {
        status: 401
      })
    }

    // Check if user owns the workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .eq("user_id", session.user.id)
      .single()

    if (!workspace) {
      return new NextResponse(
        "You don't have permission to share this workspace",
        { status: 403 }
      )
    }

    // Use admin API to find the user by email
    const adminClient = createClient(cookieStore, {
      admin: true
    })

    // Verify the admin client has the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse("Server is not configured with admin access", {
        status: 500
      })
    }

    try {
      // Try to find the user with this email
      const { data: users, error: usersError } =
        await adminClient.auth.admin.listUsers()

      if (usersError) {
        console.error("Error accessing admin API:", usersError)
        return new NextResponse("Unable to access user management API", {
          status: 500
        })
      }

      const userToShare = users?.users?.find(user => user.email === email)
      if (!userToShare) {
        return new NextResponse(`No user found with email: ${email}`, {
          status: 404
        })
      }

      console.log(
        "Found user in auth database:",
        userToShare.id,
        userToShare.email
      )

      // Use the auth user ID directly
      const userId = userToShare.id
      // Check if already shared
      const { data: existingShare } = await customSupabase
        .from("workspace_users")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .single()

      if (existingShare) {
        return new NextResponse("Workspace is already shared with this user", {
          status: 400
        })
      }

      // Share the workspace
      const { data: workspaceUser, error: shareError } = await customSupabase
        .from("workspace_users")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role: role || "viewer" // Default to viewer if no role specified
        })
        .select("*")
        .single()

      if (shareError) {
        console.error("Database error while sharing workspace:", shareError)
        return new NextResponse("Error saving workspace share", { status: 500 })
      }

      return NextResponse.json({
        ...workspaceUser,
        email: userToShare.email // Include email in response for UI
      })
    } catch (adminError) {
      console.error("Error with admin operations:", adminError)
      return new NextResponse("Error performing user lookup", { status: 500 })
    }
  } catch (error: any) {
    console.error("Workspace sharing error:", error)
    return new NextResponse(error.message || "An unexpected error occurred", {
      status: 500
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    const userId = searchParams.get("userId")
    if (!workspaceId || !userId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Get current session to verify ownership
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user owns the workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .eq("user_id", session.user.id)
      .single()

    if (!workspace) {
      return new NextResponse("You don't own this workspace", { status: 403 })
    }

    // Check if the user is shared to the workspace
    const { data: existingShare } = await customSupabase
      .from("workspace_users")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single()

    if (!existingShare) {
      return new NextResponse("Workspace not shared with this user", {
        status: 400
      })
    }

    // Delete the share
    const { error: deleteError } = await customSupabase
      .from("workspace_users")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)

    if (deleteError) {
      return new NextResponse(deleteError.message, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Remove user error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json()
    const { workspaceId, userId, role } = json

    if (!workspaceId || !userId || !role) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // Get current session to verify ownership
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user owns the workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .eq("user_id", session.user.id)
      .single()

    if (!workspace) {
      return new NextResponse("You don't own this workspace", { status: 403 })
    }

    // Update user role
    const { data, error } = await supabase
      .from("workspace_users")
      .update({ role })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .select("*")
      .single()

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Update role error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
