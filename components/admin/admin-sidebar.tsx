"use client"

import { cn } from "@/lib/utils"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconDashboard,
  IconDeviceDesktop,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSettings,
  IconSparkles,
  IconUser,
  IconUsers,
  IconCreditCard
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FC } from "react"

interface AdminSidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
  hasError?: boolean
  enterpriseOnly?: boolean
}

const AdminSidebarItem: FC<AdminSidebarItemProps> = ({
  icon,
  label,
  href,
  active = false,
  hasError = false,
  enterpriseOnly = false
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 hover:text-accent-foreground",
        hasError && "border-l-2 border-red-500",
        enterpriseOnly && "text-purple-800 dark:text-purple-200"
      )}
    >
      <div className="flex size-5 items-center justify-center">{icon}</div>
      <span>{label}</span>
      {enterpriseOnly && (
        <span className="ml-auto rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Enterprise
        </span>
      )}
    </Link>
  )
}

interface AdminSidebarSectionProps {
  title: string
  children: React.ReactNode
}

const AdminSidebarSection: FC<AdminSidebarSectionProps> = ({
  title,
  children
}) => {
  return (
    <div className="py-2">
      <h2 className="text-muted-foreground mb-2 px-4 text-xs font-semibold uppercase tracking-wider">
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export const AdminSidebar: FC = () => {
  const pathname = usePathname()
  return (
    <div className="bg-background flex h-full flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/admin"
          className="flex items-center space-x-2 font-semibold"
        >
          <IconSettings className="size-6" />
          <span>Admin Dashboard</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <AdminSidebarSection title="Overview">
          <AdminSidebarItem
            icon={<IconDashboard size={18} />}
            label="Dashboard"
            href="/admin"
            active={pathname === "/admin"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="Workspace">
          <AdminSidebarItem
            icon={<IconSettings size={18} />}
            label="Workspace Settings"
            href="/admin/workspace"
            active={pathname === "/admin/workspace"}
          />
          <AdminSidebarItem
            icon={<IconMessage size={18} />}
            label="Chat Settings"
            href="/admin/chat"
            active={pathname === "/admin/chat"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="User Management">
          <AdminSidebarItem
            icon={<IconUser size={18} />}
            label="Users"
            href="/admin/users"
            active={pathname === "/admin/users"}
          />
          <AdminSidebarItem
            icon={<IconUsers size={18} />}
            label="Groups"
            href="/admin/groups"
            active={pathname === "/admin/groups"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="Content">
          <AdminSidebarItem
            icon={<IconFile size={18} />}
            label="Document Management"
            href="/admin/documents"
            active={pathname === "/admin/documents"}
          />
          <AdminSidebarItem
            icon={<IconBooks size={18} />}
            label="Collections"
            href="/admin/collections"
            active={pathname === "/admin/collections"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="AI Configuration">
          <AdminSidebarItem
            icon={<IconSparkles size={18} />}
            label="Models"
            href="/admin/models"
            active={pathname === "/admin/models"}
          />
          <AdminSidebarItem
            icon={<IconRobotFace size={18} />}
            label="Assistants"
            href="/admin/assistants"
            active={pathname === "/admin/assistants"}
          />
          <AdminSidebarItem
            icon={<IconBolt size={18} />}
            label="Tools"
            href="/admin/tools"
            active={pathname === "/admin/tools"}
          />
          <AdminSidebarItem
            icon={<IconPencil size={18} />}
            label="Prompts"
            href="/admin/prompts"
            active={pathname === "/admin/prompts"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="System">
          <AdminSidebarItem
            icon={<IconDeviceDesktop size={18} />}
            label="System Status"
            href="/admin/status"
            active={pathname === "/admin/status"}
          />
          <AdminSidebarItem
            icon={<IconAdjustmentsHorizontal size={18} />}
            label="Configuration"
            href="/admin/configuration"
            active={pathname === "/admin/configuration"}
          />
        </AdminSidebarSection>

        <AdminSidebarSection title="Enterprise Features">
          <AdminSidebarItem
            icon={<IconCreditCard size={18} />}
            label="Billing & Subscription"
            href="/admin/(enterprise-features)/billing"
            active={pathname === "/admin/(enterprise-features)/billing"}
            enterpriseOnly={true}
          />
        </AdminSidebarSection>
      </div>
    </div>
  )
}
