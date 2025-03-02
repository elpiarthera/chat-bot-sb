import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/browser-client"
import { customSupabase } from "@/lib/supabase/custom-client"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const userId = requestUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Create a Supabase client using the new approach
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Use raw SQL to get around TypeScript limitations
    const { data, error } = await supabase.rpc("get_shared_workspaces", {
      user_id_param: userId
    })

    if (error) {
      console.error("Error fetching shared workspaces:", error)

      // Fallback to direct query if RPC not available
      const { data: sharedWorkspaces, error: queryError } = await customSupabase
        .from("workspace_users")
        .select("workspace_id")
        .eq("user_id", userId)

      if (queryError) {
        return NextResponse.json({ error: queryError.message }, { status: 500 })
      }

      if (sharedWorkspaces && sharedWorkspaces.length > 0) {
        const workspaceIds = sharedWorkspaces.map(item => item.workspace_id)
        const { data: workspaces, error: workspacesError } = await supabase
          .from("workspaces")
          .select("*")
          .in("id", workspaceIds)

        if (workspacesError) {
          return NextResponse.json(
            { error: workspacesError.message },
            { status: 500 }
          )
        }

        return NextResponse.json(workspaces)
      }

      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in shared workspaces API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
