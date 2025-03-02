/**
 * Interface for a connector that integrates with external data sources
 */
export interface Connector<T = any> {
  id: string;
  name: string;
  source: string;
  input_type: string;
  credential_id?: string;
  connector_specific_config: T;
  refresh_freq?: number;
  disabled?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Types of connectors supported by the system
 */
export enum ConnectorType {
  FILE = "file",
  WEBSITE = "website",
  NOTION = "notion",
  GOOGLE_DRIVE = "google_drive",
  SLACK = "slack",
  GITHUB = "github",
  CONFLUENCE = "confluence",
  JIRA = "jira",
  ZENDESK = "zendesk",
  SALESFORCE = "salesforce",
  INTERCOM = "intercom",
  FRESHDESK = "freshdesk",
  LINEAR = "linear",
  HUBSPOT = "hubspot",
  CUSTOM = "custom"
}