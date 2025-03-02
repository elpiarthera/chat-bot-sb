import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    if (!isAdmin) {
      redirect("/")
    }
  } catch (error) {
    console.error("Error checking admin permissions:", error)
    redirect("/")
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
