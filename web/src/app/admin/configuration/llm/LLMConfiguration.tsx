"use client";

import * as React from "react";
import { PlusCircle, InfoIcon, AlertCircle } from "lucide-react";

export function LLMConfiguration() {
  const [isAddingProvider, setIsAddingProvider] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-75"></div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-150"></div>
          </div>
          <span className="ml-2 text-sm text-gray-500">Loading LLM configuration...</span>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">
                Failed to load LLM configuration. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">LLM Providers</h2>
        <button 
          onClick={() => setIsAddingProvider(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Provider
        </button>
      </div>
      
      <div className="p-6 border rounded-lg">
        <div className="flex items-start space-x-4">
          <InfoIcon className="h-6 w-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-medium">No LLM providers configured</h3>
            <p className="text-muted-foreground mt-1">
              Add an LLM provider to enable AI-powered features like assistants and chat interfaces.
            </p>
            <button 
              onClick={() => setIsAddingProvider(true)} 
              className="mt-4 flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 