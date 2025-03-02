import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * API route for fetching documents with pagination and search
 * GET /api/admin/documents
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
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""

    // Calculate pagination
    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from("documents").select("*", { count: "exact" })

    // Add search filter if provided
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching documents:", error)
      return NextResponse.json(
        { message: "Failed to fetch documents", detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit
    })
  } catch (error) {
    console.error("Error in documents API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
