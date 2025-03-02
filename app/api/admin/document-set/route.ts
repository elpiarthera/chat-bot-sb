import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * API route for fetching document sets
 * GET /api/admin/document-set
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin status
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const getEditable = url.searchParams.get("get_editable") === "true"

    // Fetch document sets
    let query = supabase.from("document_sets").select(`
        id,
        name,
        description,
        is_public,
        is_up_to_date,
        cc_pair_descriptors:connector_document_set(
          id,
          name,
          connector:connectors(
            id,
            name,
            source,
            input_type
          )
        ),
        users:document_set_users(user_id),
        groups:document_set_groups(group_id)
      `)

    // If getEditable is true, only fetch document sets that the user can edit
    if (getEditable) {
      // For admin users, they can edit all document sets
      // This is a simplified approach - in a real app, you might have more complex permissions
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching document sets:", error)
      return NextResponse.json(
        { message: "Failed to fetch document sets", detail: error.message },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const documentSets = data.map((set: any) => ({
      ...set,
      users: set.users.map((u: any) => u.user_id),
      groups: set.groups.map((g: any) => g.group_id)
    }))

    return NextResponse.json(documentSets)
  } catch (error) {
    console.error("Error in document sets API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * API route for creating a document set
 * POST /api/admin/document-set
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin status
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { name, description, cc_pair_ids, is_public, users, groups } = body

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    // Create the document set
    const { data: documentSet, error } = await supabase
      .from("document_sets")
      .insert({
        name,
        description,
        is_public,
        is_up_to_date: true
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating document set:", error)
      return NextResponse.json(
        { message: "Failed to create document set", detail: error.message },
        { status: 500 }
      )
    }

    // Add connector pairs
    if (cc_pair_ids && cc_pair_ids.length > 0) {
      const connectorPairs = cc_pair_ids.map((id: number) => ({
        document_set_id: documentSet.id,
        connector_id: id
      }))

      const { error: connectorError } = await supabase
        .from("connector_document_set")
        .insert(connectorPairs)

      if (connectorError) {
        console.error("Error adding connector pairs:", connectorError)
        return NextResponse.json(
          {
            message: "Failed to add connector pairs",
            detail: connectorError.message
          },
          { status: 500 }
        )
      }
    }

    // Add users
    if (users && users.length > 0) {
      const userEntries = users.map((userId: string) => ({
        document_set_id: documentSet.id,
        user_id: userId
      }))

      const { error: userError } = await supabase
        .from("document_set_users")
        .insert(userEntries)

      if (userError) {
        console.error("Error adding users:", userError)
        return NextResponse.json(
          { message: "Failed to add users", detail: userError.message },
          { status: 500 }
        )
      }
    }

    // Add groups
    if (groups && groups.length > 0) {
      const groupEntries = groups.map((groupId: number) => ({
        document_set_id: documentSet.id,
        group_id: groupId
      }))

      const { error: groupError } = await supabase
        .from("document_set_groups")
        .insert(groupEntries)

      if (groupError) {
        console.error("Error adding groups:", groupError)
        return NextResponse.json(
          { message: "Failed to add groups", detail: groupError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(documentSet)
  } catch (error) {
    console.error("Error in document set creation API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * API route for updating a document set
 * PATCH /api/admin/document-set
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication and admin status
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { id, name, description, cc_pair_ids, is_public, users, groups } =
      body

    if (!id) {
      return NextResponse.json(
        { message: "Document set ID is required" },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    // Update the document set
    const { error } = await supabase
      .from("document_sets")
      .update({
        name,
        description,
        is_public
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating document set:", error)
      return NextResponse.json(
        { message: "Failed to update document set", detail: error.message },
        { status: 500 }
      )
    }

    // Update connector pairs
    // First, remove all existing pairs
    const { error: deleteConnectorError } = await supabase
      .from("connector_document_set")
      .delete()
      .eq("document_set_id", id)

    if (deleteConnectorError) {
      console.error("Error removing connector pairs:", deleteConnectorError)
      return NextResponse.json(
        {
          message: "Failed to update connector pairs",
          detail: deleteConnectorError.message
        },
        { status: 500 }
      )
    }

    // Then add the new ones
    if (cc_pair_ids && cc_pair_ids.length > 0) {
      const connectorPairs = cc_pair_ids.map((connectorId: number) => ({
        document_set_id: id,
        connector_id: connectorId
      }))

      const { error: connectorError } = await supabase
        .from("connector_document_set")
        .insert(connectorPairs)

      if (connectorError) {
        console.error("Error adding connector pairs:", connectorError)
        return NextResponse.json(
          {
            message: "Failed to add connector pairs",
            detail: connectorError.message
          },
          { status: 500 }
        )
      }
    }

    // Update users
    // First, remove all existing users
    const { error: deleteUserError } = await supabase
      .from("document_set_users")
      .delete()
      .eq("document_set_id", id)

    if (deleteUserError) {
      console.error("Error removing users:", deleteUserError)
      return NextResponse.json(
        { message: "Failed to update users", detail: deleteUserError.message },
        { status: 500 }
      )
    }

    // Then add the new ones
    if (users && users.length > 0) {
      const userEntries = users.map((userId: string) => ({
        document_set_id: id,
        user_id: userId
      }))

      const { error: userError } = await supabase
        .from("document_set_users")
        .insert(userEntries)

      if (userError) {
        console.error("Error adding users:", userError)
        return NextResponse.json(
          { message: "Failed to add users", detail: userError.message },
          { status: 500 }
        )
      }
    }

    // Update groups
    // First, remove all existing groups
    const { error: deleteGroupError } = await supabase
      .from("document_set_groups")
      .delete()
      .eq("document_set_id", id)

    if (deleteGroupError) {
      console.error("Error removing groups:", deleteGroupError)
      return NextResponse.json(
        {
          message: "Failed to update groups",
          detail: deleteGroupError.message
        },
        { status: 500 }
      )
    }

    // Then add the new ones
    if (groups && groups.length > 0) {
      const groupEntries = groups.map((groupId: number) => ({
        document_set_id: id,
        group_id: groupId
      }))

      const { error: groupError } = await supabase
        .from("document_set_groups")
        .insert(groupEntries)

      if (groupError) {
        console.error("Error adding groups:", groupError)
        return NextResponse.json(
          { message: "Failed to add groups", detail: groupError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in document set update API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
