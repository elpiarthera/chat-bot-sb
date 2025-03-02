import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'error' | 'success' | 'warning';
}

const Text: React.FC<TextProps> = ({ 
  children,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    muted: 'text-gray-500 dark:text-gray-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <p className={cn(variantClasses[variant], className)}>
      {children}
    </p>
  );
};

export default Text;