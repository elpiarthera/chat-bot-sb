"use client"

import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { CardSection } from "@/components/admin/card-section"
import {
  IconDashboard,
  IconUsers,
  IconMessage,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC } from "react"

const StatCard: FC<{
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
}> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="text-muted-foreground size-4">{icon}</div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <AdminPageTitle
        icon={<IconDashboard size={28} />}
        title="Admin Dashboard"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={24}
          description="Active users in the system"
          icon={<IconUsers size={16} />}
        />
        <StatCard
          title="Conversations"
          value={142}
          description="Total chat conversations"
          icon={<IconMessage size={16} />}
        />
        <StatCard
          title="Assistants"
          value={8}
          description="Custom AI assistants"
          icon={<IconRobotFace size={16} />}
        />
        <StatCard
          title="Models"
          value={12}
          description="Configured AI models"
          icon={<IconSparkles size={16} />}
        />
      </div>
      <CardSection>
        <h2 className="mb-4 text-xl font-semibold">
          Welcome to the Admin Dashboard
        </h2>
        <p className="text-muted-foreground mb-4">
          Manage your workspace settings, users, and AI configurations from this
          central dashboard.
        </p>
        <p>
          This admin panel allows you to configure global settings for your AI
          chatbot interface. Use the sidebar to navigate between different
          sections.
        </p>
      </CardSection>
    </div>
  )
}
