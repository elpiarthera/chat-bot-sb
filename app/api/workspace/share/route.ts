import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { workspaceId, email, role } = json

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

    // Use admin API to find the user by email
    const adminClient = createClient(cookieStore, {
      admin: true
    })

    // Verify the admin client has the service role key
    console.log(
      "Using service role key:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: users, error: usersError } =
      await adminClient.auth.admin.listUsers()

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return new NextResponse("Could not fetch users", { status: 500 })
    }

    const userToShare = users?.users?.find(user => user.email === email)

    if (!userToShare) {
      console.error("User not found with email:", email)
      return new NextResponse("User not found", { status: 404 })
    }

    console.log(
      "Found user in auth database:",
      userToShare.id,
      userToShare.email
    )

    // Instead of looking for a profile, use the auth user ID directly
    const userId = userToShare.id

    // Check if already shared
    const { data: existingShare } = await supabase
      .from("workspace_users")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single()

    if (existingShare) {
      return new NextResponse("Workspace already shared with this user", {
        status: 400
      })
    }

    // Share the workspace directly with auth user ID
    const { data: sharedWorkspace, error } = await supabase
      .from("workspace_users")
      .insert([
        {
          workspace_id: workspaceId,
          user_id: userId,
          role: role || "viewer"
        }
      ])
      .select("*")
      .single()

    if (error) {
      console.error("Error inserting workspace user:", error)
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(sharedWorkspace)
  } catch (error: any) {
    console.error("Workspace sharing error:", error)
    return new NextResponse(error.message, { status: 500 })
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

    // Remove user from workspace
    const { error } = await supabase
      .from("workspace_users")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)

    if (error) {
      return new NextResponse(error.message, { status: 500 })
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
