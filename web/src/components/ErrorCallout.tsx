import React from "react";

interface ErrorCalloutProps {
  errorTitle: string;
  errorMsg: string;
}

export function ErrorCallout({ errorTitle, errorMsg }: ErrorCalloutProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
      <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
      <p className="text-sm">{errorMsg}</p>
    </div>
  );
} 