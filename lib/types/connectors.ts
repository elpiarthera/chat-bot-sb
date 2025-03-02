export enum SourceCategory {
  Messaging = "Messaging",
  ProjectManagement = "Project Management",
  CustomerSupport = "Customer Support",
  CodeRepository = "Code Repository",
  Storage = "Storage",
  Wiki = "Wiki",
  Other = "Other"
}

export interface SourceMetadata {
  internalName: string
  displayName: string
  category: SourceCategory
  adminUrl: string
  iconUrl?: string
  description?: string
  isAvailable?: boolean
}

export interface ConnectorStatus {
  id: number
  name: string
  source_type: string
  last_synced?: string
  last_sync_status?: "success" | "error" | "in_progress" | "not_started"
  document_count: number
  is_up_to_date?: boolean
  is_up_for_deletion?: boolean
}
