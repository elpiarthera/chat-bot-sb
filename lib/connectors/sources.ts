import { SourceCategory, SourceMetadata } from "@/lib/types/connectors"

const sourceMetadata: SourceMetadata[] = [
  {
    internalName: "google_drive",
    displayName: "Google Drive",
    category: SourceCategory.Storage,
    adminUrl: "/admin/connectors/google-drive/new",
    description: "Connect to your Google Drive files and folders"
  },
  {
    internalName: "slack",
    displayName: "Slack",
    category: SourceCategory.Messaging,
    adminUrl: "/admin/connectors/slack/new",
    description: "Index messages and files from your Slack workspace"
  },
  {
    internalName: "notion",
    displayName: "Notion",
    category: SourceCategory.Wiki,
    adminUrl: "/admin/connectors/notion/new",
    description: "Connect to your Notion workspace pages and databases"
  },
  {
    internalName: "github",
    displayName: "GitHub",
    category: SourceCategory.CodeRepository,
    adminUrl: "/admin/connectors/github/new",
    description: "Index repositories, issues, and pull requests"
  },
  {
    internalName: "gitlab",
    displayName: "GitLab",
    category: SourceCategory.CodeRepository,
    adminUrl: "/admin/connectors/gitlab/new",
    description: "Connect to GitLab repositories and project resources"
  },
  {
    internalName: "trello",
    displayName: "Trello",
    category: SourceCategory.ProjectManagement,
    adminUrl: "/admin/connectors/trello/new",
    description: "Index boards, cards, and lists from your Trello workspace"
  },
  {
    internalName: "jira",
    displayName: "Jira",
    category: SourceCategory.ProjectManagement,
    adminUrl: "/admin/connectors/jira/new",
    description: "Connect to Jira projects, issues, and workflows"
  },
  {
    internalName: "zendesk",
    displayName: "Zendesk",
    category: SourceCategory.CustomerSupport,
    adminUrl: "/admin/connectors/zendesk/new",
    description: "Index tickets, articles, and customer conversations"
  },
  {
    internalName: "intercom",
    displayName: "Intercom",
    category: SourceCategory.CustomerSupport,
    adminUrl: "/admin/connectors/intercom/new",
    description: "Connect to customer conversations and help articles"
  },
  {
    internalName: "confluence",
    displayName: "Confluence",
    category: SourceCategory.Wiki,
    adminUrl: "/admin/connectors/confluence/new",
    description: "Index Confluence spaces, pages, and attachments"
  },
  {
    internalName: "sharepoint",
    displayName: "SharePoint",
    category: SourceCategory.Storage,
    adminUrl: "/admin/connectors/sharepoint/new",
    description: "Connect to SharePoint sites, lists, and documents"
  },
  {
    internalName: "onedrive",
    displayName: "OneDrive",
    category: SourceCategory.Storage,
    adminUrl: "/admin/connectors/onedrive/new",
    description: "Index files and folders from OneDrive"
  }
]

export function listSourceMetadata(): SourceMetadata[] {
  return sourceMetadata
}

export function getSourceMetadata(
  internalName: string
): SourceMetadata | undefined {
  return sourceMetadata.find(source => source.internalName === internalName)
}

export function getSourceCategoryDescription(category: SourceCategory): string {
  switch (category) {
    case SourceCategory.Messaging:
      return "Integrate with messaging and communication platforms."
    case SourceCategory.ProjectManagement:
      return "Link to project management and task tracking tools."
    case SourceCategory.CustomerSupport:
      return "Connect to customer support and helpdesk systems."
    case SourceCategory.CodeRepository:
      return "Integrate with code repositories and version control systems."
    case SourceCategory.Storage:
      return "Connect to cloud storage and file hosting services."
    case SourceCategory.Wiki:
      return "Link to wiki and knowledge base platforms."
    case SourceCategory.Other:
      return "Connect to other miscellaneous knowledge sources."
    default:
      return "Connect to various knowledge sources."
  }
}
