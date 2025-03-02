import React from "react";
import { ValidSources } from "@/lib/types";
import {
  FiFile,
  FiGithub,
  FiGlobe,
  FiDatabase,
  FiFolder,
  FiSlack,
  FiMail,
  FiBookOpen,
  FiBox,
} from "react-icons/fi";

interface SourceIconProps {
  sourceType: ValidSources;
  iconSize?: number;
  className?: string;
}

export function SourceIcon({
  sourceType,
  iconSize = 24,
  className = "",
}: SourceIconProps) {
  const getIcon = () => {
    switch (sourceType) {
      case "file":
        return <FiFile size={iconSize} className={className} />;
      case "github":
        return <FiGithub size={iconSize} className={className} />;
      case "web":
        return <FiGlobe size={iconSize} className={className} />;
      case "database":
        return <FiDatabase size={iconSize} className={className} />;
      case "folder":
        return <FiFolder size={iconSize} className={className} />;
      case "slack":
        return <FiSlack size={iconSize} className={className} />;
      case "gmail":
        return <FiMail size={iconSize} className={className} />;
      case "confluence":
        return <FiBookOpen size={iconSize} className={className} />;
      default:
        return <FiBox size={iconSize} className={className} />;
    }
  };

  return getIcon();
} 