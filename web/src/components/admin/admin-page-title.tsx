import React, { ReactNode } from "react";
import Text from "@/components/ui/text";

interface AdminPageTitleProps {
  title: ReactNode;
  icon?: ReactNode;
  description?: string;
  farRightElement?: ReactNode;
}

export const AdminPageTitle: React.FC<AdminPageTitleProps> = ({
  title,
  icon,
  description,
  farRightElement,
}) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <Text className="text-muted-foreground mt-1 max-w-2xl">
              {description}
            </Text>
          )}
        </div>
      </div>
      {farRightElement && <div>{farRightElement}</div>}
    </div>
  );
}; 