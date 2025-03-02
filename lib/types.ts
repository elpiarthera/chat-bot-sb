// User roles enum
export enum UserRole {
  ADMIN = "admin",
  BASIC = "basic",
  POWER_USER = "power_user",
  SLACK_USER = "slack_user",
  EXT_PERM_USER = "ext_perm_user",
  LIMITED = "limited"
}

// User role display labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.BASIC]: "Basic User",
  [UserRole.POWER_USER]: "Power User",
  [UserRole.SLACK_USER]: "Slack User",
  [UserRole.EXT_PERM_USER]: "External User",
  [UserRole.LIMITED]: "Limited"
}

// User interface
export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  is_active: boolean
  password_configured?: boolean
  created_at?: string
}

// Snapshot of an invited user
export interface InvitedUserSnapshot {
  email: string
  role: UserRole
}

// Specification for popup/toast notifications
export interface PopupSpec {
  message: string
  type: "success" | "error" | "warning" | "info"
  details?: string
}

export interface Connector {
  id: number
  name: string
  source: string
  input_type: string
}

export interface CCPairDescriptor {
  id: number
  name: string
  connector: Connector
}

export interface DocumentSet {
  id: number
  name: string
  description: string
  is_public: boolean
  is_up_to_date: boolean
  cc_pair_descriptors: CCPairDescriptor[]
  users: string[]
  groups: number[]
}

// Document with boost status information
export interface DocumentBoostStatus {
  document_id: string
  name: string
  boost: number
  hidden: boolean
  created_at: string
  updated_at: string
  type: string
  size: number
}
