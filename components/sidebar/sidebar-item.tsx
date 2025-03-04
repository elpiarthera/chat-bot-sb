// Sidebar item component with conditional admin panel link
import React from "react"
import Link from "next/link"
import { IconSettings2 } from "@tabler/icons-react"

interface SidebarItemProps {
  userIsAdmin?: boolean
}

export function SidebarItem({ userIsAdmin = false }: SidebarItemProps) {
  return (
    <div className="sidebar-items">
      {userIsAdmin && (
        <Link href="/admin" className="sidebar-item">
          <IconSettings2 className="size-4" />
          <span>Admin Panel</span>
        </Link>
      )}
    </div>
  )
}
