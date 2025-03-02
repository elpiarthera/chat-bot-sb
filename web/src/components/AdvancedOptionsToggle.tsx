import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedOptionsToggleProps {
  showAdvancedOptions: boolean;
  setShowAdvancedOptions: (show: boolean) => void;
  title?: string;
  className?: string;
}

export function AdvancedOptionsToggle({
  showAdvancedOptions,
  setShowAdvancedOptions,
  title = 'Advanced Options',
  className = '',
}: AdvancedOptionsToggleProps) {
  return (
    <div className={`my-6 ${className}`}>
      <button
        type="button"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
      >
        {showAdvancedOptions ? (
          <ChevronUp className="mr-1 h-4 w-4" />
        ) : (
          <ChevronDown className="mr-1 h-4 w-4" />
        )}
        {title}
      </button>
      
      {showAdvancedOptions && (
        <div className="mt-3 border-t pt-4">
          {/* Content will be rendered by parent component */}
        </div>
      )}
    </div>
  );
}