export interface SlackBot {
  id: number;
  name: string;
  enabled: boolean;
  bot_token: string;
  app_token: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  groups?: number[];
  configs_count?: number;
}

export interface SlackBotConfig {
  id: number;
  bot_id: number;
  channel_id: string;
  channel_name: string;
  enabled: boolean;
  assistant_id?: string;
  created_at: string;
  updated_at: string;
  document_set_id?: number;
  persona_id?: number;
  is_default?: boolean;
}

export interface UserGroup {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

// User roles for authentication and authorization
export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

// Added type definitions for search/embedding functionality
export type ValidStatuses = 'success' | 'in_progress' | 'not_started' | 'failed' | 'canceled' | 'completed_with_errors' | 'invalid';

export interface ConnectorIndexingStatus<T = any, U = any> {
  connector_id: string;
  status: string;
  latest_index_attempt?: {
    id: number;
    status: ValidStatuses;
    error_message?: string;
    num_docs_indexed?: number;
    started_at?: string;
    completed_at?: string;
  };
  connector?: T;
  credential?: U;
}

export interface FailedConnectorIndexingStatus {
  connector_id: string;
  error_message: string;
  status: string;
  failed_at: string;
}

// Specification for popup/toast notifications
export interface PopupSpec {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export enum ValidSources {
  File = "file",
  GitHub = "github",
  Web = "web",
  Database = "database",
  Folder = "folder",
  Slack = "slack",
  Gmail = "gmail",
  Confluence = "confluence",
  NotApplicable = "not_applicable",
  IngestionApi = "ingestion_api"
}

export enum ConnectorCredentialPairStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  DELETING = "deleting",
  INVALID = "invalid"
}

export interface ConnectorSummary {
  count: number;
  active: number;
  public: number;
  totalDocsIndexed: number;
  errors: number;
}

export interface GroupedConnectorSummaries {
  [key: string]: ConnectorSummary;
}

export interface DetailedConnectorIndexingStatus<T, C> {
  cc_pair_id: number;
  name: string;
  cc_pair_status: ConnectorCredentialPairStatus;
  last_status: string;
  connector: {
    name: string;
    source: ValidSources;
    input_type: string;
    connector_specific_config: T;
    refresh_freq: number;
    prune_freq: number | null;
    indexing_start: Date;
    id: number;
    credential_ids: number[];
    access_type: string;
    time_created: string;
    time_updated: string;
  };
  credential: {
    id: number;
    name: string;
    source: ValidSources;
    user_id: string;
    time_created: string;
    time_updated: string;
    credential_json: C;
    admin_public: boolean;
  };
  access_type: string;
  docs_indexed: number;
  last_success: string;
  last_finished_status: string | null;
  latest_index_attempt: {
    error_msg: string | null;
  } | null;
  groups: string[];
}

export interface InvitedUserSnapshot {
  id: number;
  email: string;
  created_at: string;
}