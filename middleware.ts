import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { customSupabase } from "@/lib/supabase/custom-client"

export async function middleware(request: NextRequest) {
  const i18nResult = i18nRouter(request, i18nConfig)
  if (i18nResult) return i18nResult

  try {
    const { supabase, response } = createClient(request)

    const session = await supabase.auth.getSession()
    const userId = session.data.session?.user.id;

    const redirectToChat = session && request.nextUrl.pathname === "/"

    if (redirectToChat && userId) {
      const { data: homeWorkspace, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", userId)
        .eq("is_home", true)
        .single()

      if (!homeWorkspace) {
        throw new Error(error?.message)
      }

      return NextResponse.redirect(
        new URL(`/${homeWorkspace.id}/chat`, request.url)
      )
    }

    // Check for workspace access permissions
    const workspacePathMatch = request.nextUrl.pathname.match(/^\/([^\/]+)/)
    if (session && workspacePathMatch && workspacePathMatch[1] && userId) {
      const workspaceId = workspacePathMatch[1]
      
      // Skip this check for auth and api routes
      if (!request.nextUrl.pathname.startsWith("/auth") && 
          !request.nextUrl.pathname.startsWith("/api")) {
        
        // Check if user owns the workspace
        const { data: ownedWorkspace } = await supabase
          .from("workspaces")
          .select("*")
          .eq("id", workspaceId)
          .eq("user_id", userId)
          .single()
        
        if (!ownedWorkspace) {
          // If not owned, check if shared with the user
          const { data: sharedWorkspace } = await customSupabase
            .from("workspace_users")
            .select("*")
            .eq("workspace_id", workspaceId)
            .eq("user_id", userId)
            .single()
          
          if (!sharedWorkspace) {
            // User doesn't have access to this workspace
            const { data: homeWorkspace } = await supabase
              .from("workspaces")
              .select("*")
              .eq("user_id", userId)
              .eq("is_home", true)
              .single()
            
            if (homeWorkspace) {
              return NextResponse.redirect(
                new URL(`/${homeWorkspace.id}/chat`, request.url)
              )
            }
          }
        }
      }
    }

    return response
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
