import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  backUrl,
  backLabel = 'Back',
  actions,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex flex-col">
        {backUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 w-fit"
            onClick={() => router.push(backUrl)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {backLabel}
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 mt-2 md:mt-0">{actions}</div>}
    </div>
  );
};

export default AdminPageHeader; 