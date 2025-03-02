import { NextResponse } from "next/server"

// Mock resource data for testing
const mockResources = [
  { id: 1, name: "Marketing Documents", type: "document_set" },
  { id: 2, name: "Brand Assets", type: "connector" },
  { id: 3, name: "Technical Documentation", type: "document_set" },
  { id: 4, name: "Code Repository", type: "connector" },
  { id: 5, name: "Sales Materials", type: "document_set" },
  { id: 6, name: "HR Policies", type: "document_set" },
  { id: 7, name: "Google Drive", type: "connector" },
  { id: 8, name: "Slack Archive", type: "connector" }
]

export async function GET() {
  // In a real implementation, fetch from database
  return NextResponse.json(mockResources)
}
