import { NextResponse } from "next/server"
import { UserGroupCreation } from "@/lib/types/groups"
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants"

// Mock data for demonstration
const mockGroups = [
  {
    id: 1,
    name: "Marketing Team",
    users: [
      { id: "user1", email: "user1@example.com", name: "User One" },
      { id: "user2", email: "user2@example.com", name: "User Two" }
    ],
    resources: [
      { id: 1, name: "Marketing Documents", type: "document_set" },
      { id: 2, name: "Brand Assets", type: "connector" }
    ],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-15T00:00:00Z"
  },
  {
    id: 2,
    name: "Engineering Team",
    users: [
      { id: "user3", email: "user3@example.com", name: "User Three" },
      { id: "user4", email: "user4@example.com", name: "User Four" }
    ],
    resources: [
      { id: 3, name: "Technical Documentation", type: "document_set" },
      { id: 4, name: "Code Repository", type: "connector" }
    ],
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-15T00:00:00Z"
  }
]

export async function GET() {
  // Gated behind enterprise features
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return NextResponse.json(
      { error: "User groups are only available for Enterprise Edition" },
      { status: 403 }
    )
  }

  // In a real implementation, fetch from database
  return NextResponse.json(mockGroups)
}

export async function POST(request: Request) {
  // Gated behind enterprise features
  if (!SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    return NextResponse.json(
      { error: "User groups are only available for Enterprise Edition" },
      { status: 403 }
    )
  }

  try {
    const data: UserGroupCreation = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      )
    }

    // In a real implementation, save to database
    // For now, return a mock response
    return NextResponse.json(
      {
        id: Math.floor(Math.random() * 1000) + 3,
        name: data.name,
        user_ids: data.user_ids,
        resource_ids: data.resource_ids,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user group:", error)
    return NextResponse.json(
      { error: "Failed to create user group" },
      { status: 500 }
    )
  }
}
