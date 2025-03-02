import { ValidSources } from "@/lib/types";

export function getSourceDisplayName(source: ValidSources): string {
  switch (source) {
    case "file":
      return "File";
    case "github":
      return "GitHub";
    case "web":
      return "Web";
    case "database":
      return "Database";
    case "folder":
      return "Folder";
    case "slack":
      return "Slack";
    case "gmail":
      return "Gmail";
    case "confluence":
      return "Confluence";
    default:
      return source.charAt(0).toUpperCase() + source.slice(1);
  }
}