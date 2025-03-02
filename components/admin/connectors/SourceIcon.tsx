import { FC } from "react"
import Image from "next/image"
import {
  MessageCircle,
  FileText,
  Headphones,
  Code,
  HardDrive,
  Book,
  Database,
  Github,
  Trello,
  FileQuestion,
  Mail,
  Folder
} from "lucide-react"
import { SourceCategory } from "@/lib/types/connectors"

interface SourceIconProps {
  sourceType: string
  iconSize?: number
  className?: string
}

export const SourceIcon: FC<SourceIconProps> = ({
  sourceType,
  iconSize = 24,
  className = ""
}) => {
  // First look for custom icons by source type
  switch (sourceType.toLowerCase()) {
    case "google_drive":
      return (
        <div className={className}>
          <Image
            src="/icons/google-drive.svg"
            alt="Google Drive"
            width={iconSize}
            height={iconSize}
          />
        </div>
      )
    case "slack":
      return (
        <div className={className}>
          <Image
            src="/icons/slack.svg"
            alt="Slack"
            width={iconSize}
            height={iconSize}
          />
        </div>
      )
    case "notion":
      return (
        <div className={className}>
          <Image
            src="/icons/notion.svg"
            alt="Notion"
            width={iconSize}
            height={iconSize}
          />
        </div>
      )
    case "github":
      return <Github size={iconSize} className={className} />
    case "trello":
      return <Trello size={iconSize} className={className} />
    case "zendesk":
      return <Headphones size={iconSize} className={className} />
    case "gmail":
    case "outlook":
      return <Mail size={iconSize} className={className} />
    case "sharepoint":
    case "onedrive":
      return <Folder size={iconSize} className={className} />
    // Add more custom icons...
  }

  // Fallback to category-based icons
  switch (getSourceCategory(sourceType)) {
    case SourceCategory.Messaging:
      return <MessageCircle size={iconSize} className={className} />
    case SourceCategory.ProjectManagement:
      return <FileText size={iconSize} className={className} />
    case SourceCategory.CustomerSupport:
      return <Headphones size={iconSize} className={className} />
    case SourceCategory.CodeRepository:
      return <Code size={iconSize} className={className} />
    case SourceCategory.Storage:
      return <HardDrive size={iconSize} className={className} />
    case SourceCategory.Wiki:
      return <Book size={iconSize} className={className} />
    default:
      return <Database size={iconSize} className={className} />
  }
}

function getSourceCategory(sourceType: string): SourceCategory {
  // Map source types to categories if not using metadata function
  // This is a simple implementation; in practice, you'd use your metadata service
  const categoryMap: Record<string, SourceCategory> = {
    google_drive: SourceCategory.Storage,
    slack: SourceCategory.Messaging,
    notion: SourceCategory.Wiki,
    github: SourceCategory.CodeRepository,
    gitlab: SourceCategory.CodeRepository,
    bitbucket: SourceCategory.CodeRepository,
    trello: SourceCategory.ProjectManagement,
    jira: SourceCategory.ProjectManagement,
    asana: SourceCategory.ProjectManagement,
    zendesk: SourceCategory.CustomerSupport,
    intercom: SourceCategory.CustomerSupport,
    gmail: SourceCategory.Messaging,
    outlook: SourceCategory.Messaging,
    sharepoint: SourceCategory.Storage,
    onedrive: SourceCategory.Storage,
    dropbox: SourceCategory.Storage,
    confluence: SourceCategory.Wiki
    // Add more mappings...
  }

  return categoryMap[sourceType.toLowerCase()] || SourceCategory.Other
}
