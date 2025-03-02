import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  console.log("Admin layout rendering attempt")

  try {
    // Verify user is admin
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return redirect("/login")
    }

    // Check if user has admin role (the implementation depends on your user roles system)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return redirect("/") // Redirect to home if not admin
    }

    console.log("Admin auth check starting")
    console.log("Admin auth successful")

    return (
      <div className="flex h-dvh">
        {/* Admin sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    )
  } catch (error) {
    console.error("Admin layout auth error:", error)
    return redirect("/")
  }
}
