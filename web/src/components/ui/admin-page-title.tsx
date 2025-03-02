import React from 'react';

interface AdminPageTitleProps {
  title: string;
  description?: string;
}

export function AdminPageTitle({ title, description }: AdminPageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
} 