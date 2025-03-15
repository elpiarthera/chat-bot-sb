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

    // Replace the auth.users query with a call to our custom function
    const { data: user, error: userError } = await supabase.rpc(
      "get_user_by_email",
      { email_param: email }
    )

    console.log("Function lookup result:", {
      email,
      found: !!user?.[0],
      user: user?.[0],
      error: userError
    })

    if (!user || user.length === 0) {
      console.error("No user found with email:", email)
      return new NextResponse(
        `User not found with email: ${email}. They must register an account first.`,
        { status: 404 }
      )
    }

    // Use the user ID from the function result
    const userId = user[0].id

    // Now get their profile with the user_id we found
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("user_id", userId)
      .single()

    if (profileError || !userProfile) {
      console.error("Error finding user profile:", profileError)
      return new NextResponse("User has an account but no profile was found.", {
        status: 404
      })
    }

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
        user_id: userId, // Use the correct user ID
        role: role || "viewer" // Default to viewer
      })
      .select("*")
      .single()

    if (shareError) {
      console.error("Database error while sharing workspace:", shareError)
      return new NextResponse("Error saving workspace share", { status: 500 })
    }

    return NextResponse.json({
      ...workspaceUser,
      email: email // Just use the email from the original request
    })
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

    // Check if the user to remove exists.
    const { data: userToRemove, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (userError || !userToRemove) {
      return new NextResponse("User to remove not found", { status: 404 })
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

    // Check if the user to update exists.
    const { data: userToUpdate, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (userError || !userToUpdate) {
      return new NextResponse("User to update not found", { status: 404 })
    }
    // Update user role
    const { data, error } = await customSupabase
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
